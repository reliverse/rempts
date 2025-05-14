import ora, { type Ora } from "ora";

type SpinnerOptions = {
  text: string;
};

type SpinnerControls = {
  start: () => SpinnerControls;
  stop: () => void;
  setText: (text: string) => void;
};

/**
 * Creates a terminal spinner.
 *
 * @example
 * \`\`\`typescript
 * const spinner = useSpinner({ text: "preparing something..." }).start();
 * // user's code
 * spinner.stop();
 * \`\`\`
 */
export function useSpinner(options: SpinnerOptions): SpinnerControls {
  let spinnerInstance: Ora | null = null;

  const controls: SpinnerControls = {
    start: () => {
      if (!spinnerInstance) {
        spinnerInstance = ora(options.text);
      }
      spinnerInstance.start();
      return controls;
    },
    stop: () => {
      if (spinnerInstance) {
        spinnerInstance.stop();
      }
    },
    setText: (text: string) => {
      if (spinnerInstance) {
        spinnerInstance.text = text;
      } else {
        // Update options text if spinner hasn't been started yet
        options.text = text;
      }
    },
  };

  return controls;
}
