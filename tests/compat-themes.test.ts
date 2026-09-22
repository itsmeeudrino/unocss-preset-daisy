import { describe, expect, test } from "bun:test";
import { themeNames, themeVars } from "./compat.ts";

// Every theme must ship the full variable contract daisyUI defines:
// 20 color vars + radii + sizes + border/depth/noise. Spot values are
// byte-checked against upstream v5.7.43 so corruption is caught.

const EXPECTED_THEMES = [
  "abyss",
  "acid",
  "aqua",
  "autumn",
  "black",
  "bumblebee",
  "business",
  "caramellatte",
  "cmyk",
  "coffee",
  "corporate",
  "cupcake",
  "cyberpunk",
  "dark",
  "dim",
  "dracula",
  "emerald",
  "fantasy",
  "forest",
  "garden",
  "halloween",
  "lemonade",
  "light",
  "lofi",
  "luxury",
  "night",
  "nord",
  "pastel",
  "retro",
  "silk",
  "sunset",
  "synthwave",
  "valentine",
  "winter",
  "wireframe",
].sort();

const COLOR_VARS = [
  "base-100",
  "base-200",
  "base-300",
  "base-content",
  "primary",
  "primary-content",
  "secondary",
  "secondary-content",
  "accent",
  "accent-content",
  "neutral",
  "neutral-content",
  "info",
  "info-content",
  "success",
  "success-content",
  "warning",
  "warning-content",
  "error",
  "error-content",
].map((n) => `--color-${n}`);

const OTHER_VARS = [
  "--radius-selector",
  "--radius-field",
  "--radius-box",
  "--size-selector",
  "--size-field",
  "--border",
  "--depth",
  "--noise",
];

describe("theme contract", () => {
  test("all 35 upstream themes present", async () => {
    expect(await themeNames()).toEqual(EXPECTED_THEMES);
  });

  for (const theme of EXPECTED_THEMES) {
    test(`${theme}: full variable contract`, async () => {
      const vars = await themeVars(theme);
      for (const name of [...COLOR_VARS, ...OTHER_VARS]) {
        expect(vars.has(name), `${theme} missing ${name}`).toBe(true);
      }
      for (const name of COLOR_VARS) {
        expect(vars.get(name), `${theme} ${name} not oklch`).toMatch(
          /^oklch\(/,
        );
      }
    });
  }

  test("spot values match upstream v5.7.43", async () => {
    const light = await themeVars("light");
    expect(light.get("--color-primary")).toBe("oklch(45% 0.24 277.023)");
    expect(light.get("--color-base-100")).toBe("oklch(100% 0 0)");
    expect(light.get("--color-accent-content")).toBe(
      "oklch(38% 0.063 188.416)",
    );
    const dark = await themeVars("dark");
    expect(dark.get("--color-base-100")).toBe("oklch(25.33% 0.016 252.42)");
    expect(dark.get("--color-primary")).toBe("oklch(58% 0.233 277.117)");
    expect(dark.get("--color-accent")).toBe("oklch(77% 0.152 181.912)");
    expect(dark.get("--color-accent-content")).toBe("oklch(38% 0.063 188.416)");
    expect(dark.get("--color-warning-content")).toBe("oklch(41% 0.112 45.904)");
    expect(dark.get("--color-error-content")).toBe("oklch(27% 0.105 12.094)");
  });
});
