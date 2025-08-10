/* Balloon Catcher - Phaser 3 (no assets, shapes only) */

class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0;
    this.lives = 3;
    this.speed = 180; // paddle speed
    this.spawnDelay = 950; // ms between balloons
  }

  preload() {
    // No external assets. We'll generate textures with Graphics.
  }

  create() {
    const W = 480;
    const H = 720;

    // Background color
    this.cameras.main.setBackgroundColor('#1c1f2b');

    // Generate simple textures
    this._makePaddleTexture();
    this._makeBalloonTextures();

    // Physics groups
    this.balloons = this.physics.add.group({
      allowGravity: false,
      immovable: false,
    });

    // Paddle
    this.paddle = this.physics.add.image(W / 2, H - 40, 'paddle');
    this.paddle.setImmovable(true);
    this.paddle.setCollideWorldBounds(true);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('A,D');
    this.input.on('pointermove', (p) => {
      this.paddle.x = Phaser.Math.Clamp(p.x, 40, W - 40);
    });
    this.input.on('pointerdown', (p) => {
      this.paddle.x = Phaser.Math.Clamp(p.x, 40, W - 40);
    });

    // UI
    this.scoreText = this.add.text(12, 10, 'Score: 0', { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff' }).setDepth(10);
    this.livesText = this.add.text(W - 12, 10, 'Lives: 3', { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff' }).setOrigin(1, 0).setDepth(10);

    // Collisions
    this.physics.add.overlap(this.paddle, this.balloons, this._catchBalloon, undefined, this);

    // Spawner
    this.spawnTimer = this.time.addEvent({ delay: this.spawnDelay, loop: true, callback: this._spawnBalloon, callbackScope: this });

    // Game over overlay (hidden)
    this._buildOverlay();
  }

  update(time, delta) {
    // Keyboard movement
    let vx = 0;
    if (this.cursors.left?.isDown || this.keys.A.isDown) vx = -this.speed;
    else if (this.cursors.right?.isDown || this.keys.D.isDown) vx = this.speed;
    this.paddle.setVelocityX(vx);

    // Clean up missed balloons
    const H = this.scale.gameSize.height;
    this.balloons.children.each((b) => {
      if (b.active && b.y > H + 40) {
        b.destroy();
        this._loseLife();
      }
    });
  }

  _buildOverlay() {
    const W = this.scale.gameSize.width;
    const H = this.scale.gameSize.height;

    const overlay = this.add.container(0, 0).setDepth(20);

    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45);
    const panel = this.add.rectangle(W / 2, H / 2, W * 0.8, H * 0.4, 0x111222, 0.95).setStrokeStyle(2, 0x87b5ff, 0.8);
    const title = this.add.text(W / 2, H / 2 - 60, 'Game Over', { fontFamily: 'system-ui, monospace', fontSize: '42px', color: '#ffffff' }).setOrigin(0.5);
    const score = this.add.text(W / 2, H / 2 - 12, 'Score: 0', { fontFamily: 'monospace', fontSize: '24px', color: '#a7c4ff' }).setOrigin(0.5);
    const hint = this.add.text(W / 2, H / 2 + 42, 'Tap / Click to Restart', { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

    overlay.add([dim, panel, title, score, hint]);
    overlay.setVisible(false);

    overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, W, H), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => this._restart());

    this.overlay = { container: overlay, title, score };
  }

  _restart() {
    this.score = 0;
    this.lives = 3;
    this.scoreText.setText('Score: 0');
    this.livesText.setText('Lives: 3');
    this.overlay.container.setVisible(false);

    // Clear leftovers
    this.balloons.clear(true, true);

    // Resume
    this.physics.resume();
    this.spawnTimer.paused = false;
  }

  _gameOver() {
    this.physics.pause();
    this.spawnTimer.paused = true;
    this.overlay.score.setText(`Score: ${this.score}`);
    this.overlay.container.setVisible(true);
  }

  _loseLife() {
    this.lives -= 1;
    this.livesText.setText(`Lives: ${this.lives}`);
    if (this.lives <= 0) {
      this._gameOver();
    }
  }

  _catchBalloon(_paddle, balloon) {
    if (!balloon.active) return;
    // Pop effect: quick scale + fade
    this.tweens.add({ targets: balloon, scale: 1.3, alpha: 0.2, duration: 120, onComplete: () => balloon.destroy() });
    this.score += 1;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  _spawnBalloon() {
    const W = this.scale.gameSize.width;
    const x = Phaser.Math.Between(40, W - 40);
    const colors = ['balloon-red', 'balloon-blue', 'balloon-green', 'balloon-yellow'];
    const key = Phaser.Utils.Array.GetRandom(colors);
    const b = this.balloons.create(x, -40, key);
    b.setCircle(20, 10, 6); // rough circle body
    b.setVelocityY(Phaser.Math.Between(120, 220));
    b.setAngularVelocity(Phaser.Math.Between(-30, 30));
    b.setDepth(1);
    b.setScale(Phaser.Math.FloatBetween(0.9, 1.15));
  }

  _makePaddleTexture() {
    const w = 120, h = 20, r = 8;
    const g = this.add.graphics();
    g.fillStyle(0x2b3a67, 1);
    g.fillRoundedRect(0, 0, w, h, r);
    g.lineStyle(2, 0x87b5ff, 1);
    g.strokeRoundedRect(0, 0, w, h, r);
    g.generateTexture('paddle', w, h);
    g.destroy();
  }

  _makeBalloonTextures() {
    const defs = [
      { key: 'balloon-red', color: 0xff4d6d },
      { key: 'balloon-blue', color: 0x4dabf7 },
      { key: 'balloon-green', color: 0x51cf66 },
      { key: 'balloon-yellow', color: 0xffd43b },
    ];
    defs.forEach(({ key, color }) => this._makeBalloonTexture(key, color));
  }

  _makeBalloonTexture(key, color) {
    const g = this.add.graphics();
    const radius = 22;
    // Balloon body
    g.fillStyle(color, 1);
    g.fillCircle(radius + 6, radius + 6, radius);
    // Gloss
    g.fillStyle(0xffffff, 0.25);
    g.fillEllipse(radius - 4, radius - 2, 12, 8);
    // Knot
    g.fillStyle(color, 1);
    g.fillTriangle(radius + 4, radius * 2 + 6, radius + 10, radius * 2 + 6, radius + 7, radius * 2 + 12);
    // String
    g.lineStyle(2, 0xffffff, 0.6);
    g.beginPath();
    g.moveTo(radius + 7, radius * 2 + 12);
    g.lineTo(radius + 7, radius * 2 + 28);
    g.strokePath();

    const texW = radius * 2 + 16;
    const texH = radius * 2 + 40;
    g.generateTexture(key, texW, texH);
    g.destroy();
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 480,
  height: 720,
  backgroundColor: '#1c1f2b',
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MainScene],
};

new Phaser.Game(config);