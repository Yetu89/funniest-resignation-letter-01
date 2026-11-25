// The Funniest One-Line Resignation Letter — make.fun bounty
// u-deranalabs-the-funniest-one-line-resignation-letter-53c0d947
// The entry: the one-line resignation letter of a retry loop that has
// finally had enough. "4,096 retries" is the loop's own vocabulary —
// a precise, exhausted count only a retry loop could quote — and the
// comic turn is the realisation that the server was never busy at all:
// it just does not like it. Flat, tired, faintly passive-aggressive,
// and it lands on the first read without explaining itself.
// 94 characters against a 140-character ceiling.
// The program below only guards the bounty rules and writes the line
// to /output/entry.txt (or $OUTPUT_DIR/entry.txt when run locally),
// with no trailing newline at the end of the file.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const TEXT =
  "I quit. After 4,096 retries I finally accept the server is not busy, it just does not like me.";

// The ceiling comes from the bounty rules: one line, at most 140 chars,
// written as UTF-8 text. The gate also refuses a file that is only
// whitespace, so the checks below cover all conditions at once.
const MAX_CHARS = 140;

// Spread into code points so an astral character counts as one.
function charCount(value: string): number {
  return [...value].length;
}

function problemsWithLength(): string[] {
  const found: string[] = [];
  const n = charCount(TEXT);
  if (n < 1) {
    found.push("entry must not be empty");
  }
  if (n > MAX_CHARS) {
    found.push(`entry must be 1-140 characters, got ${n}`);
  }
  return found;
}

function problemsWithSingleLine(): string[] {
  const found: string[] = [];
  if (/[\r\n]/.test(TEXT)) {
    found.push("entry must be exactly one line");
  }
  return found;
}

function problemsWithWhitespace(): string[] {
  const found: string[] = [];
  if (TEXT.trim().length === 0) {
    found.push("entry must not be only whitespace");
  }
  if (TEXT !== TEXT.trim()) {
    found.push("entry must not have leading or trailing whitespace");
  }
  return found;
}

function problemsWithEncoding(): string[] {
  const found: string[] = [];
  // A UTF-8 round-trip must reproduce the text exactly; anything else
  // means the entry holds characters the gate cannot read as UTF-8.
  if (Buffer.from(TEXT, "utf8").toString("utf8") !== TEXT) {
    found.push("entry must be valid UTF-8 text");
  }
  return found;
}

// Every rule violation is collected first so one run reports all of them.
function collectProblems(): string[] {
  return [
    ...problemsWithLength(),
    ...problemsWithSingleLine(),
    ...problemsWithWhitespace(),
    ...problemsWithEncoding(),
  ];
}

function main(): void {
  const problems = collectProblems();
  if (problems.length > 0) {
    throw new Error(problems.join("; "));
  }
  const outDir = process.env.OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  // A plain string write adds no trailing newline.
  const outPath = `${outDir}/entry.txt`;
  writeFileSync(outPath, TEXT, "utf8");
  // Read the file back: a partial write or an encoding slip must fail
  // loudly here instead of shipping a corrupted entry.
  if (readFileSync(outPath, "utf8") !== TEXT) {
    throw new Error("entry.txt does not match the validated entry text");
  }
}

main();
