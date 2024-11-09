export default class DatePart {
  token: string;
  date: Date;
  parts: DatePart[];
  locales: Record<string, any>;

  constructor({
    token,
    date = new Date(),
    parts = [],
    locales = {},
  }: {
    token: string;
    date?: Date;
    parts?: DatePart[];
    locales?: Record<string, any>;
  }) {
    this.token = token;
    this.date = date;
    this.parts = parts.length > 0 ? parts : [this];
    this.locales = locales;
  }

  up(): void {
    // Method to increase the date part, logic to be implemented
  }

  down(): void {
    // Method to decrease the date part, logic to be implemented
  }

  next(): DatePart | undefined {
    const currentIdx = this.parts.indexOf(this);
    return this.parts.find(
      (part, idx) => idx > currentIdx && part instanceof DatePart,
    );
  }

  setTo(val: any): void {
    // Sets the part to a specific value, logic to be implemented
  }

  prev(): DatePart | undefined {
    const parts = [...this.parts].reverse();
    const currentIdx = parts.indexOf(this);
    return parts.find(
      (part, idx) => idx > currentIdx && part instanceof DatePart,
    );
  }

  toString(): string {
    return String(this.date);
  }
}
