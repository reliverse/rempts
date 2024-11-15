// @ts-nocheck

var termkit = require("..");
var term = termkit.terminal;
var TextBuffer = termkit.TextBuffer;

describe("TextBuffer", () => {
  it("TextBuffer should preserve newline", () => {
    var textBuffer = new TextBuffer();
    expect(textBuffer.getText(textBuffer.setText("one\ntwo\nthree"))).to.be(
      "one\ntwo\nthree",
    );
  });
});
