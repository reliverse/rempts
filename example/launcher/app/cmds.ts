// 👉 `dler rempts init --cmds`

export async function cmdHooks() {
  return (await import("./hooks/cmd.js")).default;
}

export async function cmdMinimal() {
  return (await import("./minimal/cmd.js")).default;
}
