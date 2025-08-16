## Overview
Build a small 2-phase birthday game for a friend using Phaser. Publish on GitHub Pages. Use LocalStorage to save progress.

## Phases
1. **Running & Collecting**
    - Player runs on a horizontal plane (infinite runner style).
    - Obstacles appear, player must avoid them.
    - Player collects bubbles.
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
- **Development mode**: `npm start`
  - Starts a development server at http://localhost:8080
  - Includes hot reload for development
- **Build for production**: `npm run build`
  - Creates optimized build in `dist/` folder
  - Ready for deployment to GitHub Pages

### Project Structure
```
potato/
├── src/
│   ├── scenes/          # Phaser game scenes
│   │   ├── PreloadScene.js
│   │   ├── MenuScene.js
│   │   └── GameScene.js
│   ├── objects/         # Game objects and prefabs
│   ├── utils/           # Helper functions
│   ├── config.js        # Game configuration
│   ├── main.js          # Game initialization
│   └── index.html       # HTML template
├── assets/              # Game assets (images, audio, sprites)
├── dist/                # Built game (created by npm run build)
└── webpack.config.js    # Build configuration
```

### Current Status
✅ Phaser framework integrated and working  
✅ Basic project structure established  
✅ Test scenes implemented (Preload, Menu, Game)  
✅ Build system configured for GitHub Pages deployment  
🚧 Game mechanics in development  
🚧 Asset creation pending  
