// examples/reliverse/install-deps.ts: An advanced example of a CLI application that installs dependencies.
// Trying to create a drop-in replacement for @clack/prompts, unjs/consola, @inquirer/prompts, withastro/astro, etc.

import { Type, type Static } from "@sinclair/typebox";
import { version } from "~/../package.json";

import { startPrompt, textPrompt } from "~/main";

async function main() {
  await startPrompt({
    id: "start",
    type: "start",
    title: `@reliverse/prompts v${version}`,
    titleColor: "inverse",
    titleTypography: "bold",
  });

  const schema = Type.Object({
    username: Type.String({ minLength: 3, maxLength: 20 }),
  });
  type UserInput = Static<typeof schema>;

  const usernameResult = await textPrompt({
    id: "username",
    type: "text",
    title: "We're glad you decided to test our library!",
    titleColor: "blue",
    titleTypography: "bold",
    content: "Let's get to know each other! What's your username?",
    contentTypography: "italic",
    contentColor: "dim",
    schema: schema.properties.username,
  });

  // const dir = await prompts({
  //   id: "dir",
  //   type: "text",
  //   title: "Where should we create your project?",
  //   default: "./sparkling-solid",
  // });

  // await prompts({
  //   type: "end",
  //   id: "end",
  //   title: `Problems? ${colorize("https://github.com/blefnk/reliverse/prompts", "cyanBright")}`,
  // });

  const userInput: UserInput = {
    username: usernameResult,
  };
  console.log(userInput);
  process.exit(0);
}

await main().catch((error) => {
  console.error("│  An error occurred:\n", error.message);
  console.error(
    "└  Please report this issue at https://github.com/blefnk/reliverse/issues",
  );
  process.exit(1);
});
