# GitHub Copilot Instructions

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

This is a Phaser.js birthday game built for GitHub Pages deployment. The game runs in browsers with touch and keyboard controls.

## Bootstrap and Build Commands

Run these commands to set up the repository:

```bash
# Install dependencies 
npm install              # Takes 6-45 seconds. NEVER CANCEL - set timeout to 90+ seconds.

# For CI/automated environments (faster)
npm ci                   # Takes 6 seconds. NEVER CANCEL - set timeout to 30+ seconds.

# Build the game
npm run build            # Takes 16-25 seconds. NEVER CANCEL - set timeout to 60+ seconds.

# Verify build output exists
test -f dist/index.html  # Should pass if build succeeded
```

## Development Commands

```bash
# Start development server
npm start                # Starts webpack dev server on http://localhost:8080

# Build for production  
npm run build            # Creates optimized bundle in dist/ folder
```

## Build Timing and Expectations

- **npm install**: ~6-45 seconds (varies by cache) - NEVER CANCEL, set timeout to 90+ seconds
- **npm ci**: ~6 seconds - NEVER CANCEL, set timeout to 30+ seconds  
- **npm run build**: ~16-25 seconds - NEVER CANCEL, set timeout to 60+ seconds
- **npm start**: Starts immediately, runs until stopped

## Validation Requirements

**ALWAYS run these validation steps after making changes:**

### 1. Test Suite Validation (PRIMARY)
```bash
npm test                   # Runs Jest test suite - should complete in ~1-2 seconds
```
**The test suite is the PRIMARY validation method** with 90+ comprehensive test cases covering:
- Game configuration validation
- GameStateManager localStorage operations
- Game mechanics and physics calculations
- Progress tracking and state management
- Game balance and collision detection logic
- Edge cases and data type validation

**Use the test suite for ALL game logic validation instead of manual testing or Playwright screenshots.**

### 2. Build Validation
```bash
npm run build
test -f dist/index.html && echo "Build successful" || echo "Build failed"
```

### 3. Final Manual Functional Testing (ONLY for final verification)
**Use this ONLY for final verification after test suite passes:**

1. Start the development server: `npm start`
2. Open browser to http://localhost:8080
3. Verify the game loads with "POTATO Birthday Game" title
4. Verify "Start Game" button appears
5. Test keyboard controls (arrow keys for movement, space for jump)
6. Test touch controls on mobile/tablet simulation
7. Verify game responds to input correctly

**The test suite (npm test) should be your primary validation tool. Only use Playwright or manual testing for final UI verification.**

## Project Structure

```
potato/
├── src/
│   ├── scenes/          # Phaser game scenes
│   │   ├── PreloadScene.js  # Asset loading
│   │   ├── MenuScene.js     # Main menu
│   │   └── GameScene.js     # Gameplay
│   ├── utils/           # Utility modules
│   │   └── GameStateManager.js # localStorage game state management
│   ├── config.js        # Game configuration constants
│   ├── main.js          # Game initialization
│   └── index.html       # HTML template
├── tests/               # Jest test suite (PRIMARY validation)
│   ├── config.test.js           # Configuration validation tests
│   ├── GameStateManager.test.js # State management integration tests  
│   ├── game-mechanics.test.js   # Game mechanics validation tests
│   └── game-utilities.test.js   # Utility and edge case tests
├── dist/                # Build output (created by npm run build)
├── webpack.config.js    # Build configuration
├── jest.config.js       # Test configuration
├── babel.config.json    # Babel configuration for tests
└── package.json         # Dependencies and scripts
```

## Development Workflow

1. **ALWAYS run bootstrap commands first**:
   ```bash
   npm install
   npm run build
   npm test              # Verify test suite passes
   ```

2. **Start development environment**:
   ```bash
   npm start  # Development server with hot reload
   ```

3. **After making changes**:
   ```bash
   npm test              # ALWAYS run test suite first
   npm run build         # Verify build still works
   # Only run manual testing for final verification if needed
   ```

## Technologies and Dependencies

- **Node.js**: Version 20.19.4 or higher required
- **npm**: Version 10.8.2 or higher
- **Phaser**: 3.90.0 (game framework)
- **Webpack**: 5.101.2 (bundling and dev server)
- **Jest**: 29.x (testing framework with 90+ test cases)
- **Babel**: 7.x (ES6+ transpilation for tests)

## Testing Framework

The project includes a comprehensive Jest test suite with 90+ test cases covering:

**Test Categories:**
- **Configuration Tests**: Validate all game configuration values
- **GameStateManager Tests**: Test localStorage operations and state persistence
- **Game Mechanics Tests**: Validate physics, collision detection, and game balance
- **Utilities Tests**: Test edge cases, data types, and boundary conditions

**Test Commands:**
```bash
npm test                 # Run all tests (fast, ~1-2 seconds)
npm test -- --verbose    # Run with detailed output
npm test -- --coverage  # Run with coverage report
```

**When to Use Tests vs Manual Testing:**
- **Use npm test**: For ALL game logic, state management, and configuration validation
- **Use manual testing**: ONLY for final UI verification and user experience validation
- **Avoid Playwright**: Tests replace the need for screenshot-based testing

## Deployment

The project uses GitHub Pages deployment:
- Build output goes to `dist/` folder
- GitHub Actions automatically deploys from `dist/` on push to main branch
- Game available at: https://horodchukanton.github.io/potato/

## Known Issues and Limitations

- **No test suite**: `npm test` fails - testing is done manually
- **No assets directory**: Game uses placeholder colored rectangles
- **Bundle size warnings**: Expected due to Phaser framework (~1.15MB bundle)
- **No linting configured**: No ESLint or similar tools set up

## Troubleshooting

**Port 8080 already in use:**
```bash
npx kill-port 8080
# Or use different port
npm start -- --port 3000
```

**Build warnings about bundle size:**
- This is expected for Phaser games
- Bundle includes entire Phaser framework (~1.15MB)
- Warnings don't affect functionality

**Development server not accessible:**
- Use http://localhost:8080 (not 127.0.0.1)
- Check firewall settings
- Try restarting the development server

## Coding Guidelines

- **Use ES6+ syntax** (classes, import/export, arrow functions)
- **Follow existing patterns** in scenes/ directory
- **Use constants** from config.js for game settings
- **Add JSDoc comments** for all classes and methods
- **Test touch and keyboard controls** for any input changes
