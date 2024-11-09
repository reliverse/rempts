import { useState, useEffect } from "experimental/hooks";

import type { State } from "~/types";

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
