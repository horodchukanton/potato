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
| `npm test` | Run Jest test suite | Test results in terminal |
| `npm run test:verbose` | Run tests with detailed output | - |
| `npm run test:coverage` | Run tests with coverage report | - |

### Development Workflow
1. **Start development**: `npm start`
2. **Open browser**: Navigate to http://localhost:8080
3. **Make changes**: Edit files in `src/` - changes auto-reload
4. **Run tests**: `npm test` to validate changes
5. **Build for production**: `npm run build` when ready to deploy

### Testing
The project includes a comprehensive Jest test suite with 300+ tests covering:
- Game configuration validation
- Game state management (localStorage operations)
- Game mechanics and physics calculations
- Scene functionality and UI components
- Mobile responsiveness and touch controls

Run tests with:
```bash
npm test              # Run all tests
npm run test:verbose  # Detailed output
npm run test:coverage # Coverage report
```

### Deployment
The game is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the master branch.

**Live Game**: https://horodchukanton.github.io/potato/

**Manual Deployment**:
1. Run `npm run build` to create production build
2. The `dist/` folder contains the deployable files
3. GitHub Actions will automatically deploy on push to master

### For Automated Agents/CI
```bash
# Complete setup and verification
npm ci                    # Clean install (faster for CI)
npm run build            # Verify build works
test -f dist/index.html  # Verify build output exists
npm test                 # Run test suite
```

### Project Structure
```
potato/
├── src/
│   ├── scenes/          # Phaser game scenes
│   │   ├── PreloadScene.js
│   │   ├── MenuScene.js
│   │   ├── GameScene.js
│   │   └── TetrisScene.js
│   ├── utils/           # Utility modules
│   │   ├── GameStateManager.js
│   │   └── DynamicEffectsManager.js
│   ├── effects/         # Game effect classes
│   ├── config.js        # Game configuration
│   ├── main.js          # Game initialization
│   └── index.html       # HTML template
├── tests/               # Jest test suite
├── dist/                # Built game (created by npm run build)
├── .github/             # GitHub configuration
│   └── workflows/       # CI/CD workflows
└── webpack.config.js    # Build configuration
```

### Current Status
✅ Phaser framework integrated and working  
✅ Basic project structure established  
✅ Game scenes implemented (Preload, Menu, Game, Tetris)  
✅ Build system configured for GitHub Pages deployment  
✅ Comprehensive test suite with 300+ tests  
✅ Game mechanics and state management implemented  
✅ Touch and keyboard controls working  

## Contributing
We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Setting up the development environment
- Running tests and ensuring code quality
- Submitting pull requests
- Coding standards and conventions

## License
This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Community Guidelines
Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing to ensure a welcoming environment for all contributors.

## Security
If you discover a security vulnerability, please see our [Security Policy](SECURITY.md) for information on how to report it responsibly.

### Troubleshooting

#### Common Issues
- **Port already in use**: If port 8080 is busy, webpack will use the next available port
- **Module not found**: Run `npm install` to ensure all dependencies are installed
- **Build fails**: Check Node.js version (requires 16+)
- **Game doesn't load**: Check browser console for JavaScript errors

#### Development Tips
1. **Quick Start**: `npm install && npm start`
2. **Run Tests**: `npm test` to validate game logic
3. **Test Features**: Use browser dev tools to monitor game object creation
4. **Build Verification**: After `npm run build`, verify `dist/index.html` exists

#### Common Solutions

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
