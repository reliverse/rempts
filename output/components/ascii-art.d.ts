import { type Fonts } from "figlet";
export declare function promptsAsciiArt({ message, font, clearConsole, }: {
    message: string;
    font?: Fonts;
    clearConsole?: boolean;
}): Promise<void>;
