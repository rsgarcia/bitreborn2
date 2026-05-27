import Phaser from 'phaser';

const CONTEXT_IMAGE_URL = new URL('../assets/images/contexto.png', import.meta.url).href;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.image('contexto', CONTEXT_IMAGE_URL);
  }

  create() {
    this.scene.start('GameScene');
  }
}
