import { trpcServer } from "~/components/launcher/trpc-orpc-support/index.js";
import { createRpcCli, type TrpcCliMeta, z } from "~/mod.js";

const trpc = trpcServer.initTRPC.meta<TrpcCliMeta>().create();

const router = trpc.router({
  migra: trpc.procedure
    .meta({ description: "Diff two schemas.", default: true })
    .input(
      z.tuple([
        z
          .string()
          .describe("Base database URL"), //
        z.string().describe("Head database URL"),
        z.object({
          unsafe: z
            .boolean()
            .default(false)
            .describe("Allow destructive commands"),
        }),
      ]),
    )
    .query(async ({ input: [base, head, opts] }) => {
      console.log("connecting to...", base);
      console.log("connecting to...", head);
      const statements = ["create table foo(id int)"];
      if (opts.unsafe) {
        statements.push("drop table bar");
      }
      return statements.join("\n");
    }),
});

const cli = createRpcCli({ router });
void cli.run();
