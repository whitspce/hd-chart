/* Bodygraph SVG renderer, extracted from @gonzih/hd-bodygraph v1.4.1 (MIT).
 * React wrapper removed; rendering logic unchanged.
 * https://www.npmjs.com/package/@gonzih/hd-bodygraph */
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  
  renderToSVG: () => renderToSVG
});
if (typeof module === "object" && module.exports) module.exports = __toCommonJS(index_exports);

// src/geometry.ts
var VIEWBOX = { width: 820, height: 900 };
var SPINE_Y = { top: 119, bottom: 688 };
var CENTER_SHAPES = [
  // cy for triangle-up: bbox_center = cy - 0.1*h; ref bbox_cy = 8.5% of 900 = 76.5 → cy = 76.5 + 8.5 = 85
  { name: "Head", type: "triangle-up", cx: 410, cy: 85, w: 70, h: 85 },
  // diamond: bbox_cy = cy; ref = 20.8% of 900 = 187
  { name: "Ajna", type: "diamond", cx: 410, cy: 187, w: 95, h: 75 },
  // rect: bbox_cy = cy; ref = 33.8% of 900 = 304; ref w = 15.9% of 820 = 130
  { name: "Throat", type: "rectangle", cx: 410, cy: 304, w: 130, h: 70 },
  // diamond: ref cy = 48.5% of 900 = 437; ref w = 12.2% of 820 = 100
  { name: "G", type: "diamond", cx: 410, cy: 437, w: 100, h: 120 },
  // diamond: ref cx = 64% of 820 = 525; ref cy = 41.5% of 900 = 374; ref h = 10.8% of 900 = 97
  { name: "Ego", type: "diamond", cx: 525, cy: 374, w: 80, h: 97 },
  // rect: ref cy = 66.2% of 900 = 596; ref w = 15.9% of 820 = 130
  { name: "Sacral", type: "rectangle", cx: 410, cy: 596, w: 130, h: 75 },
  // triangle-left: large - right flat edge at 676, left tip at 536; top-bottom span 442..598
  { name: "SolarPlexus", type: "triangle-left", cx: 620, cy: 520, w: 140, h: 155 },
  // triangle-right: large - left flat edge at 144, right tip at 284; top-bottom span 442..598
  { name: "Spleen", type: "triangle-right", cx: 200, cy: 520, w: 140, h: 155 },
  // rect: ref cy = 80% of 900 = 720; ref w = 12.2% of 820 = 100
  { name: "Root", type: "rectangle", cx: 410, cy: 720, w: 100, h: 65 }
];
var GATE_POSITIONS = [
  // ── HEAD → AJNA interface (y≈122 = 13.5% of 900) ──
  { gate: 64, x: 392, y: 122 },
  { gate: 61, x: 410, y: 122 },
  { gate: 63, x: 428, y: 122 },
  // ── AJNA top row (y≈155 = 17.2% of 900) - Head gates pair ──
  { gate: 47, x: 392, y: 155 },
  { gate: 24, x: 410, y: 155 },
  { gate: 4, x: 428, y: 155 },
  // ── AJNA bottom row (y≈224 = 24.9% of 900) - Throat gate pairs ──
  { gate: 17, x: 385, y: 224 },
  { gate: 11, x: 397, y: 224 },
  { gate: 43, x: 410, y: 224 },
  { gate: 23, x: 435, y: 224 },
  // ── THROAT top row (y≈270 = 30% of 900) ──
  { gate: 62, x: 368, y: 270 },
  { gate: 56, x: 385, y: 270 },
  { gate: 35, x: 410, y: 270 },
  { gate: 12, x: 435, y: 270 },
  { gate: 45, x: 452, y: 270 },
  // ── THROAT bottom row (y≈295 = 32.8% of 900) ──
  { gate: 31, x: 368, y: 295 },
  { gate: 8, x: 385, y: 295 },
  { gate: 33, x: 410, y: 295 },
  { gate: 20, x: 435, y: 295 },
  { gate: 16, x: 452, y: 295 },
  // ── G CENTER top (y≈357 = 39.7% of 900) - Throat gate pairs ──
  { gate: 7, x: 392, y: 357 },
  { gate: 1, x: 410, y: 357 },
  { gate: 13, x: 428, y: 357 },
  // ── G CENTER sides and bottom ──
  { gate: 10, x: 335, y: 464 },
  // 40.9% x, 51.5% y
  { gate: 25, x: 330, y: 489 },
  // 40.2% x, 54.3% y (left - G↔Ego)
  { gate: 15, x: 428, y: 429 },
  // 52.2% x, 47.7% y
  { gate: 2, x: 392, y: 429 },
  // 47.8% x, 47.7% y
  { gate: 46, x: 410, y: 429 },
  // 50% x,   47.7% y
  // ── EGO / HEART (diamond cx=525, cy=374) ──
  { gate: 26, x: 478, y: 344 },
  // 58.3% x, 38.2% y - left edge EGO
  { gate: 51, x: 478, y: 371 },
  // 58.3% x, 41.2% y - left edge EGO
  { gate: 21, x: 478, y: 399 },
  // 58.3% x, 44.3% y - left edge EGO
  { gate: 40, x: 500, y: 446 },
  // 61% x,   49.5% y - below EGO
  // ── SACRAL top area (y≈519 = 57.7% of 900) - G gate pairs ──
  { gate: 5, x: 385, y: 519 },
  { gate: 14, x: 410, y: 519 },
  { gate: 29, x: 435, y: 519 },
  // ── SACRAL center (y≈574 = 63.8% of 900) ──
  { gate: 34, x: 368, y: 574 },
  { gate: 27, x: 385, y: 574 },
  { gate: 59, x: 410, y: 574 },
  { gate: 9, x: 435, y: 574 },
  { gate: 3, x: 452, y: 574 },
  // ── SACRAL bottom / Root interface (y≈614 = 68.2% of 900) ──
  { gate: 42, x: 380, y: 614 },
  { gate: 53, x: 410, y: 614 },
  { gate: 60, x: 440, y: 614 },
  // ── SOLAR PLEXUS (triangle-left, cx=620, cy=520, w=140, h=155) ──
  // Right flat edge at cx+w*0.4=676; gates just inside at x=668
  // Triangle spans y=442.5..597.5; 7 gates y=462..570 spacing 18
  { gate: 36, x: 668, y: 462 },
  { gate: 22, x: 668, y: 480 },
  { gate: 37, x: 668, y: 498 },
  { gate: 6, x: 668, y: 516 },
  { gate: 49, x: 668, y: 534 },
  { gate: 30, x: 668, y: 552 },
  { gate: 55, x: 668, y: 570 },
  // ── SPLEEN (triangle-right, cx=200, cy=520, w=140, h=155) ──
  // Left flat edge at cx-w*0.4=144; gates just inside at x=152
  // Triangle spans y=442.5..597.5; 7 gates y=462..570 spacing 18
  { gate: 48, x: 152, y: 462 },
  { gate: 57, x: 152, y: 480 },
  { gate: 44, x: 152, y: 498 },
  { gate: 50, x: 152, y: 516 },
  { gate: 32, x: 152, y: 534 },
  { gate: 28, x: 152, y: 552 },
  { gate: 18, x: 152, y: 570 },
  // ── ROOT top row (y≈704 = 78.2% of 900) - Sacral gate pairs ──
  { gate: 58, x: 372, y: 704 },
  // 45.4% x
  { gate: 38, x: 388, y: 704 },
  // 47.3% x
  { gate: 54, x: 404, y: 704 },
  // 49.3% x
  { gate: 52, x: 410, y: 704 },
  // 50% x
  { gate: 19, x: 436, y: 704 },
  // 53.2% x
  { gate: 39, x: 452, y: 704 },
  // 55.1% x
  // ── ROOT center (inside ROOT rect y=688..752) ──
  { gate: 41, x: 410, y: 730 }
  // 50% x, inside ROOT - connects to Solar Plexus gate 30
];
var CHANNEL_PATHS = [
  // ── HEAD ↔ AJNA (3 channels) ────────────────────────────────────────────────
  { gates: [64, 47], path: "M 392,122 L 392,155" },
  { gates: [61, 24], path: "M 410,122 L 410,155" },
  { gates: [63, 4], path: "M 428,122 L 428,155" },
  // ── AJNA ↔ THROAT (3 channels) ──────────────────────────────────────────────
  { gates: [17, 62], path: "M 385,224 C 378,244 374,258 368,270" },
  { gates: [43, 23], path: "M 410,224 L 435,224" },
  { gates: [11, 56], path: "M 397,224 C 392,240 388,257 385,270" },
  // ── THROAT ↔ G CENTER (5 channels) ──────────────────────────────────────────
  { gates: [7, 31], path: "M 392,357 C 382,338 376,320 368,295" },
  { gates: [1, 8], path: "M 410,357 C 400,338 393,318 385,295" },
  { gates: [13, 33], path: "M 428,357 C 420,336 415,318 410,295" },
  { gates: [10, 20], path: "M 335,464 C 358,410 388,355 435,295" },
  { gates: [34, 20], path: "M 368,574 C 345,490 370,400 435,295" },
  // ── THROAT ↔ SPLEEN (2 channels) ────────────────────────────────────────────
  { gates: [16, 48], path: "M 452,295 C 330,350 230,410 152,462" },
  { gates: [20, 57], path: "M 435,295 C 320,360 240,430 152,480" },
  // ── THROAT ↔ SOLAR PLEXUS (2 channels) ──────────────────────────────────────
  { gates: [12, 22], path: "M 435,270 C 540,290 640,400 668,480" },
  { gates: [35, 36], path: "M 410,270 C 520,280 620,380 668,462" },
  // ── THROAT ↔ EGO (1 channel) ────────────────────────────────────────────────
  { gates: [45, 21], path: "M 452,270 C 464,296 470,340 478,399" },
  // ── G CENTER ↔ SACRAL (3 channels) ──────────────────────────────────────────
  { gates: [2, 14], path: "M 392,429 C 400,462 406,492 410,519" },
  { gates: [15, 5], path: "M 428,429 C 418,462 406,492 385,519" },
  { gates: [46, 29], path: "M 410,429 C 416,462 424,492 435,519" },
  // ── G CENTER ↔ EGO (1 channel) ──────────────────────────────────────────────
  { gates: [25, 51], path: "M 330,489 C 370,460 424,432 478,371" },
  // ── G CENTER ↔ SPLEEN (1 channel) ───────────────────────────────────────────
  { gates: [10, 57], path: "M 335,464 C 265,467 205,472 152,480" },
  // ── EGO ↔ SPLEEN (1 channel - massive outer arc sweeping right then far left) ─
  { gates: [26, 44], path: "M 478,344 C 600,500 290,710 152,498" },
  // ── EGO ↔ SOLAR PLEXUS (1 channel - right-side arc) ─────────────────────────
  { gates: [37, 40], path: "M 668,498 C 750,510 740,440 500,446" },
  // ── SACRAL ↔ SOLAR PLEXUS (1 channel) ───────────────────────────────────────
  { gates: [6, 59], path: "M 668,516 C 610,550 530,562 410,574" },
  // ── SACRAL ↔ SPLEEN (2 channels) ────────────────────────────────────────────
  { gates: [27, 50], path: "M 385,574 C 295,558 220,538 152,516" },
  { gates: [34, 57], path: "M 368,574 C 270,545 205,510 152,480" },
  // ── SACRAL ↔ ROOT (3 channels) ──────────────────────────────────────────────
  { gates: [9, 52], path: "M 435,574 C 428,618 420,665 410,704" },
  { gates: [42, 53], path: "M 380,614 L 410,614" },
  { gates: [3, 60], path: "M 452,574 C 448,592 444,604 440,614" },
  // ── SPLEEN ↔ ROOT (3 channels - massive outer left arcs) ─────────────────────
  { gates: [18, 58], path: "M 152,570 C 50,600 40,690 372,704" },
  { gates: [28, 38], path: "M 152,552 C 70,590 75,685 388,704" },
  { gates: [32, 54], path: "M 152,534 C 90,580 100,675 404,704" },
  // ── ROOT ↔ SOLAR PLEXUS (3 channels - outer right arcs) ─────────────────────
  { gates: [19, 49], path: "M 436,704 C 530,695 630,650 668,534" },
  { gates: [39, 55], path: "M 452,704 C 548,700 640,660 668,570" },
  { gates: [41, 30], path: "M 410,730 C 510,720 620,680 668,552" }
];

