import type { State, MsgType } from "../types";
export declare function fmt(type: MsgType, state?: State, text?: string, dashCount?: number): string;
export declare function msg(type: MsgType, state: State, text: string, dashCount: number): void;
