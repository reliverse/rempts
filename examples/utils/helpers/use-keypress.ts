import type { ReadReli } from "./type";

import { withUpdates } from "./hook-engine";
import { type KeypressEvent } from "./key";
import { useEffect } from "./use-effect";
import { useRef } from "./use-ref";

export function useKeypress(
  userHandler: (event: KeypressEvent, rl: ReadReli) => void | Promise<void>,
) {
  const signal = useRef(userHandler);
  signal.current = userHandler;

  useEffect((rl) => {
    let ignore = false;
    const handler = withUpdates((_input: string, event: KeypressEvent) => {
      if (ignore) {
        return;
      }
      void signal.current(event, rl);
    });

    rl.input.on("keypress", handler);
    return () => {
      ignore = true;
      rl.input.removeListener("keypress", handler);
    };
  }, []);
}
