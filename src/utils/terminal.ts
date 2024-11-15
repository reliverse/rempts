import ansiEscapes from "ansi-escapes";
import { cursor } from "sisteransi";

export function removeCursor() {
  process.stdout.write(cursor.hide);
}

export function restoreCursor() {
  process.stdout.write(cursor.show);
}

export function deleteLastLine() {
  process.stdout.write(ansiEscapes.cursorUp(1) + ansiEscapes.eraseLine);
}

export function deleteLastLines(count: number) {
  process.stdout.write(ansiEscapes.eraseLines(count));
}
