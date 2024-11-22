import { defaultFormatBar } from "./modules/format-bar.js";
import { defaultFormatTime } from "./modules/format-time.js";
import { defaultFormatValue } from "./modules/format-value.js";
import { Formatter } from "./modules/formatter.js";
import { MultiBar } from "./modules/multi-bar.js";
import { SingleBar } from "./modules/single-bar.js";
import { Presets } from "./presets/index.js";

// sub-module access
module.exports = {
  Bar: SingleBar,
  SingleBar: SingleBar,
  MultiBar: MultiBar,
  Presets: Presets,
  Format: {
    Formatter: Formatter,
    BarFormat: defaultFormatBar,
    ValueFormat: defaultFormatValue,
    TimeFormat: defaultFormatTime,
  },
};
