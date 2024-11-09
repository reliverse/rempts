import type { State } from "~/types";

import { useState, useEffect } from "~/hooks";
import { styledBars } from "~/utils/states";

export function useBar(state: State) {
  const [bars, setBars] = useState<{ start: string; middle: string }>(
    styledBars("start", state),
  );

  useEffect(() => {
    setBars(styledBars("start", state));
  }, [state]);

  return bars;
}
