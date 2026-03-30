#!/usr/bin/env node
/**
 * compress-frames.mjs
 *
 * Reads every image in public/frames/, converts to highly-optimized WebP at
 * the SAME resolution with near-lossless quality, and writes the output back
 * to the same folder. Originals are backed up to public/frames/_originals/.
 *
 * Usage:
 *   node scripts/compress-frames.mjs            # default quality 82
 *   node scripts/compress-frames.mjs --quality 75
 *   node scripts/compress-frames.mjs --quality 90
 *   node scripts/compress-frames.mjs --no-backup # skip backing up originals
 */

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FRAMES_DIR = path.join(ROOT, 'public', 'frames');
const BACKUP_DIR = path.join(FRAMES_DIR, '_originals');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp']);

const args = process.argv.slice(2);
const qualityIdx = args.indexOf('--quality');
const QUALITY = qualityIdx !== -1 ? parseInt(args[qualityIdx + 1], 10) : 82;
const SKIP_BACKUP = args.includes('--no-backup');
const CONCURRENCY = 8;

if (QUALITY < 1 || QUALITY > 100 || isNaN(QUALITY)) {
  console.error('Quality must be between 1 and 100.');
  process.exit(1);
}

async function main() {
  if (!fs.existsSync(FRAMES_DIR)) {
    console.error(`Frames directory not found: ${FRAMES_DIR}`);
    console.error('Make sure public/frames/ exists and contains your frame images.');
    process.exit(1);
  }

  const files = fs.readdirSync(FRAMES_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXTS.has(ext) && !fs.statSync(path.join(FRAMES_DIR, f)).isDirectory();
  });

  if (files.length === 0) {
    console.error('No image files found in public/frames/.');
    console.error('Supported formats: ' + [...IMAGE_EXTS].join(', '));
    process.exit(1);
  }

  console.log(`\n  Found ${files.length} images in public/frames/`);
  console.log(`  WebP quality: ${QUALITY}`);
  console.log(`  Backup originals: ${SKIP_BACKUP ? 'no' : 'yes'}\n`);

  if (!SKIP_BACKUP) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  let totalOriginal = 0;
  let totalCompressed = 0;
  let processed = 0;
  let skipped = 0;

  async function processFile(filename) {
    const inputPath = path.join(FRAMES_DIR, filename);
    const baseName = path.parse(filename).name;
    const outputPath = path.join(FRAMES_DIR, `${baseName}.webp`);
    const ext = path.extname(filename).toLowerCase();
    const isAlreadyWebp = ext === '.webp';

    const originalSize = fs.statSync(inputPath).size;
    totalOriginal += originalSize;

    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      const buffer = await image
        .webp({
          quality: QUALITY,
          effort: 6,
          smartSubsample: true,
          preset: 'photo',
        })
        .toBuffer();

      const compressedSize = buffer.length;

      if (isAlreadyWebp && compressedSize >= originalSize) {
        totalCompressed += originalSize;
        skipped++;
        return;
      }

      if (!SKIP_BACKUP && !isAlreadyWebp) {
        fs.copyFileSync(inputPath, path.join(BACKUP_DIR, filename));
      }

      fs.writeFileSync(outputPath, buffer);

      if (!isAlreadyWebp && inputPath !== outputPath) {
        fs.unlinkSync(inputPath);
      }

      totalCompressed += compressedSize;
      processed++;

      const savings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);
      const dimStr = `${metadata.width}x${metadata.height}`;
      process.stdout.write(
        `  [${processed + skipped}/${files.length}] ${filename} → ${baseName}.webp  ` +
          `${dimStr}  ${fmt(originalSize)} → ${fmt(compressedSize)}  (−${savings}%)\n`
      );
    } catch (err) {
      console.error(`  FAILED: ${filename} — ${err.message}`);
      totalCompressed += originalSize;
    }
  }

  // Process in batches for controlled concurrency
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(processFile));
  }

  const totalSavings = totalOriginal > 0
    ? (((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(1)
    : '0.0';

  console.log('\n  ─────────────────────────────────────────');
  console.log(`  Processed: ${processed}  Skipped: ${skipped}`);
  console.log(`  Total:     ${fmt(totalOriginal)} → ${fmt(totalCompressed)}  (−${totalSavings}%)`);
  if (!SKIP_BACKUP && processed > 0) {
    console.log(`  Backups:   ${BACKUP_DIR}`);
  }
  console.log('');

  if (processed > 0) {
    console.log('  Update your config to use .webp:');
    console.log('    extension: \'.webp\'  (in src/config/demo-media.ts)\n');
  }
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
