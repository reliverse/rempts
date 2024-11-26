import type { RelinkaOptions } from "~/types/general.js";

import { createRelinka } from "@reliverse/relinka";

import { randomSentence } from "./sentence.js";

export function reporterDemo(
  opts: Partial<RelinkaOptions & { fancy: boolean }>,
) {
  const relinka = createRelinka({
    ...opts,
  });

  for (const type of Object.keys(relinka.options.types).sort()) {
    relinka[type](randomSentence());
  }

  relinka.info("JSON", {
    name: "Cat",
    color: "#454545",
  });

  relinka.error(new Error(randomSentence()));

  const tagged = relinka.withTag("reliverse").withTag("relinka");

  for (const type of Object.keys(relinka.options.types).sort()) {
    tagged[type](randomSentence());
  }
}

export const relinka = createRelinka();
