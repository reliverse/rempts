// @ts-nocheck

import prompts from "./prompts";

type PromptFunction = (
  answer: any,
  answers: Record<string, any>,
  question: Question,
) => any;

type Question = {
  name: string;
  type:
    | string
    | ((
        answer: any,
        answers: Record<string, any>,
        question: Question,
      ) => string | null);
  message: string;
  initial?: any;
  format?: (input: any, answers: Record<string, any>) => any;
  validate?: (input: any) => boolean | string;
  onState?: PromptFunction;
  onRender?: PromptFunction;
  [key: string]: any; // for additional properties
};

type PromptOptions = {
  onSubmit?: (
    question: Question,
    answer: any,
    answers: Record<string, any>,
  ) => boolean | Promise<boolean>;
  onCancel?: (
    question: Question,
    answers: Record<string, any>,
  ) => boolean | Promise<boolean>;
};

type Answers = Record<string, any>;

const passOn = ["suggest", "format", "onState", "validate", "onRender", "type"];
const noop = () => {};

// Main prompt function
async function prompt(
  questions: Question | Question[] = [],
  { onSubmit = () => true, onCancel = () => true }: PromptOptions = {},
): Promise<Answers> {
  const answers: Answers = {};
  const override = (prompt as any)._override || {};
  questions = Array.isArray(questions) ? questions : [questions];
  let answer: any;
  let quit: boolean | undefined;
  let lastPrompt: Question | undefined;

  const getFormattedAnswer = async (
    question: Question,
    answer: any,
    skipValidation = false,
  ): Promise<any> => {
    if (
      !skipValidation &&
      question.validate &&
      question.validate(answer) !== true
    ) {
      return undefined;
    }
    return question.format ? await question.format(answer, answers) : answer;
  };

  for (const question of questions) {
    let { name, type } = question;

    // Evaluate type first and skip if type is falsy
    if (typeof type === "function") {
      type = await type(answer, { ...answers }, question);
      question.type = type;
    }
    if (!type) continue;

    // Resolve any dynamic properties
    for (const key in question) {
      if (!passOn.includes(key)) {
        const value = question[key];
        question[key] =
          typeof value === "function"
            ? await value(answer, { ...answers }, lastPrompt)
            : value;
      }
    }

    lastPrompt = question;

    if (typeof question.message !== "string") {
      throw new Error("Prompt message is required");
    }

    // Update name and type in case they changed
    ({ name, type } = question);

    if (!(type in prompts)) {
      throw new Error(`Prompt type (${type}) is not defined`);
    }

    if (override[name] !== undefined) {
      answer = await getFormattedAnswer(question, override[name]);
      if (answer !== undefined) {
        answers[name] = answer;
        continue;
      }
    }

    try {
      // Get the injected answer if available, otherwise prompt the user
      answer = (prompt as any)._injected
        ? getInjectedAnswer((prompt as any)._injected, question.initial)
        : await prompts[type](question);
      answers[name] = answer = await getFormattedAnswer(question, answer, true);
      quit = await onSubmit(question, answer, answers);
    } catch (err) {
      quit = !(await onCancel(question, answers));
    }

    if (quit) {
      return answers;
    }
  }

  return answers;
}

function getInjectedAnswer(injected: any[], defaultValue: any): any {
  const answer = injected.shift();
  if (answer instanceof Error) {
    throw answer;
  }
  return answer === undefined ? defaultValue : answer;
}

function inject(answers: any[]): void {
  (prompt as any)._injected = ((prompt as any)._injected || []).concat(answers);
}

function override(answers: Record<string, any>): void {
  (prompt as any)._override = { ...answers };
}

// Export the prompt functions and additional utilities
export default Object.assign(prompt, { prompt, prompts, inject, override });
