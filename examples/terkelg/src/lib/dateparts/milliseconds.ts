import DatePart from "./datepart";

interface MillisecondsOptions {
  token: string;
  date?: Date;
  parts?: DatePart[];
  locales?: Record<string, any>;
}

class Milliseconds extends DatePart {
  constructor(opts: MillisecondsOptions = { token: "SSS" }) {
    super(opts);
  }

  // @ts-expect-error TODO: fix ts
  up(): void {
    this.date.setMilliseconds(this.date.getMilliseconds() + 1);
  }

  // @ts-expect-error TODO: fix ts
  down(): void {
    this.date.setMilliseconds(this.date.getMilliseconds() - 1);
  }

  // @ts-expect-error TODO: fix ts
  setTo(val: string): void {
    this.date.setMilliseconds(parseInt(val.slice(-this.token.length), 10));
  }

  // @ts-expect-error TODO: fix ts
  toString(): string {
    return String(this.date.getMilliseconds())
      .padStart(4, "0")
      .slice(0, this.token.length);
  }
}

export default Milliseconds;
