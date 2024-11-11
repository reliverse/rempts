import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
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
    inlineDependencies: true,
    esbuild: {
      target: "es2022",
      minify: true,
    },
  },
});
