import {
  buildRegExp,
  choiceOf,
  endOfString,
  startOfString,
} from "ts-regex-builder";

import type { ColorName } from "~/types.js";

import { colorMap } from "~/main.js";

/**
 * @reliverse/prompts allows you to define the schema once and reuse it for each prompt.
 * This is useful if you want to validate the input of multiple prompts using some validator.
 */

// Build a list of valid color keys from the colorMap.
const validColors = Object.keys(colorMap);

// Build username regex that allows a-z, A-Z, 0-9 and Cyrillic characters.
const usernameRegexPrecise = buildRegExp([
  startOfString,
  choiceOf(
    // a-z, A-Z, 0-9 and Cyrillic characters
    /[a-zA-Z0-9\u0400-\u04FF]+/,
  ),
  endOfString,
]);

// Define a plain schema object.
// Each property may have its type and validation rules.
// You may plug this into your own validation system.
export const schema = {
  username: {
    // Regular expression for validation
    regex: usernameRegexPrecise,
    // Additional human-readable description
    description:
      "Username must be 2-20 characters long and contain only latin letters, numbers, or cyrillic characters.",
    minLength: 2,
    maxLength: 20,
  },
  dir: {
    type: "string",
    minLength: 1,
  },
  spinner: {
    type: "boolean",
  },
  password: {
    type: "string",
    minLength: 4,
  },
  age: {
    type: "number",
    minimum: 18,
    maximum: 99,
  },
  lang: {
    type: "string",
  },
  color: {
    type: "enum",
    enum: validColors,
  },
  birthday: {
    type: "string",
    minLength: 10,
    maxLength: 10,
  },
  langs: {
    type: "array",
    items: {
      type: "string",
    },
  },
  toggle: {
    type: "boolean",
  },
};

// Define a TypeScript interface for user input.
export type UserInput = {
  username: string;
  dir: string;
  spinner: boolean;
  password: string;
  age: number;
  lang: string;
  color: ColorName;
  birthday: string;
  langs: string[];
  toggle: boolean;
};

/* ======== Alternative schema definition when using validator like TypeBox ============ */

// import { Type, type Static } from "@sinclair/typebox";

// You can define pieces of the schema separately and then use them in the main schema.
// const colorSchema = Type.Enum(
//   Object.keys(colorMap).reduce<Record<keyof typeof colorMap, string>>(
//     (acc, key) => {
//       acc[key] = key;
//       return acc;
//     },
//     {},
//   ),
// );

// @reliverse/prompts allows you to define the schema once and reuse it for each prompt.
// This is useful if you want to validate the input of multiple prompts using TypeBox.
// export const schema = Type.Object({
//   username: Type.RegExp(usernameRegexPrecise, {
//     description:
//       "Username must be 2-20 characters long and contain only latin letters, numbers, or cyrillic characters.",
//   }),
//   dir: Type.String({ minLength: 1 }),
//   spinner: Type.Boolean(),
//   password: Type.String({ minLength: 4 }),
//   age: Type.Number({ minimum: 18, maximum: 99 }),
//   lang: Type.String(),
//   color: colorSchema,
//   birthday: Type.String({ minLength: 10, maxLength: 10 }),
//   langs: Type.Array(Type.String()),
//   toggle: Type.Boolean(),
// });

// You can define the type to use in the result object, populated with results from the prompts.
// export type UserInput = Static<typeof schema>;
