#!/usr/bin/env node
// Automates the steps in docs/RELEASING.md: bump every version field,
// commit, tag, push, and watch the release workflow.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

const ROOT = new URL("../", import.meta.url);
const PKG = new URL("package.json", ROOT);
const LOCK = new URL("package-lock.json", ROOT);
const TAURI_CONF = new URL("src-tauri/tauri.conf.json", ROOT);
const CARGO_TOML = new URL("src-tauri/Cargo.toml", ROOT);
const CARGO_LOCK = new URL("src-tauri/Cargo.lock", ROOT);

function run(cmd) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { stdio: "inherit", cwd: ROOT });
}

function runCapture(cmd) {
  return execSync(cmd, { cwd: ROOT }).toString().trim();
}

function bump(version, kind) {
  const [major, minor, patch] = version.split(".").map(Number);
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function parseArgs(argv) {
  const args = { kind: "patch", yes: false, message: null, set: null };
  const rest = [];
  for (const arg of argv) {
    if (arg === "--major") args.kind = "major";
    else if (arg === "--minor") args.kind = "minor";
    else if (arg === "--patch") args.kind = "patch";
    else if (arg === "--yes" || arg === "-y") args.yes = true;
    else if (arg.startsWith("--set=")) args.set = arg.slice("--set=".length);
    else rest.push(arg);
  }
  args.message = rest.join(" ").trim();
  return args;
}

function updatePackageJson(path, version) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  json.version = version;
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
}

function updatePackageLock(path, version) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  json.version = version;
  if (json.packages?.[""]) json.packages[""].version = version;
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
}

function updateTauriConf(path, version) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  json.version = version;
  writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
}

function updateCargoToml(path, version) {
  const text = readFileSync(path, "utf8");
  const updated = text.replace(/^version = "[^"]+"$/m, `version = "${version}"`);
  if (updated === text) throw new Error(`No version field found in ${path}`);
  writeFileSync(path, updated);
}

function updateCargoLock(path, version) {
  const text = readFileSync(path, "utf8");
  const pattern = /(\[\[package\]\]\nname = "app"\nversion = ")[^"]+(")/;
  const updated = text.replace(pattern, `$1${version}$2`);
  if (updated === text) throw new Error(`No "app" package entry found in ${path}`);
  writeFileSync(path, updated);
}

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [y/N] `);
  rl.close();
  return /^y(es)?$/i.test(answer.trim());
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.message) {
    console.error(
      'Usage: npm run release -- "<summary of this release>" [--minor|--major] [--set=X.Y.Z] [--yes]'
    );
    process.exit(1);
  }

  const current = JSON.parse(readFileSync(PKG, "utf8")).version;
  const next = args.set ?? bump(current, args.kind);

  console.log(`Bumping ${current} -> ${next}`);

  const status = runCapture("git status --porcelain");
  if (status) {
    console.log("\nThe following changes will be included in the release commit:");
    console.log(status);
  }

  if (!args.yes && !(await confirm(`\nProceed with bump + commit + tag v${next} + push?`))) {
    console.log("Aborted.");
    return;
  }

  updatePackageJson(PKG, next);
  updatePackageLock(LOCK, next);
  updateTauriConf(TAURI_CONF, next);
  updateCargoToml(CARGO_TOML, next);
  updateCargoLock(CARGO_LOCK, next);

  const branch = runCapture("git rev-parse --abbrev-ref HEAD");

  run("git add -A");
  run(`git commit -m "Bump to ${next}: ${args.message}"`);
  run(`git push origin ${branch}`);
  run(`git tag v${next}`);
  run(`git push origin v${next}`);

  console.log(`\nTagged and pushed v${next}. Watch the release workflow with:`);
  console.log(`  gh run list --workflow=release.yml --limit 3`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
