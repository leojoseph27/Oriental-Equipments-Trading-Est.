# tooling-report.md — Environment, tools and compatibility (verified Step 2)

All results below were actually executed and observed in this session.

## Base environment

| Item | Version / state | Verified |
|---|---|---|
| Node.js | v24.14.0 | `node --version` |
| npm | 11.9.0 | `npm --version` |
| Git | 2.54.0.windows.1 | `git --version` |
| Python | 3.13 (`AppData\Local\Programs\Python\Python313`) | `which python` |
| Shell | Git Bash on Windows (win32) | session environment |
| Workspace | empty at Step 1 start; not a git repository | `ls`, session info |

## Project-level dependencies

None installed. Astro will be scaffolded in Step 3 (`npm create astro@latest`), which
creates `package.json` in this workspace. Nothing has been installed into any project
beyond the two agent-skill folders below (guidance markdown + scripts only — they add no
runtime dependencies to the website).

## Design guidance tools (installed & initialized this step)

1. **TasteSkill** — installed with the officially documented command
   `npx skills add Leonxlnx/taste-skill --agent zcode -y` (non-interactive flags
   required on this shell; the bare command cancelled on an interactive agent-picker
   prompt). Installed to `.zcode/skills/design-taste-frontend/` and listed by
   `npx skills list` as a project skill for ZCode. Its v2 SKILL.md was read: it is a
   guidance/inspector skill (directions library + screenshot review loop), stack-agnostic
   and explicitly supports Astro.
2. **Impeccable** — installed with `npx skills add pbakaus/impeccable --agent zcode -y`
   to `.zcode/skills/impeccable/` (v4.7.0 per its SKILL.md frontmatter). Initialization
   procedure determined from its SKILL.md and executed once:
   `sh .zcode/skills/impeccable/scripts/impeccable context` — ran successfully,
   reported session context (no DESIGN.md yet — expected at this stage) and the
   `impeccable detect --json` command to run once over finished UI later. Per its own
   instructions, no other design commands were run.

   Note from init output: no `cwebp`/`magick`/`ffmpeg` image converters are present on
   this machine; image optimisation will use the npm `sharp` package in the project's
   dev dependencies (Step 3) instead.

## Browser testing

- **Playwright MCP tools in this session: verified working.** A navigation to
  `about:blank` and browser close succeeded via the session's `mcp__playwright__*`
  tools. Sufficient for interactive visual testing during development (navigate,
  snapshot, click, type, screenshot, viewport resize, console/network inspection).
- **No second browser stack installed**, per instructions. Project-level
  `@playwright/test` is recommended for milestone 8 (repeatable E2E suite); it requires
  `npx playwright install` (browser binaries, several hundred MB download). This is an
  additive, dev-only dependency and will be installed in Step 3's scaffold or milestone 8.

## PDF processing (already available from Step 1 audit)

- `pypdf` and `pypdfium2` + `Pillow` installed at **user level** (`pip install --user`);
  used to extract all 29 pages of text and render key pages to PNG. These are analysis
  tools, not website dependencies.

## Compatibility findings / limitations

- Windows + Git Bash: interactive CLI prompts (the `skills` agent picker) hang without a
  TTY — always pass `-y --agent zcode`. Noted for future `npx` installs.
- Playwright browser downloads on Windows can be slow; plan the milestone-8 install with
  a generous timeout.
- No image-conversion CLI tools present (see Impeccable note above) — `sharp` covers it.
- No conflicts found between Astro static output, the two skill folders, and the
  session's Playwright tools.
