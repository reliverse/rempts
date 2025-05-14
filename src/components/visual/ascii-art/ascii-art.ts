import { relinka } from "@reliverse/relinka";
import figlet, { type Fonts } from "figlet";

export async function createAsciiArt({
  message,
  font = "Standard",
  clearConsole = false,
}: {
  message: string;
  font?: Fonts;
  clearConsole?: boolean;
}): Promise<void> {
  if (clearConsole) {
    relinka("clear", "");
  }

  const asciiArt = figlet.textSync(message, { font });
  relinka("log", asciiArt);
}
