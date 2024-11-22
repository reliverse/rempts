import { promisify } from "util";

import * as cliProgress from "../cli-progress.js";

const sleep = promisify(setTimeout);

const bar1 = new cliProgress.Bar({}, cliProgress.Presets.shades_classic);

async function updateBar(): Promise<void> {
  bar1.update(1);
  await sleep(3600);
}

bar1.start(99999999999999999999999999999999999999999999999999999999n, 0);

(async function resolver() {
  while (true) {
    await updateBar();
  }
})();
