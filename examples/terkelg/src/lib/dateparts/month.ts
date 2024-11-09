import DatePart from "./datepart";

interface MonthOptions {
  token: string;
  date?: Date;
  parts?: DatePart[];
  locales?: {
    monthsShort: string[];
    months: string[];
  };
}

class Month extends DatePart {
  constructor(opts: MonthOptions = { token: "MM" }) {
    super(opts);
  }

  // @ts-expect-error TODO: fix ts
  up(): void {
    this.date.setMonth(this.date.getMonth() + 1);
  }

  // @ts-expect-error TODO: fix ts
  down(): void {
    this.date.setMonth(this.date.getMonth() - 1);
  }

  // @ts-expect-error TODO: fix ts
  setTo(val: string): void {
    const month = parseInt(val.slice(-2), 10) - 1;
    this.date.setMonth(month < 0 ? 0 : month);
  }

  // @ts-expect-error TODO: fix ts
  toString(): string {
    const month = this.date.getMonth();
    const tokenLength = this.token.length;

    return tokenLength === 2
      ? String(month + 1).padStart(2, "0")
      : tokenLength === 3
        ? this.locales.monthsShort[month]
        : tokenLength === 4
          ? this.locales.months[month]
          : String(month + 1);
  }
}

export default Month;
