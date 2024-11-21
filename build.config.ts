import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  entries: [
    {
      builder: "mkdist",
      outDir: "output",
      format: "esm",
      input: "src",
      ext: "js",
    },
  ],
  rollup: {
    emitCJS: false,
    inlineDependencies: true,
    esbuild: {
      exclude: ["**/*.test.ts"],
      target: "es2022",
      minify: true,
    },
  },
});
