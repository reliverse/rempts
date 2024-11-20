import type { LogLevel } from "./constants.js";
import type { RelinkaInstance } from "./relinka.js";
import type { RelinkaOptions } from "~/types/prod.js";

import { BasicReporter } from "./components/basic-rep.js";
import { LogLevels } from "./constants.js";
import { createRelinka as _createRelinka } from "./relinka.js";

export * from "./shared.js";

/**
 * Factory function to create a new Relinka instance
 *
 * @param {Partial<RelinkaOptions & { fancy: boolean }>} [options={}] - Optional configuration options. See {@link RelinkaOptions}.
 * @returns {RelinkaInstance} A new Relinka instance configured with the given options.
 */
export function createRelinka(
  options: Partial<RelinkaOptions & { fancy: boolean }> = {},
): RelinkaInstance {
  // Log level
  let level: LogLevel = LogLevels.info;
  if (process.env.RELINKA_LEVEL) {
    level = Number.parseInt(process.env.RELINKA_LEVEL) ?? level;
  }

  // Create new relinka instance
  const relinka = _createRelinka({
    level,
    defaults: { level },
    stdout: process.stdout,
    stderr: process.stderr,
    reporters: options.reporters || [new BasicReporter()],
    ...options,
  });

  return relinka;
}

/**
 * Creates and exports a standard instance of Relinka with the default configuration.
 * This instance can be used directly for logging throughout the application.
 *
 * @type {RelinkaInstance} relinka - The default instance of Relinka.
 */
export const relinka = createRelinka();

export default relinka;
