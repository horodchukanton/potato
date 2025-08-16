# GitHub Copilot Instructions

This project is built with the **Phaser framework** and published on **GitHub Pages**.  
When assisting with code generation, GitHub Copilot should prioritize **clarity, modularity, and maintainability**.

## General Guidelines
- **Use ES6+ syntax** (classes, `import/export`, arrow functions).
- **Organize code into modules**:
    - `scenes/` → Game scenes (e.g., `PreloadScene.js`, `GameScene.js`, `UIScene.js`).
    - `objects/` → Reusable game objects or prefabs (e.g., `Player.js`, `Enemy.js`).
    - `utils/` → Helper functions (e.g., `math.js`, `input.js`).
    - `assets/` → Images, audio, spritesheets.
- Keep files small and focused on **a single responsibility**.
- Prefer **composition over inheritance** when possible.

## Phaser-Specific Best Practices
- **Scenes**:
    - Each scene should be a separate class extending `Phaser.Scene`.
    - Implement `preload()`, `create()`, `update()` where relevant.
    - Use descriptive scene keys, e.g. `"GameScene"`, `"MenuScene"`.
- **Game Objects**:
    - Wrap custom sprites and behaviors into classes in `objects/`.
    - Avoid putting game logic directly in `Scene` when it belongs to an object.
- **Assets**:
    - Load all assets in `PreloadScene`.
    - Use relative paths to `assets/` for compatibility with GitHub Pages.

## Code Style
- Use **camelCase** for variables and methods, **PascalCase** for classes.
- Add **JSDoc comments** for all classes, methods, and important functions.
- Use **constants** for magic numbers, asset keys, and configuration.
- Group related logic (e.g., input handling, collisions, UI updates) in dedicated functions.

## GitHub Pages Deployment
- Keep the built game in the `docs/` folder so it is served by GitHub Pages.
- Ensure asset paths are **relative** so the game runs correctly in production.
- Keep `index.html` clean and minimal, delegating logic to JS modules.

## Example Structure

project-root/
│── docs/ # GitHub Pages build
│ ├── index.html
│ └── main.js
│
│── src/
│ ├── scenes/
│ │ ├── PreloadScene.js
│ │ ├── GameScene.js
│ │ └── UIScene.js
│ ├── objects/
│ │ ├── Player.js
│ │ └── Enemy.js
│ ├── utils/
│ │ └── math.js
│ └── config.js
│
│── assets/
│ ├── images/
│ ├── audio/
│ └── sprites/


## Example Class
```js
// src/objects/Player.js
import Phaser from "phaser";

/**
 * Player character with movement and animations.
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
  }

  update(cursors) {
    if (cursors.left.isDown) {
      this.setVelocityX(-160);
      this.anims.play("left", true);
    } else if (cursors.right.isDown) {
      this.setVelocityX(160);
      this.anims.play("right", true);
    } else {
      this.setVelocityX(0);
      this.anims.play("turn");
    }

    if (cursors.up.isDown && this.body.touching.down) {
      this.setVelocityY(-330);
    }
  }
}
