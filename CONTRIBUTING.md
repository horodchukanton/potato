# Contributing to Potato - Birthday Game

Thank you for your interest in contributing to Potato! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm
- Git

### Setting Up Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/potato.git
   cd potato
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open http://localhost:8080 to view the game

## Development Workflow

### Before Making Changes
1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make sure all tests pass:
   ```bash
   npm test
   ```

### Making Changes
1. Edit files in the `src/` directory
2. Follow the existing code style and patterns
3. Test your changes in the browser at http://localhost:8080
4. Add or update tests for new functionality
5. Ensure all tests still pass:
   ```bash
   npm test
   ```

### Testing
The project includes a comprehensive Jest test suite with 300+ tests. Always run tests before submitting:

```bash
npm test              # Run all tests
npm run test:verbose  # Detailed output
npm run test:coverage # Coverage report
```

Tests cover:
- Game configuration validation
- Game state management (localStorage operations)
- Game mechanics and physics calculations
- Scene functionality and UI components
- Mobile responsiveness and touch controls

### Building
Before submitting, ensure the project builds successfully:
```bash
npm run build
```

## Code Style and Standards

### JavaScript
- Use ES6+ syntax (classes, import/export, arrow functions)
- Follow existing patterns in the `src/scenes/` directory
- Use constants from `config.js` for game settings
- Add JSDoc comments for all classes and methods

### File Organization
- **Scenes**: Place in `src/scenes/` directory
- **Utilities**: Place in `src/utils/` directory
- **Effects**: Place in `src/effects/` directory
- **Tests**: Mirror the `src/` structure in `tests/` directory

### Naming Conventions
- Use PascalCase for class names: `GameScene`, `MenuScene`
- Use camelCase for functions and variables: `createPlayer`, `bubblesCollected`
- Use UPPER_CASE for constants: `GAME_CONFIG`, `SCENE_KEYS`

## Submitting Changes

### Pull Request Process
1. Ensure all tests pass and the project builds successfully
2. Update documentation if you've changed APIs or added features
3. Add tests for new functionality
4. Commit your changes with clear, descriptive messages
5. Push to your fork and submit a pull request

### Pull Request Guidelines
- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Testing**: Describe how you tested your changes
- **Screenshots**: Include screenshots for UI changes

### Commit Message Format
Use clear, descriptive commit messages:
```
feat: add new bubble collection effect
fix: resolve player collision detection issue
docs: update README installation instructions
test: add tests for GameStateManager
```

## Types of Contributions

### Bug Reports
When reporting bugs, please include:
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser and OS information
- Console error messages (if any)

### Feature Requests
For new features:
- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider the impact on existing functionality

### Code Contributions
We welcome:
- Bug fixes
- New game features and effects
- Performance improvements
- Test improvements
- Documentation updates



## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Check existing issues and discussions
- Review the project documentation

Thank you for contributing to Potato - Birthday Game! 🎉