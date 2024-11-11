import { type SpinnerName } from "cli-spinners";
type SimpleSpinnerType = "default" | "dottedCircle" | "boxSpinner";
type OraAllowedSpinners = "dots" | "bouncingBar" | "arc";
type OraSpinnerType = Extract<SpinnerName, OraAllowedSpinners>;
type SpinnerReturnType = {
    start: (msg?: string) => void;
    stop: (finalMessage?: string, code?: number) => void;
    updateMessage: (newMessage: string) => void;
};
type CreateSpinnerOptions<T extends "simple" | "ora"> = {
    initialMessage: string;
    delay?: number;
    solution: T;
} & (T extends "simple" ? {
    spinnerType?: SimpleSpinnerType;
} : {
    spinnerType?: OraSpinnerType;
});
export declare function createSpinner<T extends "simple" | "ora">(options: CreateSpinnerOptions<T>): SpinnerReturnType;
export {};
