# Apply this GitHub profile README

This folder is a ready pack for your profile repo:  
https://github.com/allen745/allen745

The cloud agent **cannot push** to `allen745/allen745` (only `portfolio-demo-` is installed). Apply it once:

## Option A — fastest (edit page)

1. Open https://github.com/allen745/allen745/edit/main/README.md  
2. Replace everything with the contents of [`README.md`](./README.md) in this folder  
3. Commit on `main`

4. Then update the SVGs (so colors match the new look):
   - Open each file under https://github.com/allen745/allen745/tree/main/assets  
   - Replace with the matching file from [`assets/`](./assets/) here  
   - Or drag-drop upload: `status-hud.svg`, `terminal.svg`, `about.svg`, `divider.svg`

## Option B — local git

```bash
git clone https://github.com/allen745/allen745.git
cd allen745
cp /path/to/portfolio-demo-/github-profile/README.md ./README.md
cp /path/to/portfolio-demo-/github-profile/assets/* ./assets/
git add README.md assets
git commit -m "Align profile README with cinematic portfolio voice"
git push origin main
```

## What changed (vs old README)

- Engineer-first copy (same voice as the portfolio)
- Cinema palette: deep `#06080d`, ivory, brass `#d4b48a`, cool `#8eb8c4`
- Honest ML/DL as learning series
- Correct live links (DevMind, portfolio, LinkedIn, email)
- Less emoji / badge noise; kept terminal + HUD + snake

## If you see `xmlParseEntityRef: no name` on camo.githubusercontent.com

That was the hero banner: capsule-render put a bare `&` into the SVG from `AI & Data Science`.  
This pack uses `AI + Data Science` and escapes `&` as `&amp;` in image URLs — re-paste `README.md` to clear it.
