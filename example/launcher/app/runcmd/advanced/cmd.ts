import { relinka } from "@reliverse/relinka";
import { runCmd } from "@reliverse/rempts";
import { defineArgs, defineCommand } from "@reliverse/rempts";

import { getRuncmdAdvancedCmd } from "@/launcher/app/cmds";

export default defineCommand({
  meta: {
    name: "web",
    description: "Start the rse web ui",
  },
  args: defineArgs({
    dev: {
      type: "boolean",
      description: "Run in development mode",
    },
    build: {
      type: "string",
      description: "Build file",
      required: false,
    },
    pub: {
      type: "boolean",
      description: "Publish flag",
      required: false,
    },
    someBoolean: {
      type: "boolean",
      description: "Some boolean flag",
      required: false,
    },
  }),
  async run({ args }) {
    if (!process.versions.bun) {
      throw new Error(
        "This command requires Bun runtime. Please install Bun first: https://bun.sh/get",
      );
    }
    relinka("box", "isDev", args.dev);
    relinka("box", "build", args.build);
    relinka("box", "pub", args.pub);
    relinka("box", "someBoolean", args.someBoolean);

    if (args.dev) {
      relinka("box", "Running in development mode with hot reloading...");
      relinka.log("This is only a test file, nothing to see more here 😅");
    } else {
      relinka("box", "Running in production mode...");
      relinka.log("This is only a test file, nothing to see more here 😅");
    }
  },
});

export async function showWebUiMenu() {
  const isDev = true;

  // template literals work automatically and are normalized to ["--dev", "true"]
  await runCmd(await getRuncmdAdvancedCmd(), [`--dev ${isDev}`]);

  // multiple arguments in template literal
  await runCmd(await getRuncmdAdvancedCmd(), [`--dev ${isDev} --build mod.ts`]);

  // mixed array with template literals and regular strings
  await runCmd(await getRuncmdAdvancedCmd(), [
    `--dev ${isDev} --build mod.ts`,
    "--pub true",
    "--someBoolean",
  ]);

  // each argument as separate array element
  await runCmd(await getRuncmdAdvancedCmd(), ["--dev", isDev.toString()]);
}
