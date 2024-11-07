import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  externals: ["picocolors"],
  declaration: true,
  entries: [
    {
      outDir: "dist",
      builder: "mkdist",
      input: "src",
      format: "esm",
      ext: "js",
    },
  ],
  rollup: {
    emitCJS: false,
    esbuild: {
      target: "es2022",
    },
  },
});
