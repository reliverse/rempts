import { figures } from "@/external/terkelg-tmp/src/lib/util";
import { dim } from "picocolors";
/**
 * Separator object
 * Used to space/separate choices group
 */
export class Separator {
    separator = dim(Array.from({ length: 15 }).join(figures.line));
    type = "separator";
    constructor(separator) {
        if (separator) {
            this.separator = separator;
        }
    }
    static isSeparator(choice) {
        return Boolean(choice &&
            typeof choice === "object" &&
            "type" in choice &&
            choice.type === "separator");
    }
}
