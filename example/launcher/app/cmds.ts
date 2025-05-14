// 👉 `dler rempts init --cmds`

export async function getCmdHooks() {
  return (await import("./hooks/cmd.js")).default;
}
