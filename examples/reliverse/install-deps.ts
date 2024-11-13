// examples/reliverse/install-deps.ts: An advanced example of a CLI application that installs dependencies.
// Trying to create a drop-in replacement for @clack/prompts, unjs/consola, @inquirer/prompts, withastro/astro, etc.

import { Type, type Static } from "@sinclair/typebox";
import { version } from "~/../package.json";
import { errorHandler } from "examples/helpers/error-handler";

import type { OptionalPromptOptions } from "~/types/prod";

import { promptsAnimateText } from "~/components/animate";
import { pressAnyKeyPrompt } from "~/components/any-key";
import { promptsAsciiArt } from "~/components/ascii-art";
import { promptsDisplayResults } from "~/components/results";
import { endPrompt, startPrompt, textPrompt } from "~/main";

const basicConfig = {
  titleColor: "cyanBright",
  titleTypography: "bold",
  borderColor: "viceGradient",
} satisfies OptionalPromptOptions;
const extendedConfig = {
  ...basicConfig,
  contentTypography: "italic",
  contentColor: "dim",
} satisfies OptionalPromptOptions;

await promptsAsciiArt({
  message: "reliverse",
});

export async function installDeps() {
  await startPrompt({
    id: "start",
    title: `@reliverse/prompts v${version}`,
    ...basicConfig,
    titleColor: "inverse",
    clearConsole: true,
  });

  const schema = Type.Object({
    username: Type.String({ minLength: 3, maxLength: 20 }),
    dir: Type.String({ minLength: 1 }),
  });
  type UserInput = Static<typeof schema>;

  const username = await textPrompt({
    id: "username",
    title: "We're glad you decided to test our library!",
    content: "Let's get to know each other!\nWhat's your username?",
    schema: schema.properties.username,
    ...extendedConfig,
  });

  const dir = await textPrompt({
    id: "dir",
    title: ` Great! Nice to meet you, ${username}!`,
    content: "Where should we create your project?",
    schema: schema.properties.dir,
    ...extendedConfig,
    titleVariant: "doubleBox",
    defaultValue: "./prefilled-default-value",
    hint: "Press <Enter> to use the default value.",
  });

  const userInput: UserInput = {
    username,
    dir,
  };

  await promptsAnimateText({
    title: "🤯 By the way, you can even have animated messages!",
    titleAnimated: `│  By the way, you can even have animated messages!`,
    anim: "neon",
    delay: 2000,
    ...basicConfig,
    titleColor: "passionGradient",
    titleTypography: "bold",
  });

  await pressAnyKeyPrompt(`${username}, press any key to exit...`);

  await endPrompt({
    id: "end",
    title: "👉 Learn more at https://docs.reliverse.org/prompts",
    titleAnimated: `│  Learn more at https://docs.reliverse.org/prompts`,
    titleAnimation: "glitch",
    ...basicConfig,
    titleColor: "retroGradient",
    titleTypography: "bold",
    titleAnimationDelay: 2000,
  });

  await promptsDisplayResults({
    results: JSON.stringify(userInput, null, 2),
  });
}

await installDeps().catch((error) => errorHandler(error));
