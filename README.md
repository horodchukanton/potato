## Overview
Build a small 2-phase birthday game for a friend using Phaser. Publish on GitHub Pages. Use LocalStorage to save progress.

## Quick Start for Development
```bash
cd /home/runner/work/potato/potato  # or your project path
npm install                         # Install dependencies
npm start                          # Start development server
# Navigate to http://localhost:8080 to see the game
```

**Current Game Status**: Phase 1 infinite runner with player movement, obstacle generation, collision detection, and bubble collection implemented.

Assets:
 - Player: a pixelated male human with big height
 - Bubble: small blue/red/green baloons
 - Obstacle: a small rock

## Phases
1. **Running & Collecting**
    - A horizontal plane moves under the player (infinite runner style).
    - Obstacles appear, player must jump over them.
    - Player collects bubbles that appear randomly. Bubbles are collected by colliding with them.
    - After catching the first bubble, a cutscene shows his belly glowing and a tetromino forming inside.
    - When 50 bubbles are collected, a dialog asks if player wants to play Tetris. On confirmation, belly glows brighter and game switches to Phase 2.
2. **Tetris**
    - Player plays Tetris inside character's belly using collected tetrominoes from Phase 1.
    - Speed increases after each cleared line (up to max speed).
    - After using 50 tetrominoes, player is returned to Phase 1 to collect more bubbles.
    - After 34 lines, show a message saying "Happy Birthday!".

## Requirements
- Built with Phaser
- Published on GitHub Pages
- Use LocalStorage for saving intermediate results (bubbles collected, phase, etc.)

## Setup and Development

### Prerequisites
- Node.js (version 16 or higher)
- npm

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Game

#### Development Mode
```bash
npm start
```
- Starts webpack dev server at **http://localhost:8080**
- Includes hot reload for development
- Console output shows compilation status
- Game should load immediately in browser

#### Production Build
```bash
npm run build
```
- Creates optimized build in `dist/` folder
- Minifies and optimizes assets
- Ready for deployment to GitHub Pages
- Verify build success: check `dist/` folder contains `index.html` and `main.js`

#### Quick Verification
After running `npm start`, verify the game works:
1. Navigate to http://localhost:8080
2. Should see "Potato Game" menu scene
3. Press SPACE or click to start the game
4. Arrow keys should move the player
5. Check browser console for any errors

#### Testing Current Implementation
- **Player Movement**: Arrow keys (left/right) and spacebar (jump)
- **Obstacle Generation**: Obstacles spawn every 3-6 seconds from the right
- **Collision Detection**: Player should stop/react when hitting obstacles
- **Bubble Collection**: Bubbles appear and can be collected by touching them

### Project Structure
```
potato/
├── src/
│   ├── scenes/          # Phaser game scenes
│   │   ├── PreloadScene.js
│   │   ├── MenuScene.js
│   │   └── GameScene.js
│   ├── config.js        # Game configuration
│   ├── main.js          # Game initialization
│   └── index.html       # HTML template
├── dist/                # Built game (created by npm run build)
├── package.json         # Dependencies and scripts
├── webpack.config.js    # Build configuration
└── README.md           # This file
```

### Troubleshooting

#### Common Issues
- **Port already in use**: If port 8080 is busy, webpack will use the next available port
- **Module not found**: Run `npm install` to ensure all dependencies are installed
- **Build fails**: Check Node.js version (requires 16+)
- **Game doesn't load**: Check browser console for JavaScript errors

#### Development Tips for Agents
1. **Quick Start**: `cd /path/to/potato && npm install && npm start`
2. **Verify Game State**: Check browser console for Phaser initialization messages
3. **Test Features**: Use browser dev tools to monitor game object creation
4. **Build Verification**: After `npm run build`, serve `dist/index.html` to test production build

### Deployment to GitHub Pages
1. Run `npm run build` to create production build
2. Copy contents of `dist/` folder to GitHub Pages source
3. Commit and push to trigger GitHub Pages deployment
4. Game will be available at `https://username.github.io/repository-name/`

### Current Status
✅ Phaser framework integrated and working  
✅ Basic project structure established  
✅ Test scenes implemented (Preload, Menu, Game)  
✅ Build system configured for GitHub Pages deployment  
🚧 Game mechanics in development  
🚧 Asset creation pending  
