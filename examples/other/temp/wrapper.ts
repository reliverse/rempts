// bun examples/separate/fallback/enquirer.ts

import { EnquirerWrapper } from "~/fallback/enquirer.temp.js";

const longText =
  "Let's embark on a creative journey and build something completely new! Afterward, it's all yours to refine. What category best describes your project? What web technologies do you like? 42 is the answer to everything. What do you mind about testing the very very very long text? Is something broken for you?";

async function main() {
  const enq = new EnquirerWrapper();

  // Example: Ask for a username (Input)
  const { username } = await enq.askInput({
    name: "username",
    message: "What is your username?",
    initial: "john_doe",
  });
  console.log("Username:", username);

  // Example: Ask a confirm question
  const { proceed } = await enq.askConfirm({
    name: "proceed",
    message: "Do you want to continue?",
    initial: true,
  });
  console.log("Proceed:", proceed);

  // Example: Ask a single-choice selection
  const { color } = await enq.askSelect({
    name: "color",
    message: "Pick a color" + longText,
    choices: ["red", "blue", "green"],
    initial: 1,
  });
  console.log("Selected color:", color);

  // Example: Ask a multi-choice selection
  const { fruits } = await enq.askMultiSelect({
    name: "fruits",
    message: "Pick some fruits" + longText,
    choices: ["apple", "banana", "orange", "mango"],
    initial: [0, 2],
  });
  console.log("Selected fruits:", fruits);
}

main().catch(console.error);
