import type { RelinkaOptions } from "~/components/modules";

import { createRelinka } from "~/components/modules";

import { randomSentence } from "./sentence";

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
