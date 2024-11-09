import DatePart from "./datepart";

interface YearOptions {
  token: string;
  date?: Date;
  parts?: DatePart[];
  locales?: Record<string, any>;
}

class Year extends DatePart {
  constructor(opts: YearOptions = { token: "YYYY" }) {
    super(opts);
  }

  // @ts-expect-error TODO: fix ts
  up(): void {
    this.date.setFullYear(this.date.getFullYear() + 1);
  }

  // @ts-expect-error TODO: fix ts
  down(): void {
    this.date.setFullYear(this.date.getFullYear() - 1);
  }

  // @ts-expect-error TODO: fix ts
  setTo(val: string): void {
    this.date.setFullYear(parseInt(val.slice(-4), 10));
  }

  // @ts-expect-error TODO: fix ts
  toString(): string {
    const year = String(this.date.getFullYear()).padStart(4, "0");
    return this.token.length === 2 ? year.slice(-2) : year;
  }
}

export default Year;
