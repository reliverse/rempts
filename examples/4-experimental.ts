import { selectPrompt } from "~/components/select";
import { errorHandler } from "~/utils/helpers/errors";

export async function detailedExample() {
  await selectPrompt({
    options: [{ value: "a" }, { value: "b" }, { value: "c" }],
    render: function (this: Omit<any, "prompt">): string | void {
      throw new Error("Function not implemented.");
    },
  });
}

await detailedExample().catch((error) => errorHandler(error));
