// @ts-nocheck

import Promise from "seventh";
import termkit from "..";

// @ts-nocheck
const term = termkit.terminal;

async function run() {
  var str;

  try {
    str = await term.getClipboard();
    term("Clipboard is: '%s'\n", str);

    await Promise.resolveTimeout(100);
    await term.setClipboard("Bob!!!");

    await Promise.resolveTimeout(100);
    str = await term.getClipboard();
    term("Clipboard is: '%s'\n", str);
  } catch (error) {
    term.red("Error: %E\n", error);
  }
}

run();
