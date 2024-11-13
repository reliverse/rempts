import process from 'node:process';
import ansiEscapes from 'ansi-escapes';

export function deleteLastLine() {
    process.stdout.write(ansiEscapes.cursorUp(1) + ansiEscapes.eraseLine);
}

export function deleteLastLines(count) {
    process.stdout.write(ansiEscapes.eraseLines(count));
}
