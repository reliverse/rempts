// This is a modernized version of the:
// https://npmjs.com/package/cli-progress

import defaultFormatBar from "./modules/format-bar.js";
import defaultFormatTime from "./modules/format-time.js";
import defaultFormatValue from "./modules/format-value.js";
import Formatter from "./modules/formatter.js";
import { MultiBar } from "./modules/multi-bar.js";
import SingleBar from "./modules/single-bar.js";
import Presets from "./presets/index.js";

export { SingleBar };
export { MultiBar };
export { Presets };
export const Format = {
  Formatter,
  BarFormat: defaultFormatBar,
  ValueFormat: defaultFormatValue,
  TimeFormat: defaultFormatTime,
};
