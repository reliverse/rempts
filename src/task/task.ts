import type { Options } from "p-map";

import process from "node:process";
import ora from "ora";
import pMap from "p-map";
import pc from "picocolors";
import { cursor, erase } from "sisteransi";
import { proxy, subscribe } from "valtio";

import type { ProgressBar } from "~/task/types.js";

import { msg } from "~/utils/messages.js";

import { progressTaskPrompt } from "./progress.js";

type SimpleSpinnerType = "default" | "dottedCircle" | "boxSpinner";

type State =
  | "pending"
  | "loading"
  | "error"
  | "warning"
  | "success"
  | "cancelled";
type Priority = "low" | "normal" | "high" | "critical";

export type TaskProgress = {
  current: number;
  total: number;
  message?: string;
};

export type TaskObject = {
  id: string;
  title: string;
  state: State;
  children: TaskObject[];
  status?: string;
  output?: string;
  error?: Error;
  priority: Priority;
  progress?: TaskProgress;
  progressBar?: ProgressBar;
  startTime?: number;
  endTime?: number;
  duration?: number;
  cancelToken?: AbortController;
};

export type TaskList = TaskObject[] & {
  isRoot?: boolean;
};

export type TaskInnerAPI = {
  task: Task;
  setTitle(title: string): void;
  setStatus(status?: string): void;
  setWarning(warning?: Error | string): void;
  setError(error?: Error | string): void;
  setOutput(output: string | { message: string }): void;
  setProgress(progress: TaskProgress): void;
  updateProgress(current: number, total?: number, message?: string): void;
  cancel(): void;
  isCancelled(): boolean;
};

export type TaskFunction<T> = (innerApi: TaskInnerAPI) => Promise<T>;

export const runSymbol: unique symbol = Symbol("run");

export type RegisteredTask<T = any> = {
  [runSymbol]: () => Promise<T>;
  task: TaskObject;
  clear: () => void;
  cancel: () => void;
};

export type TaskAPI<Result = any> = {
  result: Result;
  state: State;
  clear: () => void;
  cancel: () => void;
  progress?: TaskProgress;
  duration?: number;
};

export type Task = (<TaskReturnType>(
  title: string,
  options: { priority: Priority } & Partial<TaskOptions>,
  taskFunction: TaskFunction<TaskReturnType>,
) => Promise<TaskAPI<TaskReturnType>>) & { group: TaskGroup };

export type TaskGroupAPI<Results extends TaskAPI[]> = Results & {
  clear(): void;
  cancel(): void;
};

export type CreateTask = <T>(
  title: string,
  options: { priority: Priority } & Partial<TaskOptions>,
  taskFunction: TaskFunction<T>,
) => RegisteredTask<T>;

type TaskGroup = <T extends readonly RegisteredTask[]>(
  options: Options & { priority?: Priority },
  createTasks: (taskCreator: CreateTask) => [...T],
) => Promise<
  TaskGroupAPI<
    {
      [K in keyof T]: T[K] extends RegisteredTask<infer R> ? TaskAPI<R> : never;
    }[number][]
  >
>;

type SpinnerType =
  // Simple spinners
  | "default"
  | "dottedCircle"
  | "boxSpinner"
  // Ora spinners
  | "dots"
  | "bouncingBar"
  | "arc";

type TaskDisplayType = "spinner" | "progress";

export type TaskOptions = {
  displayType?: TaskDisplayType;
  verificationSteps?: number;
  stepDelay?: number;
  initialDelay?: number;
  exitProcessOnError?: boolean;
  spinnerType?: SpinnerType;
};

type SpinnerTaskOptions = {
  initialMessage: string;
  errorMessage?: string;
  delay?: number;
  spinnerType?: SpinnerType;
  action: (updateMessage: (message: string) => void) => Promise<void>;
};

// Utility functions
function generateTaskId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function arrayAdd<T>(array: T[], element: T) {
  const index = array.push(element) - 1;
  return array[index];
}

function arrayRemove<T>(array: T[], element: T) {
  const index = array.indexOf(element);
  if (index > -1) {
    array.splice(index, 1);
  }
}

