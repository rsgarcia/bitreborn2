import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.js';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { IntroScene } from '../scenes/IntroScene.js';
import { LevelOneScene } from '../scenes/LevelOneScene.js';
import { LevelTwoScene } from '../scenes/LevelTwoScene.js';
import { LevelThreeScene } from '../scenes/LevelThreeScene.js';
import { LevelFourScene } from '../scenes/LevelFourScene.js';
import { TerminalScene } from '../scenes/TerminalScene.js';
import { ChallengeScene } from '../scenes/ChallengeScene.js';
import { FeedbackScene } from '../scenes/FeedbackScene.js';

export const gameConfig = {
  type: Phaser.CANVAS,
  parent: 'game',
  width: 960,
  height: 600,
  backgroundColor: '#050814',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    BootScene,
    PreloadScene,
    GameScene,
    IntroScene,
    LevelOneScene,
    LevelTwoScene,
    LevelThreeScene,
    LevelFourScene,
    TerminalScene,
    ChallengeScene,
    FeedbackScene
  ]
};
