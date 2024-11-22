export default function formatTime(
  t: number,
  options: any, // Replace `any` with the actual type of options
  roundToMultipleOf?: number,
): string {
  function round(input: number): number {
    if (roundToMultipleOf) {
      return roundToMultipleOf * Math.round(input / roundToMultipleOf);
    } else {
      return input;
    }
  }

  // Leading zero padding
  function autopadding(v: number): string {
    return (options.autopaddingChar + v).slice(-2);
  }

  if (t > 3600) {
    return (
      autopadding(Math.floor(t / 3600)) +
      "h" +
      autopadding(round((t % 3600) / 60)) +
      "m"
    );
  } else if (t > 60) {
    return (
      autopadding(Math.floor(t / 60)) + "m" + autopadding(round(t % 60)) + "s"
    );
  } else if (t > 10) {
    return autopadding(round(t)) + "s";
  } else {
    return autopadding(t) + "s";
  }
}
