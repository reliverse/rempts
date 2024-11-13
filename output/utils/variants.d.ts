import type { ColorName, Variant } from "../types/prod";
export declare const variantMap: {
    box: typeof createBox;
    doubleBox: typeof createDoubleBox;
    banner: typeof createBanner;
    underline: typeof createUnderline;
};
export declare function applyVariant(lines: string[] | string, variant?: Variant, options?: {
    limit?: number;
}, borderColor?: ColorName): Promise<string>;
declare function createBox(lines: string[], limit?: number): string;
declare function createDoubleBox(lines: string[], limit?: number, borderColor?: ColorName): string;
declare function createBanner(lines: string[]): string;
declare function createUnderline(lines: string[]): string;
export {};
