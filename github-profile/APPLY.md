# Fix what you see on github.com/allen745

## What is wrong right now
1. **Broken top banner** — your live README still has `AI%20%26` (ampersand) in the capsule URL. That causes:
   `xmlParseEntityRef: no name` on line 47.
2. **Old HUD / terminal colors** — `assets/*.svg` on `allen745/allen745` were never updated (still red / gold / "BUILDING DEVMIND AI").

## Fix in 2 steps

### 1) Replace README (this fixes the broken banner)
Open: https://github.com/allen745/allen745/edit/main/README.md

**Delete everything**, paste the full file from:
`github-profile/README.md` in this pack
(or: https://raw.githubusercontent.com/allen745/portfolio-demo-/cursor/github-profile-readme-2744/github-profile/README.md )

Commit.

Quick check: the hero `<img>` line must **NOT** contain `AI%20%26`.  
Safe version has **no** `desc=` (title only: ALLEN CHRISTIAN).

### 2) Replace the 4 asset SVGs (this updates HUD + terminal look)
Upload / overwrite these on `main` under `assets/`:

| File | From this pack |
|------|----------------|
| `assets/status-hud.svg` | `github-profile/assets/status-hud.svg` |
| `assets/terminal.svg` | `github-profile/assets/terminal.svg` |
| `assets/about.svg` | `github-profile/assets/about.svg` |
| `assets/divider.svg` | `github-profile/assets/divider.svg` |

Raw links (download → upload to repo):
- https://raw.githubusercontent.com/allen745/portfolio-demo-/cursor/github-profile-readme-2744/github-profile/assets/status-hud.svg
- https://raw.githubusercontent.com/allen745/portfolio-demo-/cursor/github-profile-readme-2744/github-profile/assets/terminal.svg
- https://raw.githubusercontent.com/allen745/portfolio-demo-/cursor/github-profile-readme-2744/github-profile/assets/about.svg
- https://raw.githubusercontent.com/allen745/portfolio-demo-/cursor/github-profile-readme-2744/github-profile/assets/divider.svg

Hard-refresh the profile (`Ctrl+Shift+R`). Camo can cache the old broken banner for a few minutes.

## One-line emergency fix (banner only)
If you only want the banner working now, edit line 4 of README and replace:

`desc=AI%20%26%20Data%20Science...`  → delete the whole `&desc=...&descColor=d4b48a` part  
or change `%26` → `%2B`.
