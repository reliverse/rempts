import { symbol } from "examples/reliverse/experiments/utils/symbols";

import type { State } from "~/types";

import { useEffect } from "./use-effect";
import { useState } from "./use-state";

export function useBar(state: State) {
  const [bars, setBars] = useState<string>(symbol("S_BAR_H", state));

  useEffect(() => {
    setBars(symbol("S_BAR_H", state));
  }, [state]);

  return bars;
}
