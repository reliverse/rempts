export default class ETA {
  private etaBufferLength: number;
  private valueBuffer: number[];
  private timeBuffer: number[];
  private eta: number | string;

  constructor(length = 100, initTime: number, initValue: number) {
    this.etaBufferLength = length;
    this.valueBuffer = [initValue];
    this.timeBuffer = [initTime];
    this.eta = 0;
  }

  // Add new values to calculation buffer
  update(time: number, value: number, total: number): void {
    this.valueBuffer.push(value);
    this.timeBuffer.push(time);

    // Trigger recalculation
    this.calculate(total - value);
  }

  // Fetch estimated time
  getTime(): number | string {
    return this.eta;
  }

  // ETA calculation - request number of remaining events
  private calculate(remaining: number): void {
    const currentBufferSize = this.valueBuffer.length;
    const buffer = Math.min(this.etaBufferLength, currentBufferSize);

    const v_diff =
      this.valueBuffer[currentBufferSize - 1] -
      this.valueBuffer[currentBufferSize - buffer];
    const t_diff =
      this.timeBuffer[currentBufferSize - 1] -
      this.timeBuffer[currentBufferSize - buffer];

    // Get progress per ms
    const vt_rate = v_diff / t_diff;

    // Strip past elements
    this.valueBuffer = this.valueBuffer.slice(-this.etaBufferLength);
    this.timeBuffer = this.timeBuffer.slice(-this.etaBufferLength);

    // Eq: vt_rate * x = total
    const eta = Math.ceil(remaining / vt_rate / 1000);

    // Check values
    if (isNaN(eta)) {
      this.eta = "NULL";
    } else if (!isFinite(eta)) {
      this.eta = "INF";
    } else if (eta > 1e7) {
      this.eta = "INF";
    } else if (eta < 0) {
      this.eta = 0;
    } else {
      this.eta = eta;
    }
  }
}
