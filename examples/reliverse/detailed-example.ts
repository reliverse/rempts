// examples/reliverse/detailed-example.ts: An advanced example of a CLI application with a beautiful UI.
// This example demonstrates how we create a drop-in replacement for libraries like @inquirer/prompts.

import { Type, type Static } from "@sinclair/typebox";
import { version } from "~/../package.json";
import { detect } from "detect-package-manager";
import { errorHandler } from "examples/helpers/error-handler";
import { emojify } from "node-emoji";
import { underline } from "picocolors";

import type { OptionalPromptOptions } from "~/types/prod";

import { animateText } from "~/components/animate";
import { pressAnyKeyPrompt } from "~/components/any-key";
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

export async function detailedExample() {
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
    title: "We're glad you're testing our interactive prompts library!",
    content: "Let's get to know each other!\nWhat's your username?",
    schema: schema.properties.username,
    ...extendedConfig,
  });

  const dir = await textPrompt({
    id: "dir",
    title: `Great! Nice to meet you, ${username}!`,
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

  const pm = await detect();
  let notification = underline(`${username}, press any key to continue...`);
  if (pm === "bun") {
    notification += `\n\nDid you know? Bun currently may crash if you press Enter while setTimeout\nis running. So please avoid doing that in the prompts after this one! 😅`;
  }

  await pressAnyKeyPrompt(notification);

  await animateText({
    title: emojify(
      "ℹ  :exploding_head: Our library even supports animated messages and emojis!",
    ),
    anim: "neon",
    delay: 2000,
    ...basicConfig,
    titleColor: "passionGradient",
    titleTypography: "bold",
  });

  await endPrompt({
    id: "end",
    title: emojify(
      "ℹ  :books: Learn the docs here: https://docs.reliverse.org/prompts",
    ),
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

await detailedExample().catch((error) => errorHandler(error));
