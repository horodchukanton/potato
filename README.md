# Potato - Birthday Game

## Quick Start

**For immediate development:**
```bash
npm install          # Install dependencies
npm start           # Start development server (http://localhost:8080)
```

**For building/deployment:**
```bash
npm run build       # Create production build in dist/
```

## Overview
Build a small 2-phase birthday game for a friend using Phaser. Publish on GitHub Pages. Use LocalStorage to save progress.

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
1. Clone the repository:
   ```bash
   git clone https://github.com/horodchukanton/potato.git
   cd potato
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands

| Command | Description | URL |
|---------|-------------|-----|
| `npm start` | Start development server with hot reload | http://localhost:8080 |
| `npm run build` | Create production build | Creates `dist/` folder |

### Development Workflow
1. **Start development**: `npm start`
2. **Open browser**: Navigate to http://localhost:8080
3. **Make changes**: Edit files in `src/` - changes auto-reload
4. **Build for production**: `npm run build` when ready to deploy

### Deployment to GitHub Pages
1. Build the project: `npm run build`
2. The `dist/` folder contains the deployable files
3. Deploy `dist/` contents to GitHub Pages
4. Game will be available at: `https://horodchukanton.github.io/potato/`

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


**Port 8080 already in use:**
```bash
# Kill process using port 8080
npx kill-port 8080
# Or use different port
npm start -- --port 3000
```

**Build warnings about bundle size:**
- This is expected for Phaser games
- Bundle includes entire Phaser framework (~1.15MB)
- Warnings don't affect functionality

**Development server not accessible:**
- Ensure you're using http://localhost:8080 (not 127.0.0.1)
- Check firewall settings
- Try restarting the development server

### For Automated Agents/CI
```bash
# Complete setup and verification
npm ci                    # Clean install (faster for CI)
npm run build            # Verify build works
test -f dist/index.html  # Verify build output exists
```
