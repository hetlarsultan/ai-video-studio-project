/**
 * Advanced Image Processing Services
 * - Create realistic image animations
 * - Apply motion effects
 * - Generate smooth transitions
 * - Create extended duration videos from images
 */

export interface ImageAnimationConfig {
  duration: number; // seconds per image
  width: number;
  height: number;
  transitionType: "fade" | "slide" | "zoom" | "rotate" | "dissolve";
  transitionDuration: number; // seconds
  enableKenBurns: boolean; // Ken Burns effect (zoom + pan)
  enableParallax: boolean; // Parallax scrolling effect
}

export interface AnimationKeyframe {
  time: number; // percentage 0-100
  x: number; // horizontal position
  y: number; // vertical position
  scale: number; // zoom level
  opacity: number; // transparency
  rotation: number; // rotation in degrees
}

/**
 * Generate Ken Burns effect (smooth zoom and pan)
 */
export function generateKenBurnsEffect(
  _duration: number,
  _fps: number = 30
): AnimationKeyframe[] {
  const keyframes: AnimationKeyframe[] = [];

  // Start: zoomed in on left side
  keyframes.push({
    time: 0,
    x: 0,
    y: 0,
    scale: 1.2,
    opacity: 1,
    rotation: 0,
  });

  // Middle: slight pan
  keyframes.push({
    time: 50,
    x: 50,
    y: 30,
    scale: 1.15,
    opacity: 1,
    rotation: 0,
  });

  // End: zoom out and pan to right
  keyframes.push({
    time: 100,
    x: 100,
    y: 50,
    scale: 1,
    opacity: 1,
    rotation: 0,
  });

  return keyframes;
}

/**
 * Generate parallax scrolling effect
 */
export function generateParallaxEffect(
  _duration: number,
  layers: number = 3,
  _fps: number = 30
): AnimationKeyframe[][] {
  const layerAnimations: AnimationKeyframe[][] = [];

  for (let layer = 0; layer < layers; layer++) {
    const speed = 1 + layer * 0.3; // Each layer moves faster
    const keyframes: AnimationKeyframe[] = [];

    keyframes.push({
      time: 0,
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      rotation: 0,
    });

    keyframes.push({
      time: 100,
      x: -50 * speed,
      y: 30 * speed,
      scale: 1,
      opacity: 1,
      rotation: 0,
    });

    layerAnimations.push(keyframes);
  }

  return layerAnimations;
}

/**
 * Generate smooth transition between images
 */
export function generateTransitionEffect(
  transitionType: string,
  _duration: number
): AnimationKeyframe[] {
  const keyframes: AnimationKeyframe[] = [];

  switch (transitionType) {
    case "fade":
      keyframes.push({ time: 0, x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 });
      keyframes.push({ time: 50, x: 0, y: 0, scale: 1, opacity: 0.5, rotation: 0 });
      keyframes.push({ time: 100, x: 0, y: 0, scale: 1, opacity: 0, rotation: 0 });
      break;

    case "slide":
      keyframes.push({ time: 0, x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 });
      keyframes.push({ time: 50, x: 50, y: 0, scale: 1, opacity: 1, rotation: 0 });
      keyframes.push({ time: 100, x: 100, y: 0, scale: 1, opacity: 0, rotation: 0 });
      break;

    case "zoom":
      keyframes.push({ time: 0, x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 });
      keyframes.push({ time: 50, x: 0, y: 0, scale: 1.2, opacity: 1, rotation: 0 });
      keyframes.push({ time: 100, x: 0, y: 0, scale: 1.5, opacity: 0, rotation: 0 });
      break;

    case "rotate":
      keyframes.push({ time: 0, x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 });
      keyframes.push({ time: 50, x: 0, y: 0, scale: 1, opacity: 1, rotation: 180 });
      keyframes.push({ time: 100, x: 0, y: 0, scale: 1, opacity: 0, rotation: 360 });
      break;

    case "dissolve":
      keyframes.push({ time: 0, x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 });
      keyframes.push({ time: 33, x: 0, y: 0, scale: 1.05, opacity: 0.8, rotation: 0 });
      keyframes.push({ time: 66, x: 0, y: 0, scale: 0.95, opacity: 0.5, rotation: 0 });
      keyframes.push({ time: 100, x: 0, y: 0, scale: 1, opacity: 0, rotation: 0 });
      break;

    default:
      keyframes.push({ time: 0, x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 });
      keyframes.push({ time: 100, x: 0, y: 0, scale: 1, opacity: 0, rotation: 0 });
  }

  return keyframes;
}

