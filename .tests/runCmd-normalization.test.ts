import { describe, expect, it } from "bun:test";

import { defineArgs, defineCommand, runCmd } from "../src/mod.js";

describe("runCmd argument normalization", () => {
  it("should handle template literal with single argument", async () => {
    let receivedArgs: any = null;

    const testCmd = defineCommand({
      meta: {
        name: "test",
        description: "Test command",
      },
      args: defineArgs({
        dev: {
          type: "boolean",
          description: "Run in development mode",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
      },
    });

    const isDev = true;

    // ✅ Should work with template literal
    await runCmd(testCmd, [`--dev ${isDev}`]);
    expect(receivedArgs.dev).toBe(true);
  });

  it("should handle template literal with multiple arguments", async () => {
    let receivedArgs: any = null;

    const testCmd = defineCommand({
      meta: {
        name: "test",
        description: "Test command",
      },
      args: defineArgs({
        dev: {
          type: "boolean",
          description: "Run in development mode",
        },
        build: {
          type: "string",
          description: "Build file",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
      },
    });

    const isDev = true;

    // ✅ Should work with template literal containing multiple args
    await runCmd(testCmd, [`--dev ${isDev} --build mod.ts`]);
    expect(receivedArgs.dev).toBe(true);
    expect(receivedArgs.build).toBe("mod.ts");
  });

  it("should handle mixed array with template literals and regular strings", async () => {
    let receivedArgs: any = null;

    const testCmd = defineCommand({
      meta: {
        name: "test",
        description: "Test command",
      },
      args: defineArgs({
        dev: {
          type: "boolean",
          description: "Run in development mode",
        },
        build: {
          type: "string",
          description: "Build file",
        },
        pub: {
          type: "boolean",
          description: "Publish flag",
        },
        someBoolean: {
          type: "boolean",
          description: "Some boolean flag",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
      },
    });

    const isDev = true;

    // ✅ Should work with mixed array
    await runCmd(testCmd, [
      `--dev ${isDev} --build mod.ts`,
      "--pub true",
      "--someBoolean",
    ]);

    expect(receivedArgs.dev).toBe(true);
    expect(receivedArgs.build).toBe("mod.ts");
    expect(receivedArgs.pub).toBe(true);
    expect(receivedArgs.someBoolean).toBe(true);
  });

  it("should handle string values correctly", async () => {
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
        file: {
          type: "string",
          description: "File path",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
      },
    });

    const userName = "John";
    const fileName = "test.ts";

    // ✅ Should work with string values in template literals
    await runCmd(testCmd, [`--name ${userName} --file ${fileName}`]);
    expect(receivedArgs.name).toBe("John");
    expect(receivedArgs.file).toBe("test.ts");
  });

  it("should handle boolean flags without values", async () => {
    let receivedArgs: any = null;

    const testCmd = defineCommand({
      meta: {
        name: "test",
        description: "Test command",
      },
      args: defineArgs({
        verbose: {
          type: "boolean",
          description: "Verbose output",
        },
        quiet: {
          type: "boolean",
          description: "Quiet mode",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
      },
    });

    // ✅ Should work with boolean flags
    await runCmd(testCmd, ["--verbose", "--quiet"]);
    expect(receivedArgs.verbose).toBe(true);
    expect(receivedArgs.quiet).toBe(true);
  });

  it("should handle mixed boolean values", async () => {
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
        prod: {
          type: "boolean",
          description: "Production mode",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
      },
    });

    const isDev = true;
    const isProd = false;

    // ✅ Should work with mixed boolean values
    await runCmd(testCmd, [`--dev ${isDev}`, `--prod ${isProd}`]);
    expect(receivedArgs.dev).toBe(true);
    expect(receivedArgs.prod).toBe(false);
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
    await runCmd(testCmd, ["--name", "John", "--age", "25", "--active"]);
    expect(receivedArgs.name).toBe("John");
    expect(receivedArgs.age).toBe(25);
    expect(receivedArgs.active).toBe(true);
  });
});
