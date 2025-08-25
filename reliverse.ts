import { defineConfig } from "./reltypes";

/**
 * Reliverse Bundler Configuration
 * Hover over a field to see more details
 * @see https://github.com/reliverse/dler
 */
export default defineConfig({
  // Bump configuration
  bumpDisable: false,
  bumpFilter: ["package.json", "reliverse.ts"],
  bumpMode: "patch",

  // Common configuration
  commonPubPause: false,
  commonPubRegistry: "npm",
  commonVerbose: false,

  // Core configuration
  coreBuildOutDir: "bin",
  coreDeclarations: true,
  coreDescription:
    "@reliverse/rempts is a modern, type-safe toolkit for building delightful cli experiences. it's fast, flexible, and made for developer happiness. file-based commands keep things simple.",
  coreEntryFile: "mod.ts",
  coreEntrySrcDir: "src",
  // coreIsCLI: {
  // enabled: false,
  // scripts: { mycli: "mycli.ts" },
  // },

  // JSR-only config
  distJsrAllowDirty: true,
  distJsrBuilder: "jsr",
  distJsrDirName: "dist-jsr",
  distJsrDryRun: false,
  distJsrFailOnWarn: false,
  distJsrGenTsconfig: false,
  distJsrOutFilesExt: "ts",
  distJsrSlowTypes: true,

  // NPM-only config
  distNpmBuilder: "mkdist",
  distNpmDirName: "dist-npm",
  distNpmOutFilesExt: "js",

  // Libraries Dler Plugin
  // Publish specific dirs as separate packages
  // This feature is experimental at the moment
  // Please commit your changes before using it
  libsActMode: "main-project-only",
  libsDirDist: "dist-libs",
  libsDirSrc: "src/libs",
  libsList: {
    // "@acme/cli-libName": {
    //   libDeclarations: true,
    //   libDescription: "@acme/cli defineConfigAcme",
    //   libDirName: "libName",
    //   libMainFile: "libName/libName-mod.ts",
    //   libPkgKeepDeps: true,
    //   libTranspileMinify: true,
    //   libPubPause: false,
    //   libPubRegistry: "npm",
    // },
  },

  // @reliverse/relinka logger setup
  logsFileName: ".logs/relinka.log",
  logsFreshFile: true,

  // Specifies what resources to send to npm and jsr registries.
  // coreBuildOutDir (e.g. "bin") dir is automatically included.
  // The following is also included if publishArtifacts is {}:
  // - global: ["package.json", "README.md", "LICENSE"]
  // - dist-jsr,dist-libs/jsr: ["jsr.json"]
  publishArtifacts: {
    global: ["package.json", "README.md", "LICENSE"],
    "dist-jsr": [],
    "dist-npm": [],
    "dist-libs": {},
  },

  // Files with these extensions will be built
  // Any other files will be copied as-is to dist
  buildPreExtensions: ["ts", "js"],
  // If you need to exclude some ts/js files from being built,
  // you can store them in the dirs with buildTemplatesDir name
  buildTemplatesDir: "templates",

  // Dependency filtering
  // Global is always applied
  filterDepsPatterns: {
    global: [
      "@types",
      "biome",
      "eslint",
      "knip",
      "prettier",
      "typescript",
      "@reliverse/rse",
      "@reliverse/dler",
      "!@reliverse/rse-sdk",
      "!@reliverse/dler-sdk",
    ],
    "dist-npm": [],
    "dist-jsr": [],
    "dist-libs": {},
  },

  // Code quality tools
  // Available: tsc, eslint, biome, knip, dler-check
  runBeforeBuild: [],
  // Available: dler-check
  runAfterBuild: [],

  // Build hooks
  hooksBeforeBuild: [
    // async () => {
    //   await someAsyncOperation();
    // }
  ],
  hooksAfterBuild: [
    // async () => {
    //   await someAsyncOperation();
    // }
  ],

  postBuildSettings: {
    deleteDistTmpAfterBuild: true,
  },

  // Build setup
  // transpileAlias: {},
  // transpileClean: true,
  // transpileEntries: [],
  transpileEsbuild: "es2023",
  // transpileExternals: [],
  transpileFailOnWarn: false,
  transpileFormat: "esm",
  transpileMinify: true,
  // transpileParallel: false,
  transpilePublicPath: "/",
  // transpileReplace: {},
  // transpileRollup: {
  //   alias: {},
  //   commonjs: {},
  //   dts: {},
  //   esbuild: {},
  //   json: {},
  //   replace: {},
  //   resolve: {},
  // },
  // transpileShowOutLog: false,
  transpileSourcemap: "none",
  transpileSplitting: false,
  transpileStub: false,
  // transpileStubOptions: { jiti: {} },
  transpileTarget: "node",
  transpileWatch: false,
  // transpileWatchOptions: undefined,
});
