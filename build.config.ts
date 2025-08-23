import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["./src/mod"],
  outDir: "./dist-npm/bin",
  declaration: true,
});

// import { defineBuildConfig } from "obuild/config";
/* export default defineBuildConfig({
  sourcemap: true,
  entries: [
    {
      type: "bundle",
      input: ["./src/mod.ts"],
      outDir: "./dist-npm/bin",
      // minify: false,
      // stub: false,
      // rolldown: {}, // https://rolldown.rs/reference/config-options
      // dts: {}, // https://github.com/sxzz/rolldown-plugin-dts#options
    },
    // {
    //   type: "transform",
    //   input: "./src/runtime",
    //   outDir: "./dist/runtime",
    // minify: false,
    // stub: false,
    // oxc: {},
    // resolve: {}
    // },
  ],
  //   hooks: {
  // start: (ctx) => {},
  // end: (ctx) => {},
  // entries: (entries, ctx) => {},
  // rolldownConfig: (config, ctx) => {},
  // rolldownOutput: (output, res, ctx) => {},
  //   },
}); */
