import { describe, expect, it } from "bun:test";

import {
  defineArgs,
  defineCommand,
  runCmdWithSubcommands,
} from "../src/mod.js";

describe("runCmdWithSubcommands", () => {
  it("should handle subcommand with template literals", async () => {
    let receivedArgs: any = null;
    let receivedCommand = "";

    const buildCmd = defineCommand({
      meta: {
        name: "build",
        description: "Build command",
      },
      args: defineArgs({
        input: {
          type: "string",
          description: "Input file",
        },
        someBoolean: {
          type: "boolean",
          description: "Some boolean flag",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
        receivedCommand = "build";
      },
    });

    const mainCmd = defineCommand({
      meta: {
        name: "main",
        description: "Main command",
      },
      commands: {
        build: async () => buildCmd,
      },
    });

    const isDev = true;

    // ✅ Should work with subcommand and template literals
    await runCmdWithSubcommands(mainCmd, [
      `build --input src/mod.ts --someBoolean ${isDev}`,
    ]);
    expect(receivedCommand).toBe("build");
    expect(receivedArgs.input).toBe("src/mod.ts");
    expect(receivedArgs.someBoolean).toBe(true);
  });

  it("should handle subcommand with positional arguments", async () => {
    let receivedArgs: any = null;
    let receivedCommand = "";

    const buildCmd = defineCommand({
      meta: {
        name: "build",
        description: "Build command",
      },
      args: defineArgs({
        input: {
          type: "positional",
          description: "Input file",
          required: true,
        },
        someBoolean: {
          type: "boolean",
          description: "Some boolean flag",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
        receivedCommand = "build";
      },
    });

    const mainCmd = defineCommand({
      meta: {
        name: "main",
        description: "Main command",
      },
      commands: {
        build: async () => buildCmd,
      },
    });

    // ✅ Should work with subcommand and positional arguments
    await runCmdWithSubcommands(mainCmd, ["build src/mod.ts --someBoolean"]);
    expect(receivedCommand).toBe("build");
    expect(receivedArgs.input).toBe("src/mod.ts");
    expect(receivedArgs.someBoolean).toBe(true);
  });

  it("should handle nested subcommands", async () => {
    let receivedArgs: any = null;
    let receivedCommand = "";

    const someSubCmd = defineCommand({
      meta: {
        name: "someSubCmd",
        description: "Some subcommand",
      },
      args: defineArgs({
        input: {
          type: "positional",
          description: "Input file",
          required: true,
        },
        cjs: {
          type: "boolean",
          description: "CJS flag",
          default: true,
        },
      }),
      async run({ args }) {
        receivedArgs = args;
        receivedCommand = "someSubCmd";
      },
    });

    const buildCmd = defineCommand({
      meta: {
        name: "build",
        description: "Build command",
      },
      commands: {
        someSubCmd: async () => someSubCmd,
      },
    });

    const mainCmd = defineCommand({
      meta: {
        name: "main",
        description: "Main command",
      },
      commands: {
        build: async () => buildCmd,
      },
    });

    // ✅ Should work with nested subcommands
    await runCmdWithSubcommands(mainCmd, [
      "build someSubCmd src/mod.ts --no-cjs",
    ]);
    expect(receivedCommand).toBe("someSubCmd");
    expect(receivedArgs.input).toBe("src/mod.ts");
    expect(receivedArgs.cjs).toBe(false);
  });

  it("should handle mixed array with subcommands", async () => {
    let receivedArgs: any = null;
    let receivedCommand = "";

    const someSubCmd = defineCommand({
      meta: {
        name: "someSubCmd",
        description: "Some subcommand",
      },
      args: defineArgs({
        input: {
          type: "positional",
          description: "Input file",
          required: true,
        },
        cjs: {
          type: "boolean",
          description: "CJS flag",
          default: true,
        },
        verbose: {
          type: "boolean",
          description: "Verbose flag",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
        receivedCommand = "someSubCmd";
      },
    });

    const buildCmd = defineCommand({
      meta: {
        name: "build",
        description: "Build command",
      },
      commands: {
        someSubCmd: async () => someSubCmd,
      },
    });

    const mainCmd = defineCommand({
      meta: {
        name: "main",
        description: "Main command",
      },
      commands: {
        build: async () => buildCmd,
      },
    });

    // ✅ Should work with mixed array containing subcommands
    await runCmdWithSubcommands(mainCmd, [
      "build someSubCmd src/mod.ts",
      "--no-cjs",
      "--verbose",
    ]);
    expect(receivedCommand).toBe("someSubCmd");
    expect(receivedArgs.input).toBe("src/mod.ts");
    expect(receivedArgs.cjs).toBe(false);
    expect(receivedArgs.verbose).toBe(true);
  });

  it("should handle single command with template literals (backward compatibility)", async () => {
    let receivedArgs: any = null;

    const testCmd = defineCommand({
      meta: {
        name: "test",
        description: "Test command",
      },
      args: defineArgs({
        dev: {
          type: "boolean",
          description: "Development mode",
        },
        name: {
          type: "string",
          description: "Name",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
      },
    });

    const isDev = true;
    const userName = "John";

    // ✅ Should work with single command and template literals
    await runCmdWithSubcommands(testCmd, [`--dev ${isDev} --name ${userName}`]);
    expect(receivedArgs.dev).toBe(true);
    expect(receivedArgs.name).toBe("John");
  });

  it("should preserve original behavior for properly separated arguments", async () => {
    let receivedArgs: any = null;

    const testCmd = defineCommand({
      meta: {
        name: "test",
        description: "Test command",
      },
      args: defineArgs({
        name: {
          type: "string",
          description: "Your name",
        },
        age: {
          type: "number",
          description: "Your age",
        },
        active: {
          type: "boolean",
          description: "Active status",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
      },
    });

    // ✅ Should still work with properly separated arguments
    await runCmdWithSubcommands(testCmd, [
      "--name",
      "John",
      "--age",
      "25",
      "--active",
    ]);
    expect(receivedArgs.name).toBe("John");
    expect(receivedArgs.age).toBe(25);
    expect(receivedArgs.active).toBe(true);
  });
});