function registerTask<T>(
  taskList: TaskList,
  taskTitle: string,
  taskFunction: TaskFunction<T>,
  priority: Priority = "normal",
  options: TaskOptions = {},
): RegisteredTask<T> {
  const {
    displayType = "spinner",
    verificationSteps = 0,
    stepDelay = 400,
    initialDelay = 0,
    exitProcessOnError = true,
    spinnerType = "default",
  } = options;

  const cancelToken = new AbortController();
  const task = arrayAdd(taskList, {
    id: generateTaskId(),
    title: taskTitle,
    state: "pending",
    children: [],
    priority,
    cancelToken: undefined,
  });

  task.cancelToken = cancelToken;

  // Subscribe to state changes for timing information
  subscribe(task, () => {
    if (task.state === "loading" && !task.startTime) {
      task.startTime = Date.now();
    } else if (
      ["success", "error", "cancelled"].includes(task.state) &&
      task.startTime &&
      !task.endTime
    ) {
      task.endTime = Date.now();
      task.duration = task.endTime - task.startTime;
    }
  });

  // Set up spinner
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIndex = 0;
  let interval: NodeJS.Timer | null = null;

  // Function to render the current state
  const render = async () => {
    process.stdout.write(cursor.move(-999, 0) + erase.line);

    if (displayType === "spinner") {
      if (
        spinnerType === "dots" ||
        spinnerType === "bouncingBar" ||
        spinnerType === "arc"
      ) {
        // Use ora for these spinner types
        const oraSpinner = ora({
          text: task.title + (task.status ? ` - ${task.status}` : ""),
          spinner: spinnerType,
        });
        oraSpinner.start();
      } else {
        // Use simple spinners for the rest
        const simpleSpinners = {
          default: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
          dottedCircle: ["○", "", "◑", "◕", "●"],
          boxSpinner: ["▖", "▘", "▝", "▗"],
        };
        const frames = spinnerType
          ? simpleSpinners[spinnerType]
          : simpleSpinners.default;
        const currentFrame = pc.magenta(frames[frameIndex]);
        process.stdout.write(`${currentFrame} ${pc.cyan(task.title)}`);
        if (task.status) {
          process.stdout.write(` - ${task.status}`);
        }
      }
    } else {
      // Render progress bar using progressTaskPrompt
      if (task.progress) {
        const { current, total, message } = task.progress;
        if (!task.progressBar) {
          task.progressBar = await progressTaskPrompt({
            total,
            width: 20,
            completeChar: "█",
            incompleteChar: "░",
            format: `:bar :percent% ${message || ""}`,
            colorize: true,
          });
        }
        await task.progressBar.update(current);
      }
    }
  };

  const clearLine = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    const statusIcon =
      task.state === "success"
        ? "✅"
        : task.state === "error" || task.state === "cancelled"
          ? "❌"
          : "";

    // Clear current line
    process.stdout.write(cursor.move(-999, 0) + erase.line);

    // Only write final status if we have a state change
    if (task.state !== "loading") {
      // Write status with proper styling
      if (task.state === "success") {
        process.stdout.write(
          `${statusIcon} ${pc.cyan(task.title)}${task.status ? ` - ${pc.greenBright(task.status)}` : ""}\n`,
        );
      } else if (task.state === "error" || task.state === "cancelled") {
        process.stdout.write(
          `${statusIcon} ${pc.cyan(task.title)}${task.status ? ` - ${pc.red(task.status)}` : ""}\n`,
        );
        if (task.error?.message) {
          process.stdout.write(`   ${pc.red(task.error.message)}\n`);
        }
      } else {
        process.stdout.write(
          `${statusIcon} ${pc.cyan(task.title)}${task.status ? ` - ${task.status}` : ""}\n`,
        );
      }
    }
  };

  // Start spinner when task starts
  subscribe(task, () => {
    if (task.state === "loading" && !interval) {
      interval = setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        void render();
      }, 80);
    } else if (task.state !== "loading") {
      clearLine();
    }
  });

  return {
    task,
    async [runSymbol]() {
      const api = createTaskInnerApi(task);
      task.state = "loading";

      try {
        if (cancelToken.signal.aborted) {
          throw new Error("Task was cancelled before starting");
        }

        // Add automated verification steps
        api.setStatus("Checking...");
        await new Promise((resolve) => setTimeout(resolve, initialDelay));

        for (let i = 0; i < verificationSteps; i++) {
          api.setStatus(`Verifying... (${i + 1}/${verificationSteps})`);
          await new Promise((resolve) => setTimeout(resolve, stepDelay));
        }

        const taskResult = await taskFunction(api);

        if (cancelToken.signal.aborted) {
          throw new Error("Task was cancelled during execution");
        }

        // If taskResult is a string, use it as the final status
        if (typeof taskResult === "string") {
          api.setStatus(taskResult);
        }

        if (task.state === "loading") {
          task.state = "success";
        }
        return taskResult;
      } catch (error) {
        if (cancelToken.signal.aborted) {
          task.state = "cancelled";
        } else if (error instanceof Error) {
          api.setError(error);
        } else {
          api.setError(new Error(String(error)));
        }
        if (exitProcessOnError) {
          process.exit(1);
        }
        throw error;
      }
    },
    clear() {
      clearLine();
      arrayRemove(taskList, task);
    },
    cancel() {
      clearLine();
      cancelToken.abort();
      task.state = "cancelled";
    },
  };
}

