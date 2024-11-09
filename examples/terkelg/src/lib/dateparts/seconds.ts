import DatePart from "./datepart";

interface SecondsOptions {
  token: string;
  date?: Date;
  parts?: DatePart[];
  locales?: Record<string, any>;
}

class Seconds extends DatePart {
  constructor(opts: SecondsOptions = { token: "ss" }) {
    super(opts);
  }

  // @ts-expect-error TODO: fix ts
  up(): void {
    this.date.setSeconds(this.date.getSeconds() + 1);
  }

  // @ts-expect-error TODO: fix ts
  down(): void {
    this.date.setSeconds(this.date.getSeconds() - 1);
  }

  // @ts-expect-error TODO: fix ts
  setTo(val: string): void {
    this.date.setSeconds(parseInt(val.slice(-2), 10));
  }

  // @ts-expect-error TODO: fix ts
  toString(): string {
    const seconds = this.date.getSeconds();
    return this.token.length > 1
      ? String(seconds).padStart(2, "0")
      : String(seconds);
  }
}

export default Seconds;