// src/renderer.ts
var DEFAULT_COLORS = {
  background: "#f5ead8",
  definedCenter: "#C9956A",
  undefinedCenterStroke: "#9e8570",
  centerStroke: "#5a3e28",
  centerStrokeWidth: 2.5,
  designFill: "#c87860",
  personalityFill: "#2a2a2a",
  bothFill: "#8b5cf6",
  inactiveFill: "#e8d8c0",
  pillText: "#ffffff",
  inactiveText: "#888888",
  pillStroke: "#3a2810",
  definedChannelStroke: "#3a2810",
  definedChannelWidth: 5,
  potentialChannelStroke: "#bbbbbb",
  potentialChannelWidth: 1.5,
  potentialChannelDash: "5,4",
  spineStroke: "#3d2b1a",
  spineOpacity: "0.7",
  designText: "#c87860",
  personalityText: "#2a2a2a"
};
var CANONICAL_CENTER_COLORS = {
  Head: "#f48fb1",
  // pink/magenta
  Ajna: "#d32f2f",
  // deep red
  Throat: "#1565c0",
  // royal blue
  G: "#388e3c",
  // green
  Ego: "#43a047",
  // lighter green
  Sacral: "#e65100",
  // deep orange
  SolarPlexus: "#f9a825",
  // golden amber
  Spleen: "#f9a825",
  // golden amber (teal border applied separately)
  Root: "#c62828"
  // dark red
};
var CIRCUIT_COLORS = {
  integration: "#26c6da",
  // teal
  individual: "#8d6e63",
  // warm brown/olive
  tribal: "#bcaaa4",
  // warm tan/copper
  collectiveLogic: "#283593",
  // dark navy
  collectiveSensing: "#6a1b9a"
  // dark purple/maroon
};
var CHANNEL_CIRCUIT = {
  // Integration (self-empowerment) - connects Sacral/G/Spleen to Throat
  "10-20": "integration",
  "20-34": "integration",
  "10-57": "integration",
  "34-57": "integration",
  "20-57": "integration",
  // Individual - Knowing Circuit
  "1-8": "individual",
  "2-14": "individual",
  "7-31": "individual",
  "13-33": "individual",
  "24-61": "individual",
  "47-64": "individual",
  "25-51": "individual",
  // Individual - Centering/Mutation Circuit
  "3-60": "individual",
  "9-52": "individual",
  "18-58": "individual",
  "28-38": "individual",
  "39-55": "individual",
  // Tribal - Ego/Will Circuit
  "21-45": "tribal",
  "26-44": "tribal",
  "37-40": "tribal",
  // Tribal - Support Circuit
  "6-59": "tribal",
  "27-50": "tribal",
  "32-54": "tribal",
  "42-53": "tribal",
  "19-49": "tribal",
  // Collective Logic (Understanding Circuit)
  "16-48": "collectiveLogic",
  "11-56": "collectiveLogic",
  "4-63": "collectiveLogic",
  "17-62": "collectiveLogic",
  "23-43": "collectiveLogic",
  "5-15": "collectiveLogic",
  "29-46": "collectiveLogic",
  // Collective Sensing (Abstract/Sensing Circuit)
  "12-22": "collectiveSensing",
  "35-36": "collectiveSensing",
  "30-41": "collectiveSensing"
};
function buildTheme(preset, opts) {
  const noop = (k) => DEFAULT_COLORS.definedChannelStroke;
  const defaultCenterColors = Object.fromEntries(
    ["Head", "Ajna", "Throat", "G", "Ego", "Sacral", "SolarPlexus", "Spleen", "Root"].map((n) => [n, DEFAULT_COLORS.definedCenter])
  );
  let base = {
    background: DEFAULT_COLORS.background,
    definedCenter: DEFAULT_COLORS.definedCenter,
    centerColors: defaultCenterColors,
    undefinedCenterStroke: DEFAULT_COLORS.undefinedCenterStroke,
    centerStroke: DEFAULT_COLORS.centerStroke,
    centerStrokeWidth: DEFAULT_COLORS.centerStrokeWidth,
    designFill: DEFAULT_COLORS.designFill,
    personalityFill: DEFAULT_COLORS.personalityFill,
    bothFill: DEFAULT_COLORS.bothFill,
    inactiveFill: DEFAULT_COLORS.inactiveFill,
    pillText: DEFAULT_COLORS.pillText,
    inactiveText: DEFAULT_COLORS.inactiveText,
    pillStroke: DEFAULT_COLORS.pillStroke,
    channelColor: (_k) => DEFAULT_COLORS.definedChannelStroke,
    channelWidth: DEFAULT_COLORS.definedChannelWidth,
    potentialChannelStroke: DEFAULT_COLORS.potentialChannelStroke,
    potentialChannelWidth: DEFAULT_COLORS.potentialChannelWidth,
    potentialChannelDash: DEFAULT_COLORS.potentialChannelDash,
    spineStroke: DEFAULT_COLORS.spineStroke,
    spineOpacity: DEFAULT_COLORS.spineOpacity,
    designText: DEFAULT_COLORS.designText,
    personalityText: DEFAULT_COLORS.personalityText
  };
  if (preset === "canonical") {
    base = {
      ...base,
      centerColors: { ...CANONICAL_CENTER_COLORS },
      spreenBorder: "#00838f",
      // teal border for Spleen
      channelColor: (k) => {
        const circuit = CHANNEL_CIRCUIT[k];
        return circuit ? CIRCUIT_COLORS[circuit] : DEFAULT_COLORS.definedChannelStroke;
      },
      channelWidth: 4
    };
  } else if (preset === "minimal") {
    base = {
      ...base,
      background: "#ffffff",
      definedCenter: "none",
      centerColors: defaultCenterColors,
      // overridden below
      centerStroke: "#888888",
      centerStrokeWidth: 1.5,
      undefinedCenterStroke: "#cccccc",
      channelColor: (_k) => "#999999",
      channelWidth: 2,
      potentialChannelStroke: "#dddddd",
      spineStroke: "#dddddd",
      spineOpacity: "0.5",
      designFill: "#c87860",
      personalityFill: "#555555"
    };
    const minimalCenterColors = Object.fromEntries(
      ["Head", "Ajna", "Throat", "G", "Ego", "Sacral", "SolarPlexus", "Spleen", "Root"].map((n) => [n, "none"])
    );
    base.centerColors = minimalCenterColors;
    base.definedCenter = "none";
  } else if (preset === "dark") {
    base = {
      ...base,
      background: "#1a1a2e",
      centerColors: { ...CANONICAL_CENTER_COLORS },
      undefinedCenterStroke: "#555577",
      centerStroke: "#ccccdd",
      spineStroke: "#888899",
      spineOpacity: "0.5",
      designFill: "#ef5350",
      personalityFill: "#90caf9",
      bothFill: "#ce93d8",
      inactiveFill: "#333344",
      inactiveText: "#666688",
      pillStroke: "#ccccdd",
      potentialChannelStroke: "#444466",
      channelColor: (k) => {
        const circuit = CHANNEL_CIRCUIT[k];
        return circuit ? CIRCUIT_COLORS[circuit] : "#8888aa";
      },
      channelWidth: 4,
      designText: "#ef5350",
      personalityText: "#90caf9"
    };
  } else if (preset === "light") {
    base = {
      ...base,
      background: "#fafafa",
      definedCenter: "#e0d0c0",
      centerColors: defaultCenterColors,
      // muted
      centerStroke: "#888888",
      centerStrokeWidth: 1.5,
      undefinedCenterStroke: "#dddddd",
      channelColor: (_k) => "#aaaaaa",
      channelWidth: 3,
      potentialChannelStroke: "#eeeeee",
      spineStroke: "#cccccc",
      spineOpacity: "0.4",
      designFill: "#e57373",
      personalityFill: "#78909c",
      bothFill: "#ba68c8",
      inactiveFill: "#eeeeee",
      inactiveText: "#aaaaaa",
      designText: "#c62828",
      personalityText: "#37474f"
    };
    const lightCenterColors = Object.fromEntries(
      ["Head", "Ajna", "Throat", "G", "Ego", "Sacral", "SolarPlexus", "Spleen", "Root"].map((n) => [n, "#e0d0c0"])
    );
    base.centerColors = lightCenterColors;
  }
  if (opts.centerColors) {
    base.centerColors = { ...base.centerColors, ...opts.centerColors };
  }
  if (opts.channelColors) {
    const userChannelColors = opts.channelColors;
    const prevChannelColor = base.channelColor;
    base.channelColor = (k) => userChannelColors[k] ?? prevChannelColor(k);
  }
  return base;
}
function channelKey(a, b) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return `${lo}-${hi}`;
}
function parseChannel(ch) {
  if (typeof ch === "string") {
    const parts = ch.split("-").map(Number);
    return [parts[0], parts[1]];
  }
  return ch;
}
function normalizeCenterName(name) {
  return name === "Solar Plexus" ? "SolarPlexus" : name;
}
function normalizeChart(chartData) {
  const channels = chartData.channels.map(parseChannel);
  let gates;
  if (chartData.gates && chartData.gates.length > 0) {
    gates = chartData.gates;
  } else {
    const map = /* @__PURE__ */ new Map();
    for (const g of chartData.designGates ?? []) map.set(g, "design");
    for (const g of chartData.personalityGates ?? []) {
      map.set(g, map.has(g) ? "both" : "personality");
    }
    for (const g of chartData.bothGates ?? []) map.set(g, "both");
    gates = Array.from(map.entries()).map(([gate, coloring]) => ({ gate, coloring }));
  }
  const definedCenters = (chartData.definedCenters ?? []).map(normalizeCenterName);
  return { gates, definedCenters, channels, activations: chartData.activations };
}
function gateColoringOf(gate, chart) {
  for (const g of chart.gates) {
    if (g.gate === gate) return g.coloring;
  }
  return "inactive";
}
function isCenterDefined(name, chart) {
  return chart.definedCenters.includes(name);
}
function isChannelActive(gates, chart) {
  return chart.channels.some(
    ([a, b]) => a === gates[0] && b === gates[1] || a === gates[1] && b === gates[0]
  );
}
function renderSpine(theme, lineCount) {
  const n = Math.max(1, Math.min(13, lineCount));
  const spacing = 4;
  const startX = 410 - (n - 1) / 2 * spacing;
  const { top, bottom } = SPINE_Y;
  const lines = [];
  for (let i = 0; i < n; i++) {
    const x = Math.round(startX + i * spacing);
    lines.push(
      `<line data-spine-line="${i + 1}" x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="${theme.spineStroke}" stroke-width="2" opacity="${theme.spineOpacity}"/>`
    );
  }
  return `<g id="spine-bg">${lines.join("")}</g>`;
}
function renderCenter(shape, defined, theme) {
  const centerFill = theme.centerColors[shape.name] ?? theme.definedCenter;
  const fill = defined ? centerFill : "none";
  const isSpleen = shape.name === "Spleen";
  const stroke = defined ? isSpleen && theme.spreenBorder ? theme.spreenBorder : theme.centerStroke : theme.undefinedCenterStroke;
  const sw = defined ? theme.centerStrokeWidth : 1.5;
  const { cx, cy, w, h } = shape;
  switch (shape.type) {
    case "triangle-up": {
      const ax = cx, ay = cy - h * 0.6;
      const bx = cx - w / 2, by = cy + h * 0.4;
      const dx = cx + w / 2, dy = cy + h * 0.4;
      return `<path d="M ${ax},${ay} L ${bx},${by} L ${dx},${dy} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case "diamond": {
      const hw = w / 2, hh = h / 2;
      return `<polygon points="${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case "rectangle": {
      return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="6"/>`;
    }
    case "triangle-right": {
      const lx = cx - w * 0.4, rx = cx + w * 0.6;
      return `<path d="M ${lx},${cy - h / 2} L ${rx},${cy} L ${lx},${cy + h / 2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case "triangle-left": {
      const rx2 = cx + w * 0.4, lx2 = cx - w * 0.6;
      return `<path d="M ${rx2},${cy - h / 2} L ${lx2},${cy} L ${rx2},${cy + h / 2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
  }
}
function centerLabel(shape, theme) {
  const { cx, cy, w, h } = shape;
  const stroke = theme.centerStroke;
  const font = `font-family="Arial,sans-serif" font-weight="bold" fill="${stroke}" opacity="0.85"`;
  switch (shape.name) {
    case "Head": {
      const labelY = cy + Math.round(h * 0.1);
      return `<text x="${cx}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">HEAD</text>`;
    }
    case "SolarPlexus": {
      const labelX = cx + Math.round(w * 0.05);
      return `<text text-anchor="middle" ${font} font-size="9"><tspan x="${labelX}" y="${cy - 5}">SOLAR</tspan><tspan x="${labelX}" dy="11">PLEXUS</tspan></text>`;
    }
    case "Spleen": {
      const labelX = cx - Math.round(w * 0.05);
      return `<text x="${labelX}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="9">SPLEEN</text>`;
    }
    case "G": {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">G</text>`;
    }
    case "Ego": {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="9">EGO</text>`;
    }
    case "Sacral": {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">SACRAL</text>`;
    }
    case "Root": {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">ROOT</text>`;
    }
    case "Throat": {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">THROAT</text>`;
    }
    case "Ajna": {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">AJNA</text>`;
    }
  }
}
function renderGatePill(gate, x, y, coloring, theme) {
  const pw = 22, ph = 14, rx = 7;
  let fill, textFill;
  switch (coloring) {
    case "design":
      fill = theme.designFill;
      textFill = theme.pillText;
      break;
    case "personality":
      fill = theme.personalityFill;
      textFill = theme.pillText;
      break;
    case "both":
      fill = theme.bothFill;
      textFill = theme.pillText;
      break;
    default:
      fill = theme.inactiveFill;
      textFill = theme.inactiveText;
  }
  return `<g data-gate="${gate}" data-coloring="${coloring}">
    <rect x="${x - pw / 2}" y="${y - ph / 2}" width="${pw}" height="${ph}" rx="${rx}" fill="${fill}" stroke="${theme.pillStroke}" stroke-width="0.8" stroke-opacity="${coloring === "inactive" ? "0.4" : "1"}"/>
    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="${textFill}">${gate}</text>
  </g>`;
}
function renderChannel(path, active, color, width, theme) {
  if (active) {
    return [
      `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width + 4}" stroke-opacity="0.18" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
    ].join("\n");
  }
  return `<path d="${path}" fill="none" stroke="${theme.potentialChannelStroke}" stroke-width="${theme.potentialChannelWidth}" stroke-dasharray="${theme.potentialChannelDash}" stroke-linecap="round"/>`;
}
var PLANETS = [
  { key: "sun", symbol: "\u2609" },
  { key: "earth", symbol: "\u2641" },
  { key: "northNode", symbol: "\u260A" },
  { key: "southNode", symbol: "\u260B" },
  { key: "moon", symbol: "\u263D" },
  { key: "mercury", symbol: "\u263F" },
  { key: "venus", symbol: "\u2640" },
  { key: "mars", symbol: "\u2642" },
  { key: "jupiter", symbol: "\u2643" },
  { key: "saturn", symbol: "\u2644" },
  { key: "uranus", symbol: "\u2645" },
  { key: "neptune", symbol: "\u2646" },
  { key: "pluto", symbol: "\u2647" }
];
function renderActivationColumns(activations, theme) {
  if (!activations) return "";
  const rowH = 42, startY = 100;
  const designParts = [], persParts = [];
  const designCX = 65;
  designParts.push(`<text x="${designCX}" y="${startY - 18}" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="bold" letter-spacing="1" fill="${theme.designText}">DESIGN</text>`);
  for (let i = 0; i < PLANETS.length; i++) {
    const { key, symbol } = PLANETS[i];
    const value = activations.design[key];
    if (!value) continue;
    const y = startY + i * rowH;
    designParts.push(`<text x="${designCX - 18}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="serif" font-size="14" fill="${theme.designText}">${symbol}</text>`);
    designParts.push(`<text x="${designCX + 16}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="11" fill="${theme.designText}">${value}</text>`);
  }
  const persCX = 755;
  persParts.push(`<text x="${persCX}" y="${startY - 18}" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="bold" letter-spacing="0.5" fill="${theme.personalityText}">PERSONALITY</text>`);
  for (let i = 0; i < PLANETS.length; i++) {
    const { key, symbol } = PLANETS[i];
    const value = activations.personality[key];
    if (!value) continue;
    const y = startY + i * rowH;
    persParts.push(`<text x="${persCX - 18}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="serif" font-size="14" fill="${theme.personalityText}">${symbol}</text>`);
    persParts.push(`<text x="${persCX + 16}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="11" fill="${theme.personalityText}">${value}</text>`);
  }
  const sepTop = 40, sepBot = VIEWBOX.height - 30;
  const sepLines = [
    `<line x1="130" y1="${sepTop}" x2="130" y2="${sepBot}" stroke="#c8a882" stroke-width="0.8" opacity="0.5"/>`,
    `<line x1="690" y1="${sepTop}" x2="690" y2="${sepBot}" stroke="#c8a882" stroke-width="0.8" opacity="0.5"/>`
  ];
  return `<g id="activation-columns"><g data-column="design">${designParts.join("\n")}</g><g data-column="personality">${persParts.join("\n")}</g>` + sepLines.join("") + `</g>`;
}
function renderToSVG(chartData, options = {}) {
  const chart = normalizeChart(chartData);
  const { width, height } = VIEWBOX;
  const maxWidth = options.width ?? width;
  const preset = options.theme ?? "default";
  const theme = buildTheme(preset, options);
  const showGateNumbers = options.showGateNumbers ?? true;
  const showCenterLabels = options.showCenterLabels ?? true;
  const showActivationCols = options.showActivationColumns ?? true;
  const showBodySilhouette = options.showBodySilhouette ?? true;
  const showSpine = options.showSpine ?? true;
  const spineLineCount = options.spineLineCount ?? 7;
  const parts = [];
  parts.push(`<rect width="${width}" height="${height}" fill="${theme.background}"/>`);
  if (showBodySilhouette) {
    parts.push(
      `<path d="M 410,25 C 375,25 335,55 315,95 C 290,145 285,200 265,260 C 240,325 130,375 120,445 C 110,515 145,585 175,630 C 210,670 262,700 300,715 L 410,720 L 520,715 C 558,700 610,670 645,630 C 665,585 710,515 700,445 C 690,375 590,325 555,260 C 535,200 530,145 505,95 C 485,55 445,25 410,25 Z" fill="#f0e0c8" opacity="0.25"/>`
    );
  }
  if (showSpine) {
    parts.push(renderSpine(theme, spineLineCount));
  }
  for (const cp of CHANNEL_PATHS) {
    if (isChannelActive(cp.gates, chart)) {
      const key = channelKey(cp.gates[0], cp.gates[1]);
      const color = theme.channelColor(key);
      parts.push(renderChannel(cp.path, true, color, theme.channelWidth, theme));
    }
  }
  for (const shape of CENTER_SHAPES) {
    const defined = isCenterDefined(shape.name, chart);
    const centerId = `data-center="${shape.name}"`;
    const shapeEl = renderCenter(shape, defined, theme);
    const labelEl = showCenterLabels ? centerLabel(shape, theme) : "";
    parts.push(`<g ${centerId}>${shapeEl}${labelEl}</g>`);
  }
  if (showGateNumbers) {
    const seen = /* @__PURE__ */ new Set();
    for (const gp of GATE_POSITIONS) {
      if (seen.has(gp.gate)) continue;
      seen.add(gp.gate);
      const coloring = gateColoringOf(gp.gate, chart);
      parts.push(renderGatePill(gp.gate, gp.x, gp.y, coloring, theme));
    }
  }
  if (showActivationCols) {
    parts.push(renderActivationColumns(chart.activations, theme));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${maxWidth}px;height:auto;display:block;">
${parts.join("\n")}
</svg>`;
}


if (typeof window !== "undefined") window.HDBodygraph = { renderToSVG };