// Create and export the root task list and default task function
const rootTaskList = proxy<TaskList>([]);

// Add a task state manager
const taskStateManager = new Map<string, boolean>();

function advancedTaskPrompt(taskList: TaskList): Task {
  const task = (async (
    title: string,
    options: { priority: Priority } & Partial<TaskOptions>,
    taskFunction: TaskFunction<any>,
  ) => {
    const { priority, ...taskOptions } = options;
    const registeredTask = registerTask(
      taskList,
      title,
      taskFunction,
      priority,
      taskOptions,
    );

    try {
      taskStateManager.set(registeredTask.task.id, true);
      const result = await registeredTask[runSymbol]();
      taskStateManager.delete(registeredTask.task.id);

      return {
        result,
        get state() {
          return registeredTask.task.state;
        },
        get progress() {
          return registeredTask.task.progress;
        },
        get duration() {
          return registeredTask.task.duration;
        },
        clear: registeredTask.clear,
        cancel: registeredTask.cancel,
      };
    } catch (error) {
      taskStateManager.delete(registeredTask.task.id);
      if (registeredTask.task.cancelToken?.signal.aborted) {
        return {
          result: undefined,
          state: "cancelled" as const,
          clear: registeredTask.clear,
          cancel: registeredTask.cancel,
        };
      }
      throw error;
    }
  }) as Task;

  task.group = async <T extends readonly RegisteredTask[]>(
    options: Options & { priority?: Priority },
    createTasks: (taskCreator: CreateTask) => [...T],
  ): Promise<
    TaskGroupAPI<
      {
        [K in keyof T]: T[K] extends RegisteredTask<infer R>
          ? TaskAPI<R>
          : never;
      }[number][]
    >
  > => {
    const {
      priority = "normal",
      concurrency = 1,
      stopOnError = true,
      signal,
    } = options;
    const tasksQueue = createTasks((title, options, taskFunction) => {
      const { priority: taskPriority = priority, ...taskOptions } = options;
      return registerTask(
        taskList,
        title,
        taskFunction,
        taskPriority,
        taskOptions,
      );
    });

    // Sort tasks by priority
    const sortedTasks = [...tasksQueue].sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, normal: 1, low: 0 };
      return priorityOrder[b.task.priority] - priorityOrder[a.task.priority];
    });

    // Execute tasks concurrently using p-map
    const results = (await pMap<RegisteredTask, TaskAPI>(
      sortedTasks,
      async (taskApi) => {
        try {
          taskStateManager.set(taskApi.task.id, true);
          const result = await taskApi[runSymbol]();
          taskStateManager.delete(taskApi.task.id);

          return {
            result,
            get state() {
              return taskApi.task.state;
            },
            get progress() {
              return taskApi.task.progress;
            },
            get duration() {
              return taskApi.task.duration;
            },
            clear: taskApi.clear,
            cancel: taskApi.cancel,
          };
        } catch (error) {
          taskStateManager.delete(taskApi.task.id);
          if (taskApi.task.cancelToken?.signal.aborted) {
            return {
              result: undefined,
              state: "cancelled" as const,
              clear: taskApi.clear,
              cancel: taskApi.cancel,
            };
          }
          throw error;
        }
      },
      {
        concurrency,
        stopOnError,
        signal,
      },
    )) as unknown as {
      [K in keyof T]: T[K] extends RegisteredTask<infer R> ? TaskAPI<R> : never;
    }[number][];

    return Object.assign(results, {
      clear() {
        for (const taskApi of tasksQueue) {
          taskApi.clear();
        }
      },
      cancel() {
        for (const taskApi of tasksQueue) {
          taskApi.cancel();
        }
      },
    });
  };

  return task;
}

