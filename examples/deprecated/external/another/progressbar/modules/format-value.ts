export default function formatValue(
  v: number,
  options: any, // Replace `any` with the actual type of options
  type: string,
): number | string {
  // No autopadding? Pass through
  if (options.autopadding !== true) {
    return v;
  }

  // Padding
  function autopadding(value: number, length: number): string {
    return (options.autopaddingChar + value).slice(-length);
  }

  switch (type) {
    case "percentage":
      return autopadding(v, 3);
    default:
      return v;
  }
}
