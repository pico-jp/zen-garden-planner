let heightMap = [];
let rockImg = null;
let rockLoaded = false;
let pg;

const WIDTH = 500;
const HEIGHT = 350;
const BASE_HEIGHT = 0.9;

function setup() {
  const cnv = createCanvas(WIDTH, HEIGHT);
  cnv.parent('canvas-container');
  pg = createGraphics(WIDTH, HEIGHT);

  loadImage('/static/rock.png', img => {
    rockImg = img;
    rockLoaded = true;
  });

  initializeSand();
  renderHeight(pg);
}

function draw() {
  image(pg, 0, 0);
  if (rockLoaded) {
    const size = 200;
    image(rockImg, width / 2 - size / 2, height / 2 - size / 2, size, size);
  }
}

function initializeSand() {
  heightMap = new Array(HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    heightMap[y] = new Array(WIDTH);
    for (let x = 0; x < WIDTH; x++) {
      const n = noise(x * 0.02, y * 0.02) * 0.05; // subtle noise
      heightMap[y][x] = BASE_HEIGHT + n;
    }
  }
}

function renderHeight(target) {
  target.loadPixels();
  const lightDir = createVector(2.0, -1.2, 0.6).normalize();

  const idx = (x, y) => 4 * (y * WIDTH + x);

  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      const hL = heightMap[y][x - 1];
      const hR = heightMap[y][x + 1];
      const hU = heightMap[y - 1][x];
      const hD = heightMap[y + 1][x];
      const dx = (hR - hL) * 0.5;
      const dy = (hD - hU) * 0.5;
      const normal = createVector(-dx, -dy, 1).normalize();
      const brightness = constrain(normal.dot(lightDir), -1, 1);
      const baseTone = 220;
      const shade = baseTone + brightness * 25;
      const i = idx(x, y);
      target.pixels[i] = shade;
      target.pixels[i + 1] = shade * 0.98;
      target.pixels[i + 2] = shade * 0.92;
      target.pixels[i + 3] = 255;
    }
  }
  target.updatePixels();
}

function carveHorizontalRakeLines(cfg = {}) {
  const numLines = cfg.numLines ?? 36;
  const grooveHalfWidth = cfg.grooveHalfWidth ?? 2;
  const depth = cfg.depth ?? 0.07;
  const topMargin = cfg.topMargin ?? 0;
  const bottomMargin = cfg.bottomMargin ?? 0;
  const region = cfg.region ?? 'full';

  const startY = topMargin;
  const endY = HEIGHT - bottomMargin;
  const usableHeight = endY - startY;
  for (let i = 0; i < numLines; i++) {
    const yCenter = startY + (i / (numLines - 1 || 1)) * usableHeight;
    for (let y = Math.max(0, Math.floor(yCenter - grooveHalfWidth - 2)); y < Math.min(HEIGHT, Math.ceil(yCenter + grooveHalfWidth + 2)); y++) {
      const dy = Math.abs(y - yCenter);
      if (dy > grooveHalfWidth + 2) continue;
      const falloff = 0.5 + 0.5 * cos((dy / (grooveHalfWidth + 2)) * PI);
      for (let x = 0; x < WIDTH; x++) {
        if (region === 'left' && x > WIDTH / 2) continue;
        if (region === 'right' && x < WIDTH / 2) continue;
        if (region === 'top' && y > HEIGHT / 2) continue;
        if (region === 'bottom' && y < HEIGHT / 2) continue;
        heightMap[y][x] -= depth * falloff;
      }
    }
  }
}

function carveCircleRingThin(cx, cy, r, opts = {}) {
  const bandHalfWidth = opts.bandHalfWidth ?? 1.0;
  const depth = opts.depth ?? 0.1;
  const startX = Math.max(0, Math.floor(cx - r - bandHalfWidth - 2));
  const endX = Math.min(WIDTH - 1, Math.ceil(cx + r + bandHalfWidth + 2));
  const startY = Math.max(0, Math.floor(cy - r - bandHalfWidth - 2));
  const endY = Math.min(HEIGHT - 1, Math.ceil(cy + r + bandHalfWidth + 2));

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const distCenter = dist(x, y, cx, cy);
      const delta = Math.abs(distCenter - r);
      if (delta > bandHalfWidth + 2) continue;
      const falloff = 0.5 + 0.5 * cos((delta / (bandHalfWidth + 2)) * PI);
      heightMap[y][x] -= depth * falloff;
    }
  }
}

function carveCircleClusterFive(cx, cy, r, opts = {}) {
  const spacingFactor = opts.spacingFactor ?? 1.2;
  carveCircleRingThin(cx, cy, r, opts);
  carveCircleRingThin(cx - r * spacingFactor, cy, r, opts);
  carveCircleRingThin(cx + r * spacingFactor, cy, r, opts);
  carveCircleRingThin(cx, cy - r * spacingFactor, r, opts);
  carveCircleRingThin(cx, cy + r * spacingFactor, r, opts);
}

function redrawZen(plan) {
  initializeSand();
  if (plan && Array.isArray(plan.steps)) {
    for (const step of plan.steps) {
      if (step.type === 'horizontal') {
        carveHorizontalRakeLines(step);
      } else if (step.type === 'circle') {
        const r = step.r ?? 100;
        carveCircleRingThin(WIDTH / 2, HEIGHT / 2, r, step);
      } else if (step.type === 'cluster') {
        const r = step.r ?? 65;
        carveCircleClusterFive(WIDTH / 2, HEIGHT / 2, r, step);
      }
    }
  }
  renderHeight(pg);
}
