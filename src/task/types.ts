export type ProgressBarOptions = {
  total: number;
  width?: number;
  completeChar?: string;
  incompleteChar?: string;
  format?: string;
  colorize?: boolean;
  increment?: number;
  desiredTotalTime?: number;
};

export type ProgressBar = {
  update: (value: number) => Promise<void>;
  increment: (amount?: number) => Promise<void>;
  render: () => Promise<void>;
};
