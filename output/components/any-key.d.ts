type Options = {
    ctrlC?: number | "reject" | false;
    preserveLog?: boolean;
    hideMessage?: boolean;
};
export declare function pressAnyKeyPrompt(message?: string, options?: Options): Promise<void>;
export {};
