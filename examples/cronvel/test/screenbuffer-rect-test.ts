// @ts-nocheck

var termkit = require("../lib/termkit");
var term = termkit.terminal;
var ScreenBuffer = termkit.ScreenBuffer;
var Rect = termkit.Rect;

describe("ScreenBuffer.Rect", function () {
  it("Rect.create( Terminal )", function () {
    expect(Rect.create(term)).to.be.like({
      xmin: 1,
      ymin: 1,
      xmax: term.width,
      ymax: term.height,
      width: term.width,
      height: term.height,
      isNull: false,
    });
  });

  it("Rect.create( xmin , ymin , xmax , ymax )", function () {
    expect(Rect.create(1, 2, 3, 4)).to.be.like({
      xmin: 1,
      ymin: 2,
      xmax: 3,
      ymax: 4,
      width: 3,
      height: 3,
      isNull: false,
    });
  });

  it(".clip() should adjust accordingly", function () {
    var srcRect, dstRect;

    dstRect = Rect.create({
      xmin: 0,
      ymin: 20,
      xmax: 25,
      ymax: 45,
      isNull: false,
    });
    srcRect = Rect.create({
      xmin: 10,
      ymin: 10,
      xmax: 30,
      ymax: 40,
      isNull: false,
    });
    srcRect.clip(dstRect, 0, 0, true);

    expect(dstRect).to.be.like({
      xmin: 10,
      ymin: 20,
      xmax: 25,
      ymax: 40,
      width: 16,
      height: 21,
      isNull: false,
    });
    expect(srcRect).to.be.like({
      xmin: 10,
      ymin: 20,
      xmax: 25,
      ymax: 40,
      width: 16,
      height: 21,
      isNull: false,
    });

    dstRect = Rect.create({ xmin: 0, ymin: 20, xmax: 25, ymax: 45 });
    srcRect = Rect.create({ xmin: 10, ymin: 10, xmax: 30, ymax: 40 });
    srcRect.clip(dstRect, 5, 0, true);

    expect(dstRect).to.be.like({
      xmin: 15,
      ymin: 20,
      xmax: 25,
      ymax: 40,
      width: 11,
      height: 21,
      isNull: false,
    });
    expect(srcRect).to.be.like({
      xmin: 10,
      ymin: 20,
      xmax: 20,
      ymax: 40,
      width: 11,
      height: 21,
      isNull: false,
    });

    dstRect = Rect.create({ xmin: 0, ymin: 20, xmax: 25, ymax: 45 });
    srcRect = Rect.create({ xmin: 10, ymin: 10, xmax: 30, ymax: 40 });
    srcRect.clip(dstRect, -8, 0, true);

    expect(dstRect).to.be.like({
      xmin: 2,
      ymin: 20,
      xmax: 22,
      ymax: 40,
      width: 21,
      height: 21,
      isNull: false,
    });
    expect(srcRect).to.be.like({
      xmin: 10,
      ymin: 20,
      xmax: 30,
      ymax: 40,
      width: 21,
      height: 21,
      isNull: false,
    });

    dstRect = Rect.create({ xmin: 0, ymin: 20, xmax: 25, ymax: 45 });
    srcRect = Rect.create({ xmin: 10, ymin: 10, xmax: 30, ymax: 40 });
    srcRect.clip(dstRect, -31, 0, true);

    expect(dstRect.isNull).to.be(true);
    expect(srcRect.isNull).to.be(true);

    dstRect = Rect.create({ xmin: 0, ymin: 20, xmax: 25, ymax: 45 });
    srcRect = Rect.create({ xmin: 10, ymin: 10, xmax: 30, ymax: 40 });
    srcRect.clip(dstRect, -8, 5, true);

    expect(dstRect).to.be.like({
      xmin: 2,
      ymin: 20,
      xmax: 22,
      ymax: 45,
      width: 21,
      height: 26,
      isNull: false,
    });
    expect(srcRect).to.be.like({
      xmin: 10,
      ymin: 15,
      xmax: 30,
      ymax: 40,
      width: 21,
      height: 26,
      isNull: false,
    });

    dstRect = Rect.create({ xmin: 0, ymin: 20, xmax: 25, ymax: 45 });
    srcRect = Rect.create({ xmin: 10, ymin: 10, xmax: 30, ymax: 40 });
    srcRect.clip(dstRect, 0, -21, true);

    expect(dstRect.isNull).to.be(true);
    expect(srcRect.isNull).to.be(true);
  });
});
