import { relinka } from "@reliverse/relinka";
import { callCmd, defineArgs, defineCommand, runMain, selectPrompt } from "~/mod";

// !! Note: Commands must be defined before they are used to avoid JS hoisting issue
const helloReliverse = defineCommand({
  meta: {
    name: "hello-reliverse",
    version: "1.0.0",
    description: "Test command for callCmd functionality",
  },
  args: defineArgs({
    prod: {
      type: "boolean",
      description: "production mode",
      alias: "p",
    },
    bundler: {
      type: "string",
      default: "rollup",
      description: "bundler name",
    },
    hmr: {
      type: "boolean",
      description: "disable hot module replacement",
      default: true,
    },
    workDir: {
      type: "string",
      description: "working directory",
    },
    entry: {
      type: "array",
      description: "paths to entrypoints",
      default: ["src/index.ts"],
    },
    dst: {
      type: "positional",
      description: "path to output directory",
      allowed: [".output", "build"] as const, // as const for literal type inference
      default: ".output",
    },
    mode: {
      type: "string",
      description: "Build mode",
      allowed: ["development", "production", "test"] as const,
      default: "development",
    },
    verbose: {
      type: "boolean",
      allowed: [true, false] as const,
      default: false,
    },
  }),
  async run({ args }) {
    relinka("info", "Hello, Reliverse!");
    relinka("log", "Parsed args:", args);
    relinka("success", "✅ Test 1 passed");
  },
});

const helloBleverse = defineCommand({
  meta: {
    name: "hello-bleverse",
    version: "1.0.0",
    description: "Test command for callCmd functionality",
  },
  args: defineArgs({
    prod: {
      type: "boolean",
      description: "production mode",
      alias: "p",
    },
    bundler: {
      type: "string",
      default: "rollup",
      description: "bundler name",
    },
    hmr: {
      type: "boolean",
      description: "disable hot module replacement",
      default: true,
    },
    workDir: {
      type: "string",
      description: "working directory",
    },
    entry: {
      type: "array",
      description: "paths to entrypoints",
      default: ["src/index.ts"],
    },
    dst: {
      type: "positional",
      description: "path to output directory",
      allowed: [".output", "build"] as const, // as const for literal type inference
      default: ".output",
    },
    mode: {
      type: "string",
      description: "Build mode",
      allowed: ["development", "production", "test"] as const,
      default: "development",
    },
    verbose: {
      type: "boolean",
      allowed: [true, false] as const,
      default: false,
    },
  }),
  async run({ args }) {
    relinka("info", "Hello, Reliverse!");
    relinka("log", "Parsed args:", args);
    relinka("success", "✅ Test 2 passed");
  },
});

const hooksCalled = { init: false, exit: false };

const helloLifecycle = defineCommand({
  meta: {
    name: "hello-lifecycle",
    version: "1.0.0",
    description: "Test command for callCmd functionality",
  },
  args: defineArgs({
    name: { type: "string", default: "world" },
  }),
  onCmdInit: async (ctx) => {
    relinka("log", "🪝 onCmdInit called with:", ctx.args);
    hooksCalled.init = true;
  },
  onCmdExit: async (ctx) => {
    relinka("log", "🪝 onCmdExit called with:", ctx.args);
    hooksCalled.exit = true;
  },
  run: ({ args }) => {
    const { name } = args;
    const strName = String(name);
    relinka("log", `Hello, ${strName}!`);
  },
});

const main = defineCommand({
  meta: {
    name: "cli",
    description: "Rempts Example CLI",
  },
  async run() {
    const cmdToTest = await selectPrompt({
      message: "Select a command to test",
      options: [
        {
          label: "hello-reliverse",
          value: "hello-reliverse",
        },
        {
          label: "hello-bleverse",
          value: "hello-bleverse",
        },
        {
          label: "hello-lifecycle",
          value: "hello-lifecycle",
        },
      ],
    });

    if (cmdToTest === "hello-reliverse") {
      // Test 1: Call with argv array (CLI-style)
      relinka("info", "📋 Test 1: CLI-style argv array");
      await callCmd(
        helloReliverse,
        [
          ".output", // positional argument (e.g. typescript is not available in this case, but e.g. "dist" will throw a runtime error, because only ".output" | "build" are allowed)
          "--prod",
          "--bundler=webpack",
          "--entry=src/main.ts,src/worker.ts",
          "--workDir=/tmp/build",
        ],
        { debug: true },
      );
    }

    if (cmdToTest === "hello-bleverse") {
      // Test 2: Call with object (programmatic style)
      relinka("log", "\n📋 Test 2: Programmatic object style");
      await callCmd(
        helloBleverse,
        {
          dst: ".output", // args.dst should be ".output" | "build"
          prod: true,
          bundler: "esbuild",
          entry: ["src/app.ts", "src/cli.ts"],
          hmr: false,
          mode: "production", // args.mode should be "development" | "production" | "test"
          verbose: true, // args.verbose should be boolean
        },
        { debug: true },
      );
    }

    if (cmdToTest === "hello-lifecycle") {
      // Test 3: Test with lifecycle hooks
      relinka("log", "\n📋 Test 3: Lifecycle hooks");
      await callCmd(helloLifecycle, { name: "callCmd" }, { useLifecycleHooks: true });

      if (hooksCalled.init && hooksCalled.exit) {
        relinka("success", "✅ Test 3 passed - lifecycle hooks called");
      } else {
        throw new Error("Lifecycle hooks were not called properly");
      }
    }

    relinka("success", "\n🎉 All tests passed! callCmd implementation is working correctly.");
  },
});

await runMain(main);
