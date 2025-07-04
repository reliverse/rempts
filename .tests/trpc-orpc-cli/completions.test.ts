import { expect, test as baseTest } from "bun:test";
import { execa } from "execa";
import * as fs from "node:fs";
import * as path from "node:path";
import stripAnsi from "strip-ansi";

import "../src";

const test = process.env.CI ? baseTest.skip : baseTest;

const execAll = async (
  program: string,
  args: string[],
  options: import("execa").Options = {},
) => {
  const { all } = await execa(program, args, {
    reject: false,
    cwd: path.join(__dirname, ".."),
    ...(options as {}),
    all: true,
  });
  return stripAnsi(all);
};

test("completions", async () => {
  const SHELL_INIT_FILE = path.join(__dirname, "completions-test-ignoreme.sh");
  fs.writeFileSync(SHELL_INIT_FILE, "");
  const setup = await execAll(
    "node_modules/.bin/tsx",
    ["test/fixtures/completable", "--setupCompletions"],
    {
      env: {
        SHELL_INIT_FILE,
      },
    },
  );
  expect(setup).toMatchInlineSnapshot(`
    "setupShellInitFile /Users/blefnk/rempts/test/completions-test-ignoreme.sh 
    # begin completable completion
    . <(completable --completion)
    # end completable completion
    "
  `);

  expect(fs.readFileSync(SHELL_INIT_FILE, "utf8")).toMatchInlineSnapshot(`
    "
    # begin completable completion
    . <(completable --completion)
    # end completable completion
    "
  `);

  fs.appendFileSync(
    SHELL_INIT_FILE,
    `completable() { node_modules/.bin/tsx test/fixtures/completable "$@"; }`,
  );

  const completions = await execAll(
    "node_modules/.bin/tsx",
    ["test/fixtures/completable", "--completion"],
    {},
  );
  expect(completions).toMatchInlineSnapshot(`
    "### completable completion - begin. generated by omelette.js ###
    if type compdef &>/dev/null; then
      _completable_completion() {
        compadd -- \`completable --compzsh --compgen "\${CURRENT}" "\${words[CURRENT-1]}" "\${BUFFER}"\`
      }
      compdef _completable_completion completable
    elif type complete &>/dev/null; then
      _completable_completion() {
        local cur prev nb_colon
        _get_comp_words_by_ref -n : cur prev
        nb_colon=$(grep -o ":" <<< "$COMP_LINE" | wc -l)

        COMPREPLY=( $(compgen -W '$(completable --compbash --compgen "$((COMP_CWORD - (nb_colon * 2)))" "$prev" "\${COMP_LINE}")' -- "$cur") )

        __ltrim_colon_completions "$cur"
      }
      complete -F _completable_completion completable
    elif type compctl &>/dev/null; then
      _completable_completion () {
        local cword line point si
        read -Ac words
        read -cn cword
        read -l line
        si="$IFS"
        if ! IFS=$'
    ' reply=($(completable --compzsh --compgen "\${cword}" "\${words[cword-1]}" "\${line}")); then
          local ret=$?
          IFS="$si"
          return $ret
        fi
        IFS="$si"
      }
      compctl -K _completable_completion completable
    fi
    ### completable completion - end ###"
  `);

  const cleanup = await execAll(
    "node_modules/.bin/tsx",
    ["test/fixtures/completable", "--removeCompletions"],
    {
      env: {
        SHELL_INIT_FILE,
      },
    },
  );
  expect(cleanup).toMatchInlineSnapshot(`""`);
  expect(fs.readFileSync(SHELL_INIT_FILE, "utf8")).toMatchInlineSnapshot(
    `"completable() { node_modules/.bin/tsx test/fixtures/completable "$@"; }"`,
  );
});
