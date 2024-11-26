// @ts-nocheck

import test from "tape";
import InputPrompt from "../src/elements/text";

test("move", (t) => {
  t.plan(6);
  const inputPrompt = new InputPrompt();
  inputPrompt.value = "Hello, world!";
  inputPrompt.last();
  inputPrompt.render();
  t.same(inputPrompt.cursorOffset, 0, "cursorOffset is 0 at start");
  t.same(inputPrompt.cursor, inputPrompt.rendered.length, "cursor starts at 0");
  inputPrompt.right();
  t.same(
    inputPrompt.cursorOffset,
    0,
    "cursorOffset is unaffected when moved right from the end",
  );
  t.same(
    inputPrompt.cursor,
    inputPrompt.rendered.length,
    "cursor is unaffected when moved right from the end",
  );
  inputPrompt.left();
  t.equal(inputPrompt.cursorOffset, -1, "cursorOffset is -1 when moved left");
  inputPrompt.right();
  t.equal(inputPrompt.cursorOffset, 0, "cursorOffset is 0 when moved left");
  t.end();
});
test("delete", (t) => {
  t.plan(4);
  const inputPrompt = new InputPrompt();
  inputPrompt.value = "Hello, world!";
  inputPrompt.last();
  inputPrompt.render();
  inputPrompt.delete();
  t.same(inputPrompt.cursorOffset, 0, "cursorOffset is 0 after delete");
  t.same(
    inputPrompt.cursor,
    inputPrompt.rendered.length,
    "cursor stays at end of line",
  );
  inputPrompt.left();
  inputPrompt.deleteForward();
  t.same(inputPrompt.cursorOffset, 0, "cursorOffset is 0 after deleteForward");
  t.same(
    inputPrompt.cursor,
    inputPrompt.rendered.length,
    "cursor stays at end of line",
  );
  inputPrompt.submit();
  t.end();
});
test("submit", (t) => {
  t.plan(2);
  const inputPrompt = new InputPrompt();
  inputPrompt.value = "Hello, world!";
  inputPrompt.submit();
  t.same(inputPrompt.cursorOffset, 0, "cursorOffset is reset on submit");
  t.same(
    inputPrompt.cursor,
    inputPrompt.rendered.length,
    "cursor is reset to end of line on submit",
  );
});