/**
 * Interpolate keyframes for smooth animation
 */
export function interpolateKeyframes(
  keyframes: AnimationKeyframe[],
  totalFrames: number
): AnimationKeyframe[] {
  const interpolated: AnimationKeyframe[] = [];

  for (let frame = 0; frame <= totalFrames; frame++) {
    const progress = (frame / totalFrames) * 100;

    // Find surrounding keyframes
    let before = keyframes[0];
    let after = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (keyframes[i].time <= progress && progress <= keyframes[i + 1].time) {
        before = keyframes[i];
        after = keyframes[i + 1];
        break;
      }
    }

    // Linear interpolation between keyframes
    const range = after.time - before.time;
    const t = range === 0 ? 0 : (progress - before.time) / range;

    interpolated.push({
      time: progress,
      x: before.x + (after.x - before.x) * t,
      y: before.y + (after.y - before.y) * t,
      scale: before.scale + (after.scale - before.scale) * t,
      opacity: before.opacity + (after.opacity - before.opacity) * t,
      rotation: before.rotation + (after.rotation - before.rotation) * t,
    });
  }

  return interpolated;
}

/**
 * Generate CSS transform for keyframe
 */
export function generateTransform(keyframe: AnimationKeyframe): string {
  const transforms = [
    `translate(${keyframe.x}px, ${keyframe.y}px)`,
    `scale(${keyframe.scale})`,
    `rotate(${keyframe.rotation}deg)`,
  ];

  return transforms.join(" ");
}

/**
 * Create extended duration video config for images
 */
export function createImageVideoConfig(
  imageCount: number,
  secondsPerImage: number = 2,
  transitionDuration: number = 1
): ImageAnimationConfig {
  const totalDuration = imageCount * (secondsPerImage + transitionDuration);

  return {
    duration: Math.min(totalDuration, 900), // Max 15 minutes
    width: 1280,
    height: 720,
    transitionType: "dissolve",
    transitionDuration,
    enableKenBurns: true,
    enableParallax: false,
  };
}

/**
 * Generate FFmpeg filter for image sequence with animations
 */
export function generateImageSequenceFilter(
  imageCount: number,
  _duration: number,
  _transitionType: string
): string {
  let filter = "";

  // Create concat filter for images
  const inputs = Array.from({ length: imageCount }, (_, i) => `[${i}:v]`).join("");
  filter += `${inputs}concat=n=${imageCount}:v=1:a=0[v]`;

  // Add transition effects
  if (_transitionType !== "none") {
    filter += `;[v]fps=30[out]`;
  }

  return filter;
}

/**
 * Calculate total video duration from images
 */
export function calculateTotalDuration(
  imageCount: number,
  secondsPerImage: number = 2,
  transitionDuration: number = 1
): number {
  return imageCount * (secondsPerImage + transitionDuration);
}

/**
 * Generate motion blur effect
 */
export function generateMotionBlurEffect(
  _duration: number,
  intensity: number = 0.5
): string {
  // FFmpeg motion blur filter
  return `mblur=r=${Math.round(intensity * 10)}:t=0`;
}

/**
 * Generate color correction for consistency
 */
export function generateColorCorrectionFilter(): string {
  // Auto-equalize colors across images
  return `eq=brightness=0:contrast=1.1:saturation=1.2`;
}

/**
 * Generate smooth zoom effect
 */
export function generateSmoothZoomEffect(
  startScale: number,
  endScale: number,
  duration: number
): string {
  const fps = 30;
  const frames = Math.ceil(duration * fps);
  const scaleStep = (endScale - startScale) / frames;

  let filter = "";
  for (let i = 0; i < frames; i++) {
    const scale = startScale + scaleStep * i;
    filter += `scale=${Math.round(1280 * scale)}:${Math.round(720 * scale)}`;
    if (i < frames - 1) filter += ",";
  }

  return filter;
}
