import Phaser from 'phaser';
import RunnerScene from './scenes/RunnerScene';
import TetrisScene from './scenes/TetrisScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 480,
  height: 720,
  backgroundColor: '#1c1f2b',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 900 }, debug: false }
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [RunnerScene, TetrisScene]
};

new Phaser.Game(config);