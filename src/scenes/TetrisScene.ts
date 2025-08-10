import Phaser from 'phaser';
import type { TetrominoType } from './RunnerScene';

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

type Cell = 0 | 1; // mask 0 empty, 1 allowed

// Balloon mask (10x20), centered. Total filled cells = 160 (40 tetrominoes * 4 blocks)
const BALLOON_MASK: Cell[][] = (() => {
  const rows = [4,6,8,9,10,10,10,10,10,10,10,10,10,10,9,8,6,4,3,3];
  const grid: Cell[][] = [];
  for (let r=0; r<20; r++) {
    const count = rows[r];
    const left = Math.floor((10 - count)/2);
    const row: Cell[] = Array(10).fill(0);
    for (let c=0; c<count; c++) row[left + c] = 1;
    grid.push(row);
  }
  return grid;
})();

function clone2D<T>(arr: T[][]): T[][] { return arr.map(r => r.slice()); }

// Tetromino rotation states relative coords
const SHAPES: Record<TetrominoType, number[][][]> = {
  I: [ [[-2,0],[-1,0],[0,0],[1,0]], [[0,-1],[0,0],[0,1],[0,2]], [[-2,1],[-1,1],[0,1],[1,1]], [[-1,-1],[-1,0],[-1,1],[-1,2]] ],
  O: [ [[0,0],[1,0],[0,1],[1,1]] , [[0,0],[1,0],[0,1],[1,1]], [[0,0],[1,0],[0,1],[1,1]], [[0,0],[1,0],[0,1],[1,1]] ],
  T: [ [[-1,0],[0,0],[1,0],[0,1]], [[0,-1],[0,0],[1,0],[0,1]], [[0,-1],[-1,0],[0,0],[1,0]], [[0,-1],[-1,0],[0,0],[0,1]] ],
  S: [ [[0,0],[1,0],[-1,1],[0,1]], [[0,-1],[0,0],[1,0],[1,1]], [[0,0],[1,0],[-1,1],[0,1]], [[0,-1],[0,0],[1,0],[1,1]] ],
  Z: [ [[-1,0],[0,0],[0,1],[1,1]], [[1,-1],[0,0],[1,0],[0,1]], [[-1,0],[0,0],[0,1],[1,1]], [[1,-1],[0,0],[1,0],[0,1]] ],
  J: [ [[-1,0],[-1,1],[0,0],[1,0]], [[0,-1],[0,0],[0,1],[1,1]], [[-1,0],[0,0],[1,0],[1,-1]], [[-1,-1],[0,-1],[0,0],[0,1]] ],
  L: [ [[-1,0],[0,0],[1,0],[1,1]], [[0,-1],[0,0],[0,1],[-1,1]], [[-1,-1],[-1,0],[0,0],[1,0]], [[1,-1],[0,-1],[0,0],[0,1]] ],
};

interface StartData { pieces: TetrominoType[] }

export default class TetrisScene extends Phaser.Scene {
  private gridW = 10; private gridH = 20; private tile = 24;
  private board: (null | TetrominoType)[][] = Array.from({ length: 20 }, () => Array(10).fill(null));
  private mask: Cell[][] = clone2D(BALLOON_MASK);
  private originX = 0; private originY = 0;
  private current?: { type: TetrominoType; rot: number; x: number; y: number };
  private queue: TetrominoType[] = [];
  private gfx!: Phaser.GameObjects.Graphics;
  private uiText!: Phaser.GameObjects.Text;
  private placed = 0;

  constructor() { super('TetrisScene'); }

  init(data: StartData) {
    // Use collected pieces as the queue; if fewer/more than needed, slice/pad (we expect exactly 40)
    this.queue = data.pieces.slice(0, 40);
    if (this.queue.length < 40) {
      // pad with random types (failsafe)
      while (this.queue.length < 40) this.queue.push(Phaser.Utils.Array.GetRandom(TYPES));
    }
  }

  create() {
    const W = this.scale.gameSize.width; const H = this.scale.gameSize.height;
    this.cameras.main.setBackgroundColor('#0f1323');

    // Compute origin to center grid
    const totalW = this.gridW * this.tile; const totalH = this.gridH * this.tile;
    this.originX = (W - totalW) / 2; this.originY = (H - totalH) / 2;

    this.gfx = this.add.graphics();

    // Controls
    const k = this.input.keyboard;
    k.on('keydown-LEFT', () => this._tryMove(-1, 0));
    k.on('keydown-RIGHT', () => this._tryMove(1, 0));
    k.on('keydown-DOWN', () => this._tryMove(0, 1));
    k.on('keydown-UP', () => this._rotate());
    k.on('keydown-X', () => this._rotate());
    k.on('keydown-SPACE', () => this._hardDrop());

    // UI
    this.uiText = this.add.text(12, 10, 'Fill the balloon mask', { fontFamily: 'monospace', fontSize: '18px', color: '#ffffff' });

    this._spawn();

    // Drop timer
    this.time.addEvent({ delay: 700, loop: true, callback: () => this._stepDown() });
  }

