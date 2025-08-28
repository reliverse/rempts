// bun example/individual/multiselect.ts

import { multiselectPrompt } from "~/mod";

async function main() {
  await multiselectPrompt({
    title: "Multiselect Prompt",
    titleColor: "cyan",
    titleTypography: "bold",
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
    ],
  });
}

main();
