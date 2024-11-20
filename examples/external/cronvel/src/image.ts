import ndarray from "ndarray";
import Promise from "seventh";

// @ts-nocheck
const image = {};
var getPixels;
if (global.IS_BROWSER) {
  getPixels = require("@cronvel/get-pixels");
}

image.load = function load(fn, filepath, options, callback) {
  if (!getPixels) {
    // It loads some rarely useful files, do it only at last minute
    try {
      // Try the original get-pixels first, if available
      getPixels = require("get-pixels");
    } catch (error) {
      getPixels = require("@cronvel/get-pixels");
    }
  }

  if (typeof options === "function") {
    callback = options;
    options = {};
  } else if (!options || typeof options !== "object") {
    options = {};
  }

  var promise = new Promise();

  getPixels(filepath, (error_, pixels) => {
    if (error_) {
      var error = new Error("Bad image URL: " + error_);
      error.code = error_.code;
      error.parent = error_;

      if (callback) {
        callback(error);
      } else {
        promise.reject(error);
      }

      return;
    }

    if (pixels.shape.length === 4) {
      // Probably a GIF or a format having animation,
      // we just extract the first image: a 3D array
      pixels = pixels.pick(0, null, null, null);
    }

    if (options.shrink) {
      pixels = image.shrinkNdarrayImage(pixels, options.shrink);
    }

    var result = fn(pixels, options);

    if (callback) {
      callback(undefined, result);
    } else {
      promise.resolve(result);
    }
  });

  return promise;
};

// Naive interpolation
image.shrinkNdarrayImage = function shrinkNdarrayImage(pixels, options) {
  var rate = Math.min(
    options.width / pixels.shape[0],
    options.height / pixels.shape[1],
  );
  if (rate >= 1) {
    return pixels;
  }

  var dstWidth = Math.ceil(pixels.shape[0] * rate);
  var dstHeight = Math.ceil(pixels.shape[1] * rate);

  var xDst,
    yDst,
    xSrc,
    xSrcMin,
    xSrcMax,
    ySrc,
    ySrcMin,
    ySrcMax,
    r,
    g,
    b,
    a,
    count,
    hasAlpha = pixels.shape[2] === 4;

  var shrinkedPixels = ndarray(
    new Uint8Array(dstWidth * dstHeight * pixels.shape[2]),
    [dstWidth, dstHeight, pixels.shape[2]],
  );

  for (xDst = 0; xDst < dstWidth; xDst++) {
    for (yDst = 0; yDst < dstHeight; yDst++) {
      xSrcMin = Math.ceil(xDst / rate);
      xSrcMax = Math.min(Math.ceil((xDst + 1) / rate - 1), pixels.shape[0] - 1);
      ySrcMin = Math.ceil(yDst / rate);
      ySrcMax = Math.min(Math.ceil((yDst + 1) / rate - 1), pixels.shape[1] - 1);
      count = r = g = b = a = 0;

      for (xSrc = xSrcMin; xSrc <= xSrcMax; xSrc++) {
        for (ySrc = ySrcMin; ySrc <= ySrcMax; ySrc++) {
          r += pixels.get(xSrc, ySrc, 0);
          g += pixels.get(xSrc, ySrc, 1);
          b += pixels.get(xSrc, ySrc, 2);
          if (hasAlpha) {
            a += pixels.get(xSrc, ySrc, 3);
          }
          count++;
        }
      }

      shrinkedPixels.set(xDst, yDst, 0, Math.round(r / count));
      shrinkedPixels.set(xDst, yDst, 1, Math.round(g / count));
      shrinkedPixels.set(xDst, yDst, 2, Math.round(b / count));
      if (hasAlpha) {
        shrinkedPixels.set(xDst, yDst, 3, Math.round(a / count));
      }
    }
  }

  return shrinkedPixels;
};

export default image;
