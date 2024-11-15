import { Type, type Static } from "@sinclair/typebox";

// @reliverse/prompts allows you to define the schema once and reuse it for each prompt.
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
  color: Type.Enum({ red: "red", green: "green", blue: "blue" }),
  birthday: Type.String({ minLength: 10, maxLength: 10 }),
  features: Type.Array(Type.String()),
});

// Define the type to use in the result object, populated with results from the prompts.
export type UserInput = Static<typeof schema>;
