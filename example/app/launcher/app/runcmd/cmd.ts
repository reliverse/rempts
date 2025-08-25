import { relinka } from "@reliverse/relinka";

import { defineArgs, defineCommand } from "~/mod";

export default defineCommand({
  meta: {
    name: "runcmd",
    description: "Demonstrate how to use runCmd() to invoke another command programmatically.",
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
    relinka("info", `Running the 'minimal' command using runCmd() with name='${username}'`);

    // ✅ Correct way - each argument as separate array element
    // await runCmd(await getCmdMinimal(), ["--name", username]);

    // ❌ Wrong way - template literal creates single string element
    // await runCmd(await getCmdMinimal(), [`--name ${username}`]); // This would create ["--name John"] instead of ["--name", "John"]

    relinka("log", "Done running 'minimal' via runCmd().");
  },
});
