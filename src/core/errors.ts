export class AbortPromptError extends Error {
  constructor(options?: ErrorOptions) {
    super("Prompt aborted", options);
    this.name = "AbortPromptError";
  }
}

export class CancelPromptError extends Error {
  constructor() {
    super("Prompt cancelled");
    this.name = "CancelPromptError";
  }
}

export class ExitPromptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExitPromptError";
  }
}

export class NonInteractiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NonInteractiveError";
  }
}

export class HookError extends Error {
  override name = "HookError";
}

export class ValidationError extends Error {
  override name = "ValidationError";
}
