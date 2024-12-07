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
    console.clear();
  }

  const asciiArt = figlet.textSync(message, { font });
  console.log(asciiArt);
}
