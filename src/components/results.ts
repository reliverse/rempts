import { dim } from "picocolors";

export async function promptsDisplayResults({
  results,
}: {
  results: any;
}): Promise<void> {
  console.log(`${dim(results)}\n`);
}
