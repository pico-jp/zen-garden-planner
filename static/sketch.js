let heightMap = [];
let rockImg = null;
let rockLoaded = false;
let rockError = false;
let pg;
let isReady = false;
let pendingPlan = null;

const WIDTH = 500;
const HEIGHT = 350;
const BASE_HEIGHT = 0.95;

function setup() {
  const cnv = createCanvas(WIDTH, HEIGHT);
  cnv.parent('canvas-container');
  pixelDensity(1);

  pg = createGraphics(WIDTH, HEIGHT);
  pg.pixelDensity(1);

  loadImage(
    '/static/rock.png',
    img => {
      rockImg = img;
      rockLoaded = true;
      rockError = false;
    },
    err => {
      rockError = true;
      console.error('rock load error', err);
    }
  );

  initializeSand();
  renderHeight(pg);
  isReady = true;

  if (pendingPlan) {
    const planToApply = pendingPlan;
    pendingPlan = null;
    redrawZen(planToApply);
  }
}

function draw() {
  if (!pg) return;
  image(pg, 0, 0);

  if (rockLoaded && rockImg) {
    const size = 200;
    image(rockImg, width / 2 - size / 2, height / 2 - size / 2, size, size);
  } else if (rockError) {
    drawRockPlaceholder();
  }
}

function drawRockPlaceholder() {
  push();
  translate(width / 2, height / 2);
  noStroke();
  fill(120, 120, 120, 180);
  ellipse(0, 10, 190, 150);
  fill(160, 160, 160, 200);
  ellipse(-20, -8, 120, 90);
  pop();
}

function initializeSand() {
  heightMap = new Array(HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    heightMap[y] = new Float32Array(WIDTH);
    for (let x = 0; x < WIDTH; x++) {
      const base = BASE_HEIGHT + (noise(x * 0.03, y * 0.03) - 0.5) * 0.06;
      heightMap[y][x] = base;
    }
  }
}

function renderHeight(target) {
  target.loadPixels();
  const lightDir = createVector(2.0, -1.2, 0.6).normalize();

  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      const hL = heightMap[y][x - 1];
      const hR = heightMap[y][x + 1];
      const hU = heightMap[y - 1][x];
      const hD = heightMap[y + 1][x];

      const gx = (hR - hL) * 5.0;
      const gy = (hD - hU) * 5.0;

      const normal = createVector(-gx, -gy, 1).normalize();
      let brightness = constrain(normal.dot(lightDir), 0, 1);
      let tone = 0.9 + (brightness - 0.5) * 0.6;
      tone = constrain(tone, 0, 1);
      const val = tone * 255;

      const idx = 4 * (x + y * WIDTH);
      target.pixels[idx] = val;
      target.pixels[idx + 1] = val;
      target.pixels[idx + 2] = val;
      target.pixels[idx + 3] = 255;
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
    const yCenter = startY + (i / Math.max(1, numLines - 1)) * usableHeight;
    const yMin = Math.max(1, Math.floor(yCenter - grooveHalfWidth - 1));
    const yMax = Math.min(HEIGHT - 2, Math.ceil(yCenter + grooveHalfWidth + 1));

    for (let y = yMin; y <= yMax; y++) {
      const dy = Math.abs(y - yCenter);
      if (dy > grooveHalfWidth + 1) continue;
      const falloff = Math.cos((dy / (grooveHalfWidth + 1)) * HALF_PI);

      for (let x = 1; x < WIDTH - 1; x++) {
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
  const xMin = Math.max(1, Math.floor(cx - r - bandHalfWidth - 1));
  const xMax = Math.min(WIDTH - 2, Math.ceil(cx + r + bandHalfWidth + 1));
  const yMin = Math.max(1, Math.floor(cy - r - bandHalfWidth - 1));
  const yMax = Math.min(HEIGHT - 2, Math.ceil(cy + r + bandHalfWidth + 1));

  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const distToEdge = Math.abs(d - r);
      if (distToEdge > bandHalfWidth) continue;
      const falloff = Math.cos((distToEdge / bandHalfWidth) * HALF_PI);
      heightMap[y][x] -= depth * falloff;
    }
  }
}

function carveCircleClusterFive(cx, cy, r, opts = {}) {
  const spacingFactor = opts.spacingFactor ?? 1.2;
  const centers = [
    [cx, cy],
    [cx - r * spacingFactor, cy],
    [cx + r * spacingFactor, cy],
    [cx, cy - r * spacingFactor],
    [cx, cy + r * spacingFactor]
  ];

  for (const [px, py] of centers) {
    carveCircleRingThin(px, py, r, opts);
  }
}

function redrawZen(plan) {
  if (!isReady) {
    pendingPlan = plan;
    return;
  }

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
