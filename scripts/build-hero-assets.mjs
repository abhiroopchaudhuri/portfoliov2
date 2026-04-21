#!/usr/bin/env node
/**
 * Build tiered hero assets from a source video or image sequence.
 *
 * Emits into ./public/hero/:
 *   - hero.desktop.mp4       (tier HIGH: 1280-wide H.264, every frame a keyframe)
 *   - hero.tablet.mp4        (tier MID:  960-wide H.264, every frame a keyframe)
 *   - hero.atlas.webp        (tier LOW:  480-wide vertical sprite sheet, WebP)
 *   - hero.atlas.avif        (tier LOW:  same, AVIF for browsers that support it)
 *   - hero.poster.jpg        (< 30 KB single JPEG; paints before any JS)
 *   - hero-manifest.json     (tiny JSON telling the runtime what to load)
 *
 * Colour treatment is baked in (grayscale → sepia → hue-rotate 350 → saturate 300)
 * so the runtime CSS filter can be removed.
 *
 * All tools are resolved from npm (no global installs):
 *   - @ffmpeg-installer/ffmpeg (ffmpeg binary)
 *   - @ffprobe-installer/ffprobe (ffprobe binary)
 *   - sharp (WebP/AVIF encoding + vertical stitch)
 *
 * Usage:
 *   node scripts/build-hero-assets.mjs <source-video-or-glob>
 *   npm run build:hero -- <source-video-or-glob>
 *
 * Examples:
 *   node scripts/build-hero-assets.mjs public/hero/hero.mp4
 *   node scripts/build-hero-assets.mjs 'public/frames/_originals/*.webp'
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import sharp from 'sharp';

const FFMPEG = ffmpegInstaller.path;
const FFPROBE = ffprobeInstaller.path;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/hero');
const TMP_DIR = resolve(ROOT, 'tmp/hero-build');

// ──────────────────────────────────────────────────────────────────────────
// Tunables
// ──────────────────────────────────────────────────────────────────────────

const TIER_HIGH  = { width: 1280, crf: 24, profile: 'high' };
const TIER_MID   = { width: 960,  crf: 26, profile: 'main' };
const ATLAS_WIDTH = 480;
const ATLAS_FRAMES = 60;
const ATLAS_WEBP_Q = 72;
const ATLAS_AVIF_Q = 50;
const POSTER_WIDTH = 960;

/**
 * Colour treatment bake — matches the runtime CSS:
 *   filter: grayscale(100%) sepia(100%) hue-rotate(350deg) saturate(300%)
 */
const COLOUR_FILTER =
  'hue=s=0,' +
  'colorchannelmixer=' +
    'rr=0.393:rg=0.769:rb=0.189:' +
    'gr=0.349:gg=0.686:gb=0.168:' +
    'br=0.272:bg=0.534:bb=0.131,' +
  'hue=h=-10,' +
  'eq=saturation=3';

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function run(cmd, args) {
  console.log(`\n$ ${cmd.split('/').pop()} ${args.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')}`);
  execFileSync(cmd, args, { stdio: 'inherit' });
}

function ensureDirs() {
  mkdirSync(OUT_DIR, { recursive: true });
  rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(TMP_DIR, { recursive: true });
}

function isGlob(s) {
  return s.includes('*') || s.includes('?');
}

function probeDuration(path) {
  const out = execFileSync(FFPROBE, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    path,
  ], { encoding: 'utf8' });
  const d = parseFloat(out.trim());
  if (!isFinite(d) || d <= 0) throw new Error(`Could not probe duration of ${path}`);
  return d;
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}M`;
}

// ──────────────────────────────────────────────────────────────────────────
// Pipeline steps
// ──────────────────────────────────────────────────────────────────────────

function stepIntermediate(source) {
  const out = resolve(TMP_DIR, 'intermediate.mp4');
  const inputArgs = isGlob(source)
    ? ['-pattern_type', 'glob', '-framerate', '30', '-i', source]
    : ['-i', source];
  run(FFMPEG, [
    '-y', ...inputArgs,
    '-vf', COLOUR_FILTER,
    '-c:v', 'libx264', '-qp', '0', '-preset', 'veryfast',
    '-pix_fmt', 'yuv420p',
    '-an',
    out,
  ]);
  return out;
}

function stepTier(intermediate, tier, outName) {
  const out = resolve(OUT_DIR, outName);
  run(FFMPEG, [
    '-y', '-i', intermediate,
    '-vf', `scale=${tier.width}:-2,fps=30`,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', String(tier.crf),
    '-profile:v', tier.profile, '-pix_fmt', 'yuv420p',
    '-g', '1', '-keyint_min', '1',
    '-x264-params', 'keyint=1:min-keyint=1:scenecut=0',
    '-movflags', '+faststart',
    '-an',
    out,
  ]);
  return out;
}

async function stepAtlas(intermediate) {
  const duration = probeDuration(intermediate);
  const frameRate = ATLAS_FRAMES / duration;

  // 1. Extract N evenly spaced PNG frames at atlas resolution.
  run(FFMPEG, [
    '-y', '-i', intermediate,
    '-vf', `scale=${ATLAS_WIDTH}:-2,fps=${frameRate.toFixed(6)}`,
    '-frames:v', String(ATLAS_FRAMES),
    '-start_number', '0',
    resolve(TMP_DIR, 'frame-%03d.png'),
  ]);

  // 2. Collect the actual files ffmpeg produced (usually 000..N-1 but we glob
  //    to be defensive about rounding).
  const allFrames = readdirSync(TMP_DIR)
    .filter((f) => /^frame-\d+\.png$/.test(f))
    .sort();
  if (allFrames.length === 0) throw new Error('No frames extracted');
  const frameCount = Math.min(allFrames.length, ATLAS_FRAMES);
  const framePaths = allFrames.slice(0, frameCount).map((f) => resolve(TMP_DIR, f));

  // 3. Measure sample frame dims.
  const sampleMeta = await sharp(framePaths[0]).metadata();
  const fw = sampleMeta.width;
  const fh = sampleMeta.height;
  if (!fw || !fh) throw new Error('Could not read frame dimensions');

  // 4. Compose the vertical atlas with sharp.
  const atlasHeight = fh * frameCount;
  const composites = await Promise.all(framePaths.map(async (p, i) => ({
    input: await sharp(p).toBuffer(),
    top: i * fh,
    left: 0,
  })));

  const atlasWebp = resolve(OUT_DIR, 'hero.atlas.webp');
  const atlasAvif = resolve(OUT_DIR, 'hero.atlas.avif');

  const baseAtlas = sharp({
    create: {
      width: fw,
      height: atlasHeight,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  }).composite(composites);

  // Keep a PNG buffer in memory so both encoders can read the same source.
  const atlasPngBuf = await baseAtlas.png().toBuffer();

  await sharp(atlasPngBuf).webp({ quality: ATLAS_WEBP_Q, effort: 6 }).toFile(atlasWebp);

  let atlasAvifName;
  try {
    await sharp(atlasPngBuf).avif({ quality: ATLAS_AVIF_Q, effort: 4 }).toFile(atlasAvif);
    atlasAvifName = 'hero.atlas.avif';
  } catch (e) {
    console.warn('\n[hero-build] AVIF encode failed, continuing without:', e.message);
  }

  return { width: fw, frameHeight: fh, frameCount, atlasAvifName };
}

function stepPoster(intermediate) {
  const duration = probeDuration(intermediate);
  const t = Math.max(0, duration * 0.5);
  const out = resolve(OUT_DIR, 'hero.poster.jpg');
  run(FFMPEG, [
    '-y', '-ss', t.toFixed(3), '-i', intermediate,
    '-vf', `scale=${POSTER_WIDTH}:-2`,
    '-frames:v', '1', '-q:v', '4',
    out,
  ]);
}

function writeManifest(atlas) {
  const manifest = {
    width: atlas.width,
    frameHeight: atlas.frameHeight,
    frameCount: atlas.frameCount,
    atlasUrl: '/hero/hero.atlas.webp',
    ...(atlas.atlasAvifName ? { atlasUrlAvif: `/hero/${atlas.atlasAvifName}` } : {}),
    colourBaked: true,
  };
  const out = resolve(OUT_DIR, 'hero-manifest.json');
  writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\n[hero-build] wrote manifest: ${out}`);
}

function report() {
  console.log('\n[hero-build] output sizes:');
  const files = readdirSync(OUT_DIR).sort();
  for (const f of files) {
    const s = statSync(resolve(OUT_DIR, f));
    console.log(`  ${humanSize(s.size).padStart(8)}  ${f}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────

async function main() {
  const source = process.argv[2];
  if (!source) {
    console.error('usage: node scripts/build-hero-assets.mjs <source-video-or-glob>');
    process.exit(1);
  }
  if (!isGlob(source) && !existsSync(source)) {
    console.error(`source not found: ${source}`);
    process.exit(1);
  }

  ensureDirs();

  console.log('[hero-build] step 1/5 — baking colour treatment into intermediate');
  const intermediate = stepIntermediate(source);

  console.log('\n[hero-build] step 2/5 — desktop MP4');
  stepTier(intermediate, TIER_HIGH, 'hero.desktop.mp4');

  console.log('\n[hero-build] step 3/5 — tablet MP4');
  stepTier(intermediate, TIER_MID, 'hero.tablet.mp4');

  console.log('\n[hero-build] step 4/5 — sprite atlas (webp + avif) + manifest');
  const atlas = await stepAtlas(intermediate);
  writeManifest(atlas);

  console.log('\n[hero-build] step 5/5 — poster frame');
  stepPoster(intermediate);

  rmSync(TMP_DIR, { recursive: true, force: true });
  report();

  console.log(
    '\n[hero-build] done. Runtime auto-picks the baked assets on next load.\n' +
    'Legacy /public/hero/hero.mp4 can now be deleted once you confirm visuals.\n'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
