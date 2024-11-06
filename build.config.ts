import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/main.ts",
    {
      builder: "mkdist",
      outDir: "dist",
      input: "src",
    },
  ],
  rollup: {
    emitCJS: false,
  },
  externals: ["picocolors"],
});
