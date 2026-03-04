#!/usr/bin/env node

const THRESHOLDS = {
  text: 4.5,
  nonText: 3.0,
};

const SURFACES = {
  darkCard: "#0f172a",
  lightBackground: "#ffffff",
};

const PALETTE = {
  dark: {
    nodeFill: "#2870bd",
    nodeText: "#fcfcfd",
    labelFill: "#696e77",
    labelText: "#fcfcfd",
    rowWhite: "#ffffff",
    attributeText: "#0f172a",
    border: "#70b8ff",
    semantic: {
      success: "#3dd68c",
      warning: "#ffca16",
      danger: "#ff9592",
      info: "#70b8ff",
    },
  },
  light: {
    nodeFill: "#8b8d98",
    nodeText: "#0f172a",
    labelFill: "#80838d",
    labelText: "#0f172a",
    rowWhite: "#ffffff",
    attributeText: "#0f172a",
    border: "#60646c",
    semantic: {
      success: "#218358",
      warning: "#ab6400",
      danger: "#ce2c31",
      info: "#0d74ce",
    },
  },
};

function hexToRgb(hex) {
  const normalized = hex.trim().toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(normalized)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const value = Number.parseInt(normalized.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function toLinear(channel) {
  const srgb = channel / 255;
  if (srgb <= 0.03928) return srgb / 12.92;
  return ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * toLinear(r)) + (0.7152 * toLinear(g)) + (0.0722 * toLinear(b));
}

function contrastRatio(first, second) {
  const l1 = luminance(first);
  const l2 = luminance(second);
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (bright + 0.05) / (dark + 0.05);
}

function createChecks() {
  return [
    {
      name: "dark node fill vs dark card",
      type: "nonText",
      fg: PALETTE.dark.nodeFill,
      bg: SURFACES.darkCard,
    },
    {
      name: "dark label fill vs dark card",
      type: "nonText",
      fg: PALETTE.dark.labelFill,
      bg: SURFACES.darkCard,
    },
    {
      name: "dark border vs dark card",
      type: "nonText",
      fg: PALETTE.dark.border,
      bg: SURFACES.darkCard,
    },
    {
      name: "dark success stroke vs dark card",
      type: "nonText",
      fg: PALETTE.dark.semantic.success,
      bg: SURFACES.darkCard,
    },
    {
      name: "dark warning stroke vs dark card",
      type: "nonText",
      fg: PALETTE.dark.semantic.warning,
      bg: SURFACES.darkCard,
    },
    {
      name: "dark danger stroke vs dark card",
      type: "nonText",
      fg: PALETTE.dark.semantic.danger,
      bg: SURFACES.darkCard,
    },
    {
      name: "dark info stroke vs dark card",
      type: "nonText",
      fg: PALETTE.dark.semantic.info,
      bg: SURFACES.darkCard,
    },
    {
      name: "dark node text vs dark node fill",
      type: "text",
      fg: PALETTE.dark.nodeText,
      bg: PALETTE.dark.nodeFill,
    },
    {
      name: "dark label text vs dark label fill",
      type: "text",
      fg: PALETTE.dark.labelText,
      bg: PALETTE.dark.labelFill,
    },
    {
      name: "dark ER attribute text vs row white",
      type: "text",
      fg: PALETTE.dark.attributeText,
      bg: PALETTE.dark.rowWhite,
    },
    {
      name: "light node fill vs light background",
      type: "nonText",
      fg: PALETTE.light.nodeFill,
      bg: SURFACES.lightBackground,
    },
    {
      name: "light label fill vs light background",
      type: "nonText",
      fg: PALETTE.light.labelFill,
      bg: SURFACES.lightBackground,
    },
    {
      name: "light border vs light background",
      type: "nonText",
      fg: PALETTE.light.border,
      bg: SURFACES.lightBackground,
    },
    {
      name: "light success stroke vs light background",
      type: "nonText",
      fg: PALETTE.light.semantic.success,
      bg: SURFACES.lightBackground,
    },
    {
      name: "light warning stroke vs light background",
      type: "nonText",
      fg: PALETTE.light.semantic.warning,
      bg: SURFACES.lightBackground,
    },
    {
      name: "light danger stroke vs light background",
      type: "nonText",
      fg: PALETTE.light.semantic.danger,
      bg: SURFACES.lightBackground,
    },
    {
      name: "light info stroke vs light background",
      type: "nonText",
      fg: PALETTE.light.semantic.info,
      bg: SURFACES.lightBackground,
    },
    {
      name: "light node text vs light node fill",
      type: "text",
      fg: PALETTE.light.nodeText,
      bg: PALETTE.light.nodeFill,
    },
    {
      name: "light label text vs light label fill",
      type: "text",
      fg: PALETTE.light.labelText,
      bg: PALETTE.light.labelFill,
    },
    {
      name: "light ER attribute text vs row white",
      type: "text",
      fg: PALETTE.light.attributeText,
      bg: PALETTE.light.rowWhite,
    },
  ];
}

const checks = createChecks();
const failures = [];

for (const check of checks) {
  const threshold = THRESHOLDS[check.type];
  const ratio = contrastRatio(check.fg, check.bg);
  const pass = ratio >= threshold;
  const status = pass ? "PASS" : "FAIL";
  const rounded = ratio.toFixed(2);
  const expected = threshold.toFixed(1);
  console.log(`${status} ${check.name}: ${rounded}:1 (>= ${expected}:1)`);
  if (!pass) {
    failures.push({ ...check, ratio, threshold });
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} Mermaid contrast check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll Mermaid contrast checks passed (${checks.length} checks).`);
