import { relinka } from "@reliverse/relinka";

export const errorHandler = (error: Error, customMessage?: string) => {
  const separator = "─".repeat(71);
  relinka("error", `│${separator}`);
  relinka("error", "│  AN ERROR OCCURRED:\n│ ", error.message);
  relinka("error", `│${separator}`);
  if (customMessage) {
    relinka("error", `│  ${customMessage}`);
  } else {
    relinka(
      "error",
      "│  If this issue is related to @reliverse/rempts itself, please\n│  report the details at https://github.com/reliverse/rempts/issues",
    );
  }
  relinka("error", `╰${separator}`);
  process.exit(1);
};
