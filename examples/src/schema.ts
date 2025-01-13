import { colorMap } from "@reliverse/relinka";
import { Type, type Static } from "@sinclair/typebox";
import {
  buildRegExp,
  choiceOf,
  endOfString,
  startOfString,
} from "ts-regex-builder";

// You can define pieces of the schema separately and then use them in the main schema.
const colorSchema = Type.Enum(
  Object.keys(colorMap).reduce<Record<keyof typeof colorMap, string>>(
    (acc, key) => {
      acc[key] = key;
      return acc;
    },
    {} as Record<keyof typeof colorMap, string>,
  ),
);

const usernameRegexPrecise = buildRegExp([
  startOfString,
  choiceOf(
    // a-zA-Z0-9 and Cyrillic characters
    /[a-zA-Z0-9\u0400-\u04FF]+/,
  ),
  endOfString,
]);

// @reliverse/prompts allows you to define the schema once and reuse it for each prompt.
// This is useful if you want to validate the input of multiple prompts using TypeBox.
export const schema = Type.Object({
  username: Type.RegExp(usernameRegexPrecise, {
    description:
      "Username must be 2-20 characters long and contain only latin letters, numbers, or cyrillic characters.",
  }),
  dir: Type.String({ minLength: 1 }),
  spinner: Type.Boolean(),
  password: Type.String({ minLength: 4 }),
  age: Type.Number({ minimum: 18, maximum: 99 }),
  lang: Type.String(),
  color: colorSchema,
  birthday: Type.String({ minLength: 10, maxLength: 10 }),
  langs: Type.Array(Type.String()),
  toggle: Type.Boolean(),
});

// You can define the type to use in the result object, populated with results from the prompts.
export type UserInput = Static<typeof schema>;
