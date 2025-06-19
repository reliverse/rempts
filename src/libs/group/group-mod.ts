import { msg } from "~/libs/msg-fmt/messages.js";

export interface GroupOptions {
  onCancel?: () => void;
  showProgress?: boolean;
  title?: string;
}

export interface GroupContext<T> {
  results: Partial<T>;
  step: keyof T;
  stepIndex: number;
  totalSteps: number;
}

export type GroupStep<T, K extends keyof T> = (
  context: GroupContext<T>,
) => Promise<T[K]> | T[K];

export type GroupSteps<T> = {
  [K in keyof T]: GroupStep<T, K>;
};

/**
 * Runs a series of prompts in sequence, where each prompt can depend on the results of previous prompts.
 *
 * @param steps Object where each key is a step name and each value is a function that returns a promise
 * @param options Optional configuration including onCancel callback and progress display
 * @returns Promise resolving to the complete results object
 */
export async function group<T extends Record<string, any>>(
  steps: GroupSteps<T>,
  options: GroupOptions = {},
): Promise<T> {
  const { showProgress = true, title = "Configuration" } = options;
  const stepKeys = Object.keys(steps) as (keyof T)[];
  const results: Partial<T> = {};
  const totalSteps = stepKeys.length;

  if (showProgress && title) {
    msg({
      type: "M_START",
      title,
      titleColor: "cyan",
      titleTypography: "bold",
    });
  }

  for (let stepIndex = 0; stepIndex < stepKeys.length; stepIndex++) {
    const stepKey = stepKeys[stepIndex]!;
    const stepFunction = steps[stepKey];

    if (showProgress) {
      msg({
        type: "M_MIDDLE",
        title: `Step ${stepIndex + 1}/${totalSteps}: ${String(stepKey)}`,
        titleColor: "dim",
      });
    }

    const context: GroupContext<T> = {
      results,
      step: stepKey,
      stepIndex,
      totalSteps,
    };

    try {
      const result = await stepFunction(context);
      results[stepKey] = result;

      if (showProgress) {
        msg({
          type: "M_MIDDLE",
          title: `✓ ${String(stepKey)} completed`,
          titleColor: "green",
        });
      }
    } catch (error) {
      if (error instanceof Error && error.message === "CANCEL") {
        if (options.onCancel) {
          options.onCancel();
        }
        throw error;
      }

      if (showProgress) {
        msg({
          type: "M_ERROR",
          title: `✗ ${String(stepKey)} failed: ${error instanceof Error ? error.message : String(error)}`,
          titleColor: "red",
        });
      }
      throw error;
    }
  }

  if (showProgress) {
    msg({
      type: "M_END",
      title: `${title} completed successfully!`,
      titleColor: "green",
      titleTypography: "bold",
    });
  }

  return results as T;
}

/**
 * Utility function to create a step that depends on specific previous results
 */
export function createStep<T, K extends keyof T, D extends keyof T>(
  stepFunction: (
    context: GroupContext<T>,
    dependency: T[D],
  ) => Promise<T[K]> | T[K],
  dependencyKey: D,
): GroupStep<T, K> {
  return (context: GroupContext<T>) => {
    const dependency = context.results[dependencyKey];
    if (dependency === undefined) {
      throw new Error(
        `Dependency '${String(dependencyKey)}' is required but not available`,
      );
    }
    return stepFunction(context, dependency);
  };
}

/**
 * Utility function to create a step that depends on multiple previous results
 */
export function createMultiStep<T, K extends keyof T, D extends (keyof T)[]>(
  stepFunction: (
    context: GroupContext<T>,
    dependencies: { [P in D[number]]: T[P] },
  ) => Promise<T[K]> | T[K],
  dependencyKeys: D,
): GroupStep<T, K> {
  return (context: GroupContext<T>) => {
    const dependencies: Partial<{ [P in D[number]]: T[P] }> = {};

    for (const key of dependencyKeys) {
      const dependency = context.results[key];
      if (dependency === undefined) {
        throw new Error(
          `Dependency '${String(key)}' is required but not available`,
        );
      }
      dependencies[key] = dependency;
    }

    return stepFunction(context, dependencies as { [P in D[number]]: T[P] });
  };
}
