import type { MeridiemOptions } from "../../types";
import DatePart from "./datepart";

class Meridiem extends DatePart {
  constructor(opts: MeridiemOptions = { token: "AM" }) {
    super(opts);
  }

  // @ts-expect-error TODO: fix ts
  up() {
    this.date.setHours((this.date.getHours() + 12) % 24);
  }

  // @ts-expect-error TODO: fix ts
  down() {
    this.up();
  }

  // @ts-expect-error TODO: fix ts
  toString() {
    let meridiem = this.date.getHours() > 12 ? "pm" : "am";
    // eslint-disable-next-line no-useless-escape
    return /\A/.test(this.token) ? meridiem.toUpperCase() : meridiem;
  }
}

export default Meridiem;
