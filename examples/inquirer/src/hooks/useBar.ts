import type { State } from "~/types";

import { styledBars } from "~/utils/states";

import { useEffect } from "./use-effect";
import { useState } from "./use-state";

export function useBar(state: State) {
  const [bars, setBars] = useState<{ start: string; middle: string }>(
    styledBars("start", state),
  );

  useEffect(() => {
    setBars(styledBars("start", state));
  }, [state]);

  return bars;
}
