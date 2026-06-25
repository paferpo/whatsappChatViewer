# CI/CD releases (macOS + Windows)

## Goal
On a version tag, build the Tauri app and publish a GitHub Release with macOS
(`.dmg`) and Windows (`.msi`/`.exe`) installers. **Unsigned** for now (decision
confirmed); signing/notarization left as clearly-marked placeholders.

## Current state
- Tauri v2 app; bundling already enabled in
  [src-tauri/tauri.conf.json](../../src-tauri/tauri.conf.json)
  (`bundle.active: true`, `targets: "all"`).
- Build commands: `npm run build` (Vite → `dist/`) then `tauri build`
  (`npm run tauri:build`).
- **No `.github/workflows/` yet.**
- **Version mismatch:** `package.json` = `2.1.0`, `tauri.conf.json` = `0.1.0`.

## Step 0 — sync version
Set both to the same value (the release tag drives it). Make `package.json` the
source of truth and update `src-tauri/tauri.conf.json` `version` to match (or set
`version` to read from `package.json` per Tauri docs). The git tag should be
`v<version>`.

## Step 1 — workflow `.github/workflows/release.yml`
```yaml
name: Release
on:
  push:
    tags: ['v*']
  workflow_dispatch:

permissions:
  contents: write   # tauri-action creates the GitHub Release

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: macos-latest   # Apple Silicon (aarch64)
            args: '--target aarch64-apple-darwin'
          - platform: macos-13       # Intel (x86_64) — optional
            args: '--target x86_64-apple-darwin'
          - platform: windows-latest
            args: ''
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ contains(matrix.platform, 'macos') && 'aarch64-apple-darwin,x86_64-apple-darwin' || '' }}
      - uses: swatinem/rust-cache@v2
        with: { workspaces: './src-tauri -> target' }
      - run: npm ci
      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'WA Export Viewer ${{ github.ref_name }}'
          releaseDraft: true
          prerelease: false
          args: ${{ matrix.args }}
```
- `tauri-action` runs `beforeBuildCommand` (`npm run build`) then `tauri build`,
  and uploads each platform's bundles to the (draft) Release. Publish the draft
  manually after checking artifacts.

## Step 2 — docs
- Add a "Releases / Building" section to [README.md](../../README.md):
  - How to cut a release: bump version, `git tag vX.Y.Z`, `git push --tags`.
  - Unsigned-install notes: **macOS** — right-click → Open (or
    `xattr -dr com.apple.quarantine` on the `.app`) the first time; **Windows** —
    "More info → Run anyway" past SmartScreen.
  - Local validation: `npm run tauri:build` produces bundles under
    `src-tauri/target/release/bundle/`.

## Step 3 — signing placeholders (future, not now)
Leave commented TODOs in the workflow for when certs exist:
- **macOS:** `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`,
  `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` (tauri-action reads these env vars
  to sign + notarize).
- **Windows:** code-signing cert via `WINDOWS_CERTIFICATE` / password, or Azure
  Trusted Signing.

## Files to touch / create
- `.github/workflows/release.yml` (new).
- `src-tauri/tauri.conf.json` (version), `package.json` (version).
- `README.md` (release + install notes).

## Verification
- Local: `npm run tauri:build` succeeds on a Mac and a Windows box and emits the
  `.dmg` / `.msi`/`.exe`.
- CI: push a `vX.Y.Z` tag (test on a fork/branch first) → workflow runs on both
  OSes → a **draft** GitHub Release contains the macOS and Windows installers.
- Smoke-test: download each installer, install, launch (accept the unsigned-app
  prompt), confirm a chat loads.
