import DatePart from "./datepart";

class Hours extends DatePart {
  constructor(
    opts: {
      token: string;
      date?: Date;
      parts?: DatePart[];
      locales?: Record<string, any>;
    } = {},
  ) {
    super(opts);
  }

  // @ts-expect-error TODO: fix ts
  up(): void {
    this.date.setHours(this.date.getHours() + 1);
  }

  // @ts-expect-error TODO: fix ts
  down(): void {
    this.date.setHours(this.date.getHours() - 1);
  }

  // @ts-expect-error TODO: fix ts
  setTo(val: string): void {
    this.date.setHours(parseInt(val.slice(-2), 10));
  }

  // @ts-expect-error TODO: fix ts
  toString(): string {
    let hours = this.date.getHours();
    if (/h/.test(this.token)) {
      hours = hours % 12 || 12;
    }
    return this.token.length > 1
      ? String(hours).padStart(2, "0")
      : String(hours);
  }
}

export default Hours;
