import { msg } from "~/components/msg-fmt/messages.js";

export type ResultsType = {
  username: string;
};

export async function resultPrompt({
  results,
  inline = true,
}: {
  results: ResultsType;
  inline?: boolean;
}): Promise<void> {
  const title = "Your input results:";

  if (inline) {
    const formattedResults = Object.entries(results)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    msg({
      type: "M_INFO",
      title,
      content: formattedResults,
      titleColor: "cyan",
      contentColor: "dim",
      wrapContent: true,
    });
  } else {
    const formattedResults = JSON.stringify(results, null, 2);
    msg({
      type: "M_INFO",
      title,
      content: formattedResults,
      titleColor: "cyan",
      contentColor: "dim",
    });
  }
}

/* ======== Alternative schema definition when using validator like TypeBox ============ */

/* import type { Static } from "@sinclair/typebox";

import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

import { msg } from "~/libs/core/core-impl/msg-fmt/messages.js";

const ResultsSchema = Type.Object({
  username: Type.String(),
});
type ResultsType = Static<typeof ResultsSchema>;

async function resultPrompt({
  results,
  inline = true,
}: {
  results: ResultsType;
  inline?: boolean;
}): Promise<void> {
  if (!Value.Check(ResultsSchema, results)) {
    throw new Error("Invalid results structure.");
  }

  const title = "Your input results:";

  if (inline) {
    const formattedResults = Object.entries(results)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    msg({
      type: "M_INFO",
      title,
      content: formattedResults,
      titleColor: "cyan",
      contentColor: "dim",
      wrapContent: true,
    });
  } else {
    const formattedResults = JSON.stringify(results, null, 2);
    msg({
      type: "M_INFO",
      title,
      content: formattedResults,
      titleColor: "cyan",
      contentColor: "dim",
    });
  }
}
 */
