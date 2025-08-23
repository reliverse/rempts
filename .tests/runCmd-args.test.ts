import { describe, expect, it } from "bun:test";

import { defineArgs, defineCommand, runCmd } from "../src/mod";

describe("runCmd argument handling", () => {
  it("should correctly parse boolean arguments when passed as separate array elements", async () => {
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

    // ✅ Correct way - each argument as separate array element
    await runCmd(testCmd, ["--dev", "true"]);
    expect(receivedArgs.dev).toBe(true);

    // Test with false
    await runCmd(testCmd, ["--dev", "false"]);
    expect(receivedArgs.dev).toBe(false);

    // Test with just the flag (should default to true for boolean)
    await runCmd(testCmd, ["--dev"]);
    expect(receivedArgs.dev).toBe(true);
  });

  it("should correctly parse string arguments when passed as separate array elements", async () => {
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
      }),
      async run({ args }) {
        receivedArgs = args;
      },
    });

    // ✅ Correct way - each argument as separate array element
    await runCmd(testCmd, ["--name", "John"]);
    expect(receivedArgs.name).toBe("John");
  });

  it("should handle multiple arguments correctly", async () => {
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
        name: {
          type: "string",
          description: "Your name",
        },
        verbose: {
          type: "boolean",
          description: "Verbose output",
        },
      }),
      async run({ args }) {
        receivedArgs = args;
      },
    });

    // ✅ Correct way - multiple arguments as separate array elements
    await runCmd(testCmd, ["--dev", "true", "--name", "John", "--verbose"]);
    expect(receivedArgs.dev).toBe(true);
    expect(receivedArgs.name).toBe("John");
    expect(receivedArgs.verbose).toBe(true);
  });
});
