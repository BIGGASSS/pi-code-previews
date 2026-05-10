import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "index.ts",
  format: "esm",
  fixedExtension: false,
  sourcemap: true,
  dts: {
    sourcemap: true,
  },
});
