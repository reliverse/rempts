import figlet, { type Fonts } from "figlet";

import type { ColorName } from "~/types/prod";

export async function promptsAsciiArt({
  message,
  font = "Standard",
  clearConsole = false,
}: {
  message: string;
  font?: Fonts;
  clearConsole?: boolean;
}): Promise<void> {
  if (clearConsole) {
    console.clear();
  }

  const asciiArt = figlet.textSync(message, { font });
  console.log(asciiArt);
}
