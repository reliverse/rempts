#!/usr/bin/env node

const term = require("..").terminal;
const Promise = require("seventh");

async function test() {
  term(
    "About to send a notification in 2 seconds...\nIn Gnome/gnome-terminal, you should switch to another window/workspace to see a system notification\n",
  );
  await Promise.resolveTimeout(2000);
  term.notify("This is a notification title", "This is the notification text");
  await Promise.resolveTimeout(2000);
}

test();
