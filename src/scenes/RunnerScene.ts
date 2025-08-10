import Phaser from 'phaser';

export type TetrominoType = 'I'|'O'|'T'|'S'|'Z'|'J'|'L';
const TYPES: TetrominoType[] = ['I','O','T','S','Z','J','L'];
const COLORS: Record<TetrominoType, number> = {
  I: 0x4ec5f1,
  O: 0xf5d94e,
  T: 0xb36dfb,
  S: 0x69db7c,
  Z: 0xff6b6b,
  J: 0x74c0fc,
  L: 0xf59f00,
};

export default class RunnerScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private collected: TetrominoType[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;
  private uiText!: Phaser.GameObjects.Text;
  private bgScroll = 0;
  private groundTile!: Phaser.GameObjects.TileSprite;

  constructor() { super('RunnerScene'); }

  preload() {}

  create() {
    const W = this.scale.gameSize.width; const H = this.scale.gameSize.height;

    // Background gradient bands
    this.add.rectangle(W/2, H/2, W, H, 0x111827).setDepth(-10);
    this.groundTile = this.add.tileSprite(W/2, H-40, W, 40, this._makeGroundTexture()).setDepth(-5);

    // Ground physics body for collisions
    this.ground = this.physics.add.staticGroup();
    const groundBody = this.add.rectangle(W/2, H-20, W, 40, 0x000000, 0);
    this.physics.add.existing(groundBody, true);
    this.ground.add(groundBody as any);

    // Player texture & physics sprite
    const playerKey = this._makePlayerTexture();
    this.player = this.physics.add.image(W*0.25, H-70, playerKey);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDragX(900);

    this.physics.add.collider(this.player, this.ground);

    // Controls
    const cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', () => this._jump());
    this.input.keyboard.on('keydown-UP', () => this._jump());
    this.input.on('pointerdown', () => this._jump());

    this.events.on('update', () => {
      // L/R movement optional
      const v = 220;
      if (cursors.left?.isDown) this.player.setVelocityX(-v);
      else if (cursors.right?.isDown) this.player.setVelocityX(v);
      // Scroll ground tiles to simulate running
      this.bgScroll += 2.5;
      this.groundTile.tilePositionX = this.bgScroll;
    });

    // UI
    this.uiText = this.add.text(12, 10, 'Pieces: 0/40', { fontFamily: 'monospace', fontSize: '20px', color: '#ffffff' });

    // Spawn falling tetrominoes
    this.spawnTimer = this.time.addEvent({ delay: 900, loop: true, callback: this._spawnPiece, callbackScope: this });
  }

  private _jump() {
    // Can jump if touching down
    if (this.player.body.blocked.down || (this.player.body as any).touching?.down) {
      this.player.setVelocityY(-460);
    }
  }

  private _spawnPiece() {
    const W = this.scale.gameSize.width; const H = this.scale.gameSize.height;
    const type = Phaser.Utils.Array.GetRandom(TYPES);
    const key = this._makeTetrominoTexture(type);
    const x = Phaser.Math.Between(40, W-40);
    const piece = this.physics.add.image(x, -30, key);
    piece.setData('type', type);
    piece.setVelocityY(Phaser.Math.Between(140, 220));
    piece.setAngularVelocity(Phaser.Math.Between(-50, 50));
    piece.setDepth(1);

    // Overlap -> collect
    this.physics.add.overlap(this.player, piece, (_p, p) => {
      if (!p.active) return;
      this.collected.push(p.getData('type'));
      p.destroy();
      this.uiText.setText(`Pieces: ${this.collected.length}/40`);
      if (this.collected.length >= 40) this._toTetris();
    });

    // Cleanup if missed
    this.time.addEvent({ delay: 10000, callback: () => { if (piece.active && piece.y > H + 40) piece.destroy(); }, loop: false });
  }

  private _toTetris() {
    this.spawnTimer && (this.spawnTimer.paused = true);
    this.physics.pause();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('TetrisScene', { pieces: this.collected });
    });
  }

  private _makePlayerTexture() {
    const g = this.add.graphics();
    // Body
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(0, 0, 24, 32, 6);
    // Head
    g.fillStyle(0x87b5ff, 1);
    g.fillCircle(12, 8, 8);
    // Outline
    g.lineStyle(2, 0x2b3a67, 1);
    g.strokeRoundedRect(0, 0, 24, 32, 6);
    g.generateTexture('player-tex', 28, 40);
    g.destroy();
    return 'player-tex';
  }

  private _makeGroundTexture() {
    const key = 'ground-tex';
    if (this.textures.exists(key)) return key;
    const g = this.add.graphics();
    const w = 64, h = 40;
    g.fillStyle(0x22314d, 1); g.fillRect(0, 0, w, h);
    g.fillStyle(0x2b3a67, 1);
    for (let x=0; x<w; x+=16) g.fillRect(x+2, h-16, 12, 8);
    g.generateTexture(key, w, h);
    g.destroy();
    return key;
  }

  private _makeTetrominoTexture(type: TetrominoType) {
    const key = `tet-${type}`;
    if (this.textures.exists(key)) return key;
    const g = this.add.graphics();
    const color = COLORS[type];
    const s = 12; // block size
    const shape: Record<TetrominoType, number[][]> = {
      I: [[0,1],[1,1],[2,1],[3,1]],
      O: [[1,0],[2,0],[1,1],[2,1]],
      T: [[1,0],[0,1],[1,1],[2,1]],
      S: [[1,0],[2,0],[0,1],[1,1]],
      Z: [[0,0],[1,0],[1,1],[2,1]],
      J: [[0,0],[0,1],[1,1],[2,1]],
      L: [[2,0],[0,1],[1,1],[2,1]],
    };
    const coords = shape[type];
    const w = 4*s, h = 3*s;
    g.fillStyle(color, 1);
    g.lineStyle(2, 0x0b1020, 0.9);
    for (const [cx, cy] of coords) {
      g.fillRect(cx*s, cy*s, s, s);
      g.strokeRect(cx*s+1, cy*s+1, s-2, s-2);
    }
    g.generateTexture(key, w, h);
    g.destroy();
    return key;
  }
}