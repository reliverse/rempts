export function isTerminalInteractive(input = process.stdin): boolean {
  return Boolean(input.isTTY);
}
