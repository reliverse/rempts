import { test, expectTypeOf } from "bun:test";

import type { EnquirerLike, InquirerPromptsLike, Promptable } from "../src";

test("prompt types", async () => {
  expectTypeOf<
    typeof import("@inquirer/prompts")
  >().toExtend<InquirerPromptsLike>();
  expectTypeOf<typeof import("enquirer")>().toExtend<EnquirerLike>();

  expectTypeOf<typeof import("@inquirer/prompts")>().toExtend<Promptable>();
  expectTypeOf<typeof import("enquirer")>().toExtend<Promptable>();
});
