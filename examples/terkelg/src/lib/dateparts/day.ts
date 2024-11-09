import DatePart from "./datepart";

const pos = (n: number): string => {
  n = n % 10;
  return n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
};

interface DayOptions {
  token?: string;
  date?: Date;
  parts?: DatePart[];
  locales?: {
    weekdaysShort: string[];
    weekdays: string[];
  };
}

class Day extends DatePart {
  constructor(opts: DayOptions = {}) {
    super(opts);
  }

  // @ts-expect-error TODO: fix ts
  up(): void {
    this.date.setDate(this.date.getDate() + 1);
  }

  // @ts-expect-error TODO: fix ts
  down(): void {
    this.date.setDate(this.date.getDate() - 1);
  }

  // @ts-expect-error TODO: fix ts
  setTo(val: string): void {
    this.date.setDate(parseInt(val.slice(-2), 10));
  }

  // @ts-expect-error TODO: fix ts
  toString(): string {
    const date = this.date.getDate();
    const day = this.date.getDay();
    return this.token === "DD"
      ? String(date).padStart(2, "0")
      : this.token === "Do"
        ? date + pos(date)
        : this.token === "d"
          ? String(day + 1)
          : this.token === "ddd"
            ? this.locales.weekdaysShort[day]
            : this.token === "dddd"
              ? this.locales.weekdays[day]
              : String(date);
  }
}

export default Day;
