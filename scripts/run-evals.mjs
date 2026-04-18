#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const SUITES = ["trigger", "shape"];
const args = new Set(process.argv.slice(2));
const only = [...args].find((a) => a.startsWith("--suite="))?.split("=")[1];

const suitesToRun = only ? [only] : SUITES;
let failures = 0;

for (const suite of suitesToRun) {
  const dir = join("tests", `${suite === "trigger" ? "skill-trigger" : "output-shape"}-evals`);
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    console.log(`[${suite}] no eval dir yet — skipping`);
    continue;
  }
  if (files.length === 0) {
    console.log(`[${suite}] no evals — skipping`);
    continue;
  }
  console.log(`[${suite}] ${files.length} eval(s):`);
  for (const file of files) {
    const eval_ = JSON.parse(await readFile(join(dir, file), "utf8"));
    const ok = eval_.status === "passed";
    failures += ok ? 0 : 1;
    console.log(`  ${ok ? "✓" : "✗"} ${eval_.name}${ok ? "" : `  (status: ${eval_.status})`}`);
  }
}

process.exit(failures === 0 ? 0 : 1);
