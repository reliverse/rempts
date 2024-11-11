import type { State } from "~/types";

import { symbol } from "~/utils/symbols";

import { useEffect } from "./use-effect";
import { useState } from "./use-state";

export function useBar(state: State) {
  const [bars, setBars] = useState<string>(symbol("S_BAR_H", state));

  useEffect(() => {
    setBars(symbol("S_BAR_H", state));
  }, [state]);

  return bars;
}