// Task management functionality
const createTaskInnerApi = (taskState: TaskObject): TaskInnerAPI => {
  const api: TaskInnerAPI = {
    task: advancedTaskPrompt(taskState.children),
    setTitle(title) {
      taskState.title = title;
    },
    setStatus(status) {
      taskState.status = status;
    },
    setOutput(output) {
      taskState.output =
        typeof output === "string"
          ? output
          : "message" in output
            ? output.message
            : "";
    },
    setWarning(warning) {
      taskState.state = "warning";
      if (warning !== undefined) {
        api.setOutput(warning);
        if (warning instanceof Error) {
          taskState.error = warning;
        }
      }
    },
    setError(error) {
      taskState.state = "error";
      if (error !== undefined) {
        api.setOutput(error);
        if (error instanceof Error) {
          taskState.error = error;
        }
      }
    },
    setProgress(progress) {
      taskState.progress = progress;
    },
    updateProgress(current: number, total?: number, message?: string) {
      const currentProgress = taskState.progress || { current: 0, total: 100 };
      taskState.progress = {
        current,
        total: total ?? currentProgress.total,
        message: message ?? currentProgress.message,
      };
    },
    cancel() {
      if (taskState.cancelToken) {
        taskState.cancelToken.abort();
        taskState.state = "cancelled";
      }
    },
    isCancelled() {
      return taskState.cancelToken?.signal.aborted || false;
    },
  };
  return api;
};

// Update spinnerTask to use the new SpinnerType
export async function spinnerTask(options: SpinnerTaskOptions): Promise<void> {
  const {
    initialMessage,
    errorMessage = "An error occurred during the task.",
    delay = 100,
    spinnerType = "default",
    action,
  } = options;

  let message = initialMessage;
  let interval: NodeJS.Timer | null = null;
  let frameIndex = 0;

  // Use ora for its spinner types
  if (
    spinnerType === "dots" ||
    spinnerType === "bouncingBar" ||
    spinnerType === "arc"
  ) {
    const oraSpinner = ora({
      text: initialMessage,
      spinner: spinnerType,
    });

    try {
      oraSpinner.start();

      await action((newMessage: string) => {
        message = newMessage;
        oraSpinner.text = newMessage;
      });

      oraSpinner.stop();
    } catch (error) {
      oraSpinner.stopAndPersist({
        symbol: pc.red("✖"),
        text: errorMessage,
      });

      msg({
        type: "M_ERROR",
        title:
          error instanceof Error ? error.message : "An unknown error occurred.",
        titleColor: "red",
      });

      process.exit(1);
    }
  } else {
    // Use simple spinners
    const simpleSpinners = {
      default: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
      dottedCircle: ["○", "", "◑", "◕", "●"],
      boxSpinner: ["▖", "▘", "▝", "▗"],
    };

    const frames =
      spinnerType && spinnerType in simpleSpinners
        ? simpleSpinners[spinnerType as SimpleSpinnerType]
        : simpleSpinners.default;

    const handleInput = (data: Buffer) => {
      const key = data.toString();
      if (key === "\r" || key === "\n") {
        return;
      }
    };

    try {
      if (
        process.stdin.isTTY &&
        typeof process.stdin.setRawMode === "function"
      ) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on("data", handleInput);
      }

      interval = setInterval(() => {
        const frame = pc.magenta(frames[frameIndex]);
        process.stdout.write(
          `${cursor.move(-999, 0)}${erase.line}${frame} ${pc.cyan(message)}`,
        );
        frameIndex = (frameIndex + 1) % frames.length;
      }, delay);

      await action((newMessage: string) => {
        message = newMessage;
      });

      clearInterval(interval);
      interval = null;
    } catch (error) {
      if (interval) {
        clearInterval(interval);
      }

      process.stdout.write(
        `\r${erase.line}${pc.red("✖")} ${
          error instanceof Error ? errorMessage : "An unknown error occurred."
        }\n`,
      );

      msg({
        type: "M_ERROR",
        title:
          error instanceof Error ? error.message : "An unknown error occurred.",
        titleColor: "red",
      });

      process.exit(1);
    } finally {
      if (
        process.stdin.isTTY &&
        typeof process.stdin.setRawMode === "function"
      ) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", handleInput);
      }
    }
  }
}

// Export a function to get task statistics
export function getTaskStats(taskList: TaskList = rootTaskList) {
  const stats = {
    total: 0,
    pending: 0,
    loading: 0,
    success: 0,
    error: 0,
    warning: 0,
    cancelled: 0,
    averageDuration: 0,
  };

  function processTask(task: TaskObject) {
    stats.total++;
    stats[task.state]++;
    if (task.duration) {
      stats.averageDuration =
        (stats.averageDuration * (stats.total - 1) + task.duration) /
        stats.total;
    }
    task.children.forEach(processTask);
  }

  taskList.forEach(processTask);
  return stats;
}

export default advancedTaskPrompt(rootTaskList);
