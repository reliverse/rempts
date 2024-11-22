/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
import { Type, type Static } from "@sinclair/typebox";

import { colorMap } from "~/utils/mapping.js";

// Extract color keys from colorMap to create a ColorEnum type
const colorKeys = Object.keys(colorMap) as [keyof typeof colorMap];

// You can find the schema templates like this
// one at https://docs.reliverse.org/relinka
const colorSchema = Type.Enum(
  Object.keys(colorMap).reduce(
    (acc, key) => {
      acc[key] = key;
      return acc;
    },
    {} as Record<keyof typeof colorMap, string>,
  ),
);

export const schema = Type.Object({
  username: Type.String({
    minLength: 2,
    maxLength: 20,
    pattern: "^[a-zA-Z0-9\u0400-\u04FF]+$",
  }),
  dir: Type.String({ minLength: 1 }),
  deps: Type.Boolean(),
  password: Type.String({ minLength: 4 }),
  age: Type.Number({ minimum: 18, maximum: 99 }),
  lang: Type.String(),
  color: colorSchema,
  birthday: Type.String({ minLength: 10, maxLength: 10 }),
  langs: Type.Array(Type.String()),
  features: Type.Array(Type.String()),
});

// Define the type to use in the result object, populated with results from the prompts.
export type UserInput = Static<typeof schema>;

/* import { Type, type Static } from "@sinclair/typebox";
import { colorMap } from "~/unsorted/utils/mapping.js";

// @reliverse/relinka allows you to define the schema once and reuse it for each prompt.
// This is useful if you want to validate the input of multiple prompts using TypeBox.
export const schema = Type.Object({
  username: Type.String({
    minLength: 2,
    maxLength: 20,
    pattern: "^[a-zA-Z0-9]+$",
  }),
  dir: Type.String({ minLength: 1 }),
  deps: Type.Boolean(),
  password: Type.String({ minLength: 4 }),
  age: Type.Number({ minimum: 18, maximum: 99 }),
  color: Type.Enum({ colorMap red: "red", green: "green", blue: "blue" }),
  birthday: Type.String({ minLength: 10, maxLength: 10 }),
  features: Type.Array(Type.String()),
});

// Define the type to use in the result object, populated with results from the prompts.
export type UserInput = Static<typeof schema>;
 */
