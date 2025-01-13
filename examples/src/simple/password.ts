import * as url from "node:url";

import { inputPrompt } from "~/main.js";

const demo = async () => {
  console.log(
    "Answer:",
    await inputPrompt({
      title: "Enter a silent password?",
    }),
  );

  console.log(
    "Answer:",
    await inputPrompt({
      title: "Enter a masked password?",
      mode: "password",
    }),
  );
};

if (import.meta.url.startsWith("file:")) {
  const modulePath = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === modulePath) {
    await demo();
  }
}

export default demo;
