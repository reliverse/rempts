import DatePart from "./datepart";

interface MinutesOptions {
  token: string;
  date?: Date;
  parts?: DatePart[];
  locales?: Record<string, any>;
}

class Minutes extends DatePart {
  constructor(opts: MinutesOptions = { token: "mm" }) {
    super(opts);
  }

  // @ts-expect-error TODO: fix ts
  up(): void {
    this.date.setMinutes(this.date.getMinutes() + 1);
  }

  // @ts-expect-error TODO: fix ts
  down(): void {
    this.date.setMinutes(this.date.getMinutes() - 1);
  }

  // @ts-expect-error TODO: fix ts
  setTo(val: string): void {
    this.date.setMinutes(parseInt(val.slice(-2), 10));
  }

  // @ts-expect-error TODO: fix ts
  toString(): string {
    const m = this.date.getMinutes();
    return this.token.length > 1 ? String(m).padStart(2, "0") : String(m);
  }
}

export default Minutes;