  update() {
    this._render();
  }

  private _spawn() {
    const type = this.queue.shift() ?? Phaser.Utils.Array.GetRandom(TYPES);
    this.current = { type, rot: 0, x: Math.floor(this.gridW/2), y: 0 };
    if (!this._isValid(this.current)) {
      this._gameOver(false);
    }
    this._updateStatus();
  }

  private _hardDrop() {
    if (!this.current) return;
    while (this._canMove(0,1)) this.current.y += 1;
    this._lock();
  }

  private _stepDown() {
    if (!this.current) return;
    if (this._canMove(0,1)) this.current.y += 1; else this._lock();
  }

  private _tryMove(dx: number, dy: number) {
    if (!this.current) return;
    if (this._canMove(dx, dy)) { this.current.x += dx; this.current.y += dy; }
  }

  private _rotate() {
    if (!this.current) return;
    const test = { ...this.current, rot: (this.current.rot + 1) % 4 };
    if (this._isValid(test)) this.current.rot = test.rot;
  }

  private _lock() {
    if (!this.current) return;
    const cells = this._cells(this.current);
    // Place blocks
    for (const [x,y] of cells) this.board[y][x] = this.current.type;
    this.placed += 1;
    // Win check
    if (this._isMaskFilled()) { this._gameOver(true); return; }
    // Next piece
    this._spawn();
  }

  private _isMaskFilled(): boolean {
    for (let y=0; y<this.gridH; y++) {
      for (let x=0; x<this.gridW; x++) {
        if (this.mask[y][x] === 1 && this.board[y][x] === null) return false;
      }
    }
    return true;
  }

  private _canMove(dx: number, dy: number): boolean {
    if (!this.current) return false;
    const next = { ...this.current, x: this.current.x + dx, y: this.current.y + dy };
    return this._isValid(next);
  }

  private _isValid(state: { type: TetrominoType; rot: number; x: number; y: number }): boolean {
    const cells = this._cells(state);
    for (const [x,y] of cells) {
      if (x < 0 || x >= this.gridW || y < 0 || y >= this.gridH) return false;
      if (this.mask[y][x] !== 1) return false; // only inside balloon mask
      if (this.board[y][x] !== null) return false;
    }
    return true;
  }

  private _cells(state: { type: TetrominoType; rot: number; x: number; y: number }): [number,number][] {
    const coords = SHAPES[state.type][state.rot];
    return coords.map(([dx,dy]) => [state.x + dx, state.y + dy]) as [number,number][];
  }

  private _render() {
    const g = this.gfx; g.clear();
    // Draw mask
    g.fillStyle(0x15213b, 1);
    g.lineStyle(1, 0x33507c, 0.5);
    for (let y=0; y<this.gridH; y++) {
      for (let x=0; x<this.gridW; x++) {
        const px = this.originX + x*this.tile; const py = this.originY + y*this.tile;
        if (this.mask[y][x] === 1) g.fillRect(px, py, this.tile, this.tile);
        g.strokeRect(px, py, this.tile, this.tile);
      }
    }
    // Draw placed blocks
    for (let y=0; y<this.gridH; y++) {
      for (let x=0; x<this.gridW; x++) {
        const t = this.board[y][x];
        if (t) this._drawBlock(x, y, COLORS[t]);
      }
    }
    // Draw current
    if (this.current) {
      for (const [x,y] of this._cells(this.current)) this._drawBlock(x, y, COLORS[this.current.type]);
    }
  }

  private _drawBlock(x: number, y: number, color: number) {
    const g = this.gfx; const s = this.tile; const px = this.originX + x*s; const py = this.originY + y*s;
    g.fillStyle(color, 1); g.fillRect(px+1, py+1, s-2, s-2);
    g.lineStyle(2, 0x0b1020, 0.9); g.strokeRect(px+1, py+1, s-2, s-2);
  }

  private _updateStatus() {
    const left = 40 - this.placed;
    this.uiText.setText(`Fill the balloon mask • Pieces left: ${left}`);
  }

  private _gameOver(won: boolean) {
    this.input.keyboard.removeAllListeners();
    const W = this.scale.gameSize.width; const H = this.scale.gameSize.height;
    const dim = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.5).setDepth(10);
    const msg = won ? 'Balloon Completed! 🎈' : 'No space to spawn...';
    const t = this.add.text(W/2, H/2, msg + '\nClick/Tap to restart', { fontFamily: 'monospace', fontSize: '26px', color: '#ffffff', align: 'center' }).setOrigin(0.5).setDepth(11);
    this.input.once('pointerdown', () => this.scene.start('RunnerScene'));
  }
}