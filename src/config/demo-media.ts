/**
 * Hero background scroll-frame sequence.
 *
 * Place numbered frame images in `public/frames/` (e.g. frame-0001.jpg … frame-0120.jpg).
 * Use any image format (jpg, png, webp). JPEG recommended for size.
 *
 * To extract frames from a video:
 *   ffmpeg -i hero-bg.mp4 -vf "fps=30,scale=1920:-1" public/frames/frame-%04d.jpg
 *
 * Then set `totalFrames` to match the number of extracted images.
 */
export const HERO_FRAME_CONFIG = {
  /** Directory under `public/` that holds the frames */
  directory: '/frames',
  /** Filename prefix before the zero-padded index */
  prefix: 'ezgif-frame-',
  /** File extension (include the dot) — run `npm run compress-frames` to convert jpg→webp */
  extension: '.webp',
  /** Number of digits for zero-padding (e.g. 4 → frame-0001.jpg) */
  padLength: 3,
  /** Total number of frames (must match the files on disk) */
  totalFrames: 300,
  /** First frame index (usually 1 when extracted with ffmpeg %04d) */
  startIndex: 1,
};
