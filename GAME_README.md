# Balloon Catcher (Phaser)

A tiny Phaser 3 game published with GitHub Pages. Catch falling balloons with your paddle. Works on desktop (arrow keys / A,D) and mobile (drag/tap).

## Play locally
Open docs/index.html in a browser (or use a static server). No build step is required.

## Publish with GitHub Pages
1. Commit is already set up under docs/.
2. Go to Settings → Pages.
3. Under "Build and deployment" set Source to "Deploy from a branch".
4. Select your default branch (e.g., `main`) and the `/docs` folder, then Save.
5. After it builds, your site will be available at:
   - https://<your-username>.github.io/<repo-name>/
   - For this repo, likely: https://horodchukanton.github.io/potato/

## Files
- docs/index.html – HTML shell loading Phaser from CDN
- docs/style.css – basic layout and styles
- docs/game.js – Phaser 3 game code (no external assets)

## Notes
- No bundler required. Phaser served from jsDelivr CDN.
- If you change folder names or move files, update Pages settings accordingly.