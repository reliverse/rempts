import prompt from "enquirer";

export type InputPromptOptions = {
  name: string;
  message: string;
  initial?: string;
};

export type ConfirmPromptOptions = {
  name: string;
  message: string;
  initial?: boolean;
};

export type SelectPromptOptions<T = string> = {
  name: string;
  message: string;
  choices: (string | { name: string; message?: string; value?: T })[];
  initial?: number;
};

export type MultiSelectPromptOptions<T = string> = {
  name: string;
  message: string;
  choices: (string | { name: string; message?: string; value?: T })[];
  initial?: number[];
  limit?: number;
};

export type PromptResponse<T extends string = string, V = unknown> = Record<
  T,
  V
>;

/**
 * EnquirerWrapper
 * Provides a convenient, typed API for using Enquirer prompts.
 */
export class EnquirerWrapper {
  /**
   * Ask a simple input question.
   */
  async askInput<T extends string = string>(
    options: InputPromptOptions & { name: T },
  ): Promise<PromptResponse<T, string>> {
    const response = await prompt.prompt<Record<T, string>>({
      type: "input",
      name: options.name,
      message: options.message,
      initial: options.initial,
    });
    return response;
  }

  /**
   * Ask a yes/no question.
   */
  async askConfirm<T extends string = string>(
    options: ConfirmPromptOptions & { name: T },
  ): Promise<PromptResponse<T, boolean>> {
    const response = await prompt.prompt<Record<T, boolean>>({
      type: "confirm",
      name: options.name,
      message: options.message,
      initial: options.initial,
    });
    return response;
  }

  /**
   * Ask the user to pick one option from a list.
   */
  async askSelect<T extends string = string, V = string>(
    options: SelectPromptOptions<V> & { name: T },
  ): Promise<PromptResponse<T, V>> {
    const response = await prompt.prompt<Record<T, V>>({
      type: "select",
      name: options.name,
      message: options.message,
      choices: options.choices,
      initial: options.initial ?? 0,
    });
    return response;
  }

  /**
   * Ask the user to select multiple choices from a list.
   */
  async askMultiSelect<T extends string = string, V = string>(
    options: MultiSelectPromptOptions<V> & { name: T },
  ): Promise<PromptResponse<T, V[]>> {
    const response = await prompt.prompt<Record<T, V[]>>({
      type: "multiselect",
      name: options.name,
      message: options.message,
      initial: options.initial,

      // @ts-expect-error TODO: fix ts
      choices: options.choices,
      limit: options.limit,
    });
    return response;
  }

  /**
   * Run multiple prompts in sequence.
   * Provide an array of question objects as per Enquirer docs.
   */
  //   async askMultiple<T extends Record<string, unknown>>(
  //     questions: Parameters<typeof prompt>[0][],
  //   ): Promise<T> {
  //     const response = await prompt<T>(questions);
  //     return response;
  //   }
}
