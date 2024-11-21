// @ts-nocheck

import termkit from "../lib/termkit";

// @ts-nocheck
var term = termkit.terminal;

describe("Find", () => {
  it("how to test a terminal lib with Tea-Time...");
});

describe("String width", () => {
  it(".markupWidth()", () => {
    expect(termkit.markupWidth("^CBook^Ymark^Rs")).to.be(9);
  });

  it(".truncateString()", () => {
    expect(termkit.truncateString("$za", 2)).to.be("$z");
    expect(termkit.truncateString("$za", 3)).to.be("$za");
    expect(termkit.truncateString("$za", 4)).to.be("$za");
    expect(termkit.truncateString("aé＠à", 2)).to.be("aé");
    expect(termkit.truncateString("aé＠à", 3)).to.be("aé");
    expect(termkit.truncateString("aé＠à", 4)).to.be("aé＠");
    expect(termkit.truncateString("aé＠à", 5)).to.be("aé＠à");
    expect(termkit.truncateString("aé＠à", 6)).to.be("aé＠à");
    expect(termkit.truncateString("aé汉字à", 2)).to.be("aé");
    expect(termkit.truncateString("aé汉字à", 3)).to.be("aé");
    expect(termkit.truncateString("aé汉字à", 4)).to.be("aé汉");
    expect(termkit.truncateString("aé汉字à", 5)).to.be("aé汉");
    expect(termkit.truncateString("aé汉字à", 6)).to.be("aé汉字");
    expect(termkit.truncateString("aé汉字à", 7)).to.be("aé汉字à");
    expect(termkit.truncateString("aé汉字à", 8)).to.be("aé汉字à");

    expect(termkit.truncateString("aé汉\x1b[1m\x1b[1m字à", 3)).to.be("aé");
    expect(termkit.truncateString("aé汉\x1b[1m\x1b[1m字à", 4)).to.be("aé汉");
    expect(termkit.truncateString("aé汉\x1b[1m\x1b[1m字à", 5)).to.be(
      "aé汉\x1b[1m\x1b[1m",
    );
    expect(termkit.truncateString("aé汉\x1b[1m\x1b[1m字à", 6)).to.be(
      "aé汉\x1b[1m\x1b[1m字",
    );
  });
});

describe("Misc", () => {
  it("Auto-instance", () => {
    expect(term).to.be.an(termkit.Terminal);
  });
});
