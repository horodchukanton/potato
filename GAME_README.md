# Runner + Mini Tetris (Balloon)

Two-phase Phaser 3 game:
- Phase 1 (Runner): Jump to catch falling tetrominoes on a scrolling ground. Collect 40 pieces.
- Phase 2 (Mini Tetris): Use those 40 pieces to fill a balloon-shaped mask on a 10x20 grid. No line clears; rotate/move and lock pieces to fill the shape. When filled, a balloon picture appears.

## Local dev
1. npm ci
2. npm run dev
3. Open the printed local URL.

## Deploy to GitHub Pages (GitHub Actions)
1. Merge this PR.
2. In Settings → Pages, set "Build and deployment" Source to "GitHub Actions".
3. Push to main. The workflow .github/workflows/pages.yml will build with Vite and deploy to Pages.
4. Your site will be available at https://horodchukanton.github.io/potato/.

## Notes
- Vite base path is set from the repository name automatically via GITHUB_REPOSITORY.
- Controls:
  - Runner: Space/Up to jump; Left/Right to move. Tap to jump on mobile.
  - Mini Tetris: Left/Right/Down move, Up or X rotate, Space hard drop.
- To restart after finishing the puzzle, click/tap.