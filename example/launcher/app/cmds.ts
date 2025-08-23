// 👉 `dler rempts init --cmds`

import { type Command, loadCommand } from "~/mod";

export const getCmdHooks = async (): Promise<Command> => loadCommand("./hooks/cmd");

export const getCmdMinimal = async (): Promise<Command> => loadCommand("./minimal/cmd");

export const getRuncmdAdvancedCmd = async () => await loadCommand("./runcmd/advanced/cmd");
