import { describe, expect, test } from "bun:test";

import { type ReliArgParserOptions, reliArgParser } from "../src/libs/core/core-main.js";

describe("reliArgParser - Basic", () => {
  test("handles empty args", () => {
    const result = reliArgParser([]);
    expect(result).toEqual({ _: [] });
  });

  test("handles positional arguments", () => {
    const result = reliArgParser(["file1.txt", "file2.txt"]);
    expect(result._).toEqual(["file1.txt", "file2.txt"]);
  });

  test("handles boolean flags", () => {
    const opts: ReliArgParserOptions = {
      boolean: ["verbose", "debug"],
    };
    const result = reliArgParser(["--verbose", "--debug", "--", "file.txt"], opts);
    expect(result).toEqual({
      _: ["file.txt"],
      verbose: true,
      debug: true,
    });
  });

  test("handles negated boolean flags", () => {
    const opts: ReliArgParserOptions = {
      boolean: ["verbose"],
      negatedBoolean: true,
    };
    const result = reliArgParser(["--no-verbose", "file.txt"], opts);
    expect(result).toEqual({
      _: ["file.txt"],
      verbose: false,
    });
  });

  test("handles string values with equals", () => {
    const result = reliArgParser(["--name=value", "file.txt"]);
    expect(result).toEqual({
      _: ["file.txt"],
      name: "value",
    });
  });

  test("handles string values with space", () => {
    const result = reliArgParser(["--name", "value", "file.txt"]);
    expect(result).toEqual({
      _: ["file.txt"],
      name: "value",
    });
  });

  test("handles short flags", () => {
    const opts: ReliArgParserOptions = {
      boolean: ["v", "d"],
    };
    const result = reliArgParser(["-vd", "file.txt"], opts);
    expect(result).toEqual({
      _: ["file.txt"],
      v: true,
      d: true,
    });
  });

  test("handles short flags with values", () => {
    const result = reliArgParser(["-n=value", "file.txt"]);
    expect(result).toEqual({
      _: ["file.txt"],
      n: "value",
    });
  });

  test("handles aliases", () => {
    const opts: ReliArgParserOptions = {
      alias: {
        v: "verbose",
        n: "name",
      },
    };
    const result = reliArgParser(["-v", "--name", "test"], opts);
    expect(result).toEqual({
      _: [],
      verbose: true,
      name: "test",
    });
  });

  test("handles double dash separator", () => {
    const result = reliArgParser(["--name", "value", "--", "--not-a-flag"]);
    expect(result).toEqual({
      _: ["--not-a-flag"],
      name: "value",
    });
  });

  test("handles default values", () => {
    const opts: ReliArgParserOptions = {
      defaults: {
        name: "default",
        count: 0,
      },
    };
    const result = reliArgParser(["--count", "5"], opts);
    expect(result).toEqual({
      _: [],
      name: "default",
      count: "5",
    });
  });
});

describe("reliArgParser - Unknown Flags", () => {
  test("warns on unknown flags when warnOnUnknown is true", () => {
    const originalWarn = console.warn;
    let warningMessage = "";
    console.warn = (msg: string) => {
      warningMessage = msg;
    };

    reliArgParser(["--unknown"], { warnOnUnknown: true });
    expect(warningMessage).toBe("Unknown flag: --unknown");

    console.warn = originalWarn;
  });

  test("throws on unknown flags when strict is true", () => {
    const opts: ReliArgParserOptions = { strict: true };
    expect(() => reliArgParser(["--unknown"], opts)).toThrow("Unknown flag: --unknown");
  });

  test("uses custom unknown handler", () => {
    let called = false;
    reliArgParser(["--unknown"], {
      unknown: (_flag) => {
        called = true;
        return true; // allow the unknown
      },
    });
    expect(called).toBe(true);
  });
});

describe("reliArgParser - Additional Features", () => {
  test("parseNumbers: converts numeric strings to numbers", () => {
    const result = reliArgParser(["--count", "42", "--price=9.99"], {
      parseNumbers: true,
    });
    expect(result).toEqual({
      _: [],
      count: 42,
      price: 9.99,
    });
  });

  test("parseNumbers with boolean", () => {
    const result = reliArgParser(["--flag=true"], {
      parseNumbers: true,
      boolean: ["flag"],
    });
    // 'flag' is boolean => interpret "true" as true
    expect(result).toEqual({
      _: [],
      flag: true,
    });
  });

  test("string flags remain strings even if parseNumbers is true", () => {
    const result = reliArgParser(["--id=123"], {
      parseNumbers: true,
      string: ["id"],
    });
    expect(result).toEqual({
      _: [],
      id: "123",
    });
  });

  test("negative number is positional by default", () => {
    const result = reliArgParser(["-123", "file.txt"]);
    expect(result).toEqual({
      _: ["-123", "file.txt"],
    });
  });

  test("allowNegativeNumbers = false => -123 is interpreted as short flags", () => {
    // In strict mode, it should throw because '1','2','3' are unknown flags
    expect(() => reliArgParser(["-123"], { allowNegativeNumbers: false, strict: true })).toThrow(
      "Unknown flag: --1",
    );
    // Because short flag '1' is unknown => triggers an error in strict mode
  });

  test("stopEarly: first positional => rest are not parsed as flags", () => {
    const result = reliArgParser(["build", "--verbose", "somefile"], {
      stopEarly: true,
      boolean: ["verbose"],
    });
    // Once "build" is encountered, it's considered a positional => no more flag parsing
    expect(result).toEqual({
      _: ["build", "--verbose", "somefile"],
    });
  });

  test("array: repeated flags accumulate values", () => {
    const result = reliArgParser(
      ["--include=src", "--include", "tests", "--include=build", "other"],
      {
        array: ["include"],
      },
    );
    expect(result).toEqual({
      _: ["other"],
      include: ["src", "tests", "build"],
    });
  });
});
