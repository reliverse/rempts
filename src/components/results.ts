import type { Static } from "@sinclair/typebox";

import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { dim } from "picocolors";

const ResultsSchema = Type.Object({
  username: Type.String(),
});
type ResultsType = Static<typeof ResultsSchema>;

export async function promptsDisplayResults({
  results,
  inline = true,
}: {
  results: ResultsType;
  inline?: boolean;
}): Promise<void> {
  if (!Value.Check(ResultsSchema, results)) {
    throw new Error("Invalid results structure.");
  }

  if (inline) {
    const formattedResults = Object.entries(results)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    console.log(dim(formattedResults));
  } else {
    console.log(`${dim(JSON.stringify(results, null, 2))}\n`);
  }
}
