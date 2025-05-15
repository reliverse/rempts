import { relinka } from "@reliverse/relinka";

import { defineArgs, defineCommand, runCmd } from "~/mod.js";

import { cmdMinimal } from "../cmds.js";

export default defineCommand({
  meta: {
    name: "runcmd",
    description:
      "Demonstrate how to use runCmd() to invoke another command programmatically.",
  },
  args: defineArgs({
    name: {
      type: "string",
      description: "your name",
    },
  }),
  async run({ args }) {
    // const username = args.name ?? "Alice";
    const username = args.name; // intentionally missing fallback
    relinka(
      "info",
      `Running the 'minimal' command using runCmd() with name='${username}'`,
    );
    await runCmd(await cmdMinimal(), ["--name", username]);
    relinka("log", "Done running 'minimal' via runCmd().");
  },
});
