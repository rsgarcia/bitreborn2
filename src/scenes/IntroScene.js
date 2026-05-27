import Phaser from 'phaser';
import { FONT } from '../config/theme.js';
import { INTRO_LINES } from '../levels/levelOne.js';
import { CyberBackground } from '../systems/CyberBackground.js';

const INTRO_IMAGE_KEY = 'contexto';
const INTRO_IMAGE_CROPPED_KEY = 'contexto-cropped';
const INTRO_IMAGE_MARGIN = 16;
const INTRO_IMAGE_TEXT_GAP = 10;
const INTRO_IMAGE_CROP_TOP = 58;
const INTRO_IMAGE_EMBEDDED_HUD_PATCH = {
  x: 2188,
  y: 824,
  width: 420,
  height: 82
};
const INTRO_TEXT_PANEL_HEIGHT = 132;
const INTRO_TEXT_PANEL_WIDTH = 900;
const INTRO_TEXT_LINE_GAP = 29;

export class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create() {
    this.visibleLines = 0;
    this.tick = 0;
    this.background = new CyberBackground(this);
    this.background.create();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.input.on('pointerup', () => this.advanceIntro());
    this.renderContextImage();
    this.renderLines();
  }

  update() {
    this.background.update();
    this.tick += 1;

    if (this.tick % 4 === 0 && this.visibleLines < INTRO_LINES.length - 1) {
      this.visibleLines += 1;
      this.renderLines();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.advanceIntro();
    }
  }

  advanceIntro() {
    if (this.visibleLines < INTRO_LINES.length - 1) {
      this.visibleLines = INTRO_LINES.length - 1;
      this.renderLines();
      return;
    }

    this.scene.start('JavaScriptIntroScene');
  }

  renderLines() {
    this.textGroup?.destroy(true);
    this.textGroup = this.add.group();

    const panelWidth = Math.min(INTRO_TEXT_PANEL_WIDTH, this.scale.width - INTRO_IMAGE_MARGIN * 2);
    const panelY = this.contextImage
      ? this.contextImage.y + this.contextImage.displayHeight + INTRO_IMAGE_TEXT_GAP
      : this.scale.height - INTRO_TEXT_PANEL_HEIGHT - INTRO_IMAGE_MARGIN;

    this.textPanel?.destroy();
    this.textPanel = this.add
      .rectangle(
        this.scale.width / 2,
        panelY + INTRO_TEXT_PANEL_HEIGHT / 2,
        panelWidth,
        INTRO_TEXT_PANEL_HEIGHT,
        0x050814,
        0.88
      )
      .setStrokeStyle(2, 0x00ffdc, 0.45);

    const textStartY = panelY + 20;

    INTRO_LINES.slice(0, this.visibleLines + 1).forEach((line, index) => {
      let color = '#c8f0ff';
      if (index === 0) color = '#00ffdc';
      if (line.includes('PROGRAMAR') || line.includes('stream')) color = '#00ff50';
      if (line.includes('ENTER')) color = '#ffdc00';

      this.textGroup.add(
        this.add
          .text(this.scale.width / 2, textStartY + index * INTRO_TEXT_LINE_GAP, line, {
            fontFamily: FONT.family,
            fontSize: '18px',
            color,
            align: 'center',
            wordWrap: { width: panelWidth - 44 }
          })
          .setOrigin(0.5)
      );
    });
  }

  renderContextImage() {
    const imageData = this.getContextImageData();
    const texture = this.textures.get(imageData.key);
    texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

    const maxWidth = this.scale.width - INTRO_IMAGE_MARGIN * 2;
    const maxHeight =
      this.scale.height -
      INTRO_IMAGE_MARGIN * 2 -
      INTRO_IMAGE_TEXT_GAP -
      INTRO_TEXT_PANEL_HEIGHT;
    const scale = Math.min(maxWidth / imageData.width, maxHeight / imageData.height);

    this.contextImage = this.add
      .image(this.scale.width / 2, INTRO_IMAGE_MARGIN, imageData.key)
      .setOrigin(0.5, 0)
      .setScale(scale);
  }

  getContextImageData() {
    const sourceImage = this.textures.get(INTRO_IMAGE_KEY).getSourceImage();
    const cropWidth = sourceImage.width;
    const cropHeight = sourceImage.height - INTRO_IMAGE_CROP_TOP;

    if (!this.textures.exists(INTRO_IMAGE_CROPPED_KEY)) {
      const croppedTexture = this.textures.createCanvas(INTRO_IMAGE_CROPPED_KEY, cropWidth, cropHeight);
      const ctx = croppedTexture.getContext();

      ctx.drawImage(
        sourceImage,
        0,
        INTRO_IMAGE_CROP_TOP,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      ctx.fillStyle = '#12313d';
      ctx.fillRect(
        INTRO_IMAGE_EMBEDDED_HUD_PATCH.x,
        INTRO_IMAGE_EMBEDDED_HUD_PATCH.y - INTRO_IMAGE_CROP_TOP,
        INTRO_IMAGE_EMBEDDED_HUD_PATCH.width,
        INTRO_IMAGE_EMBEDDED_HUD_PATCH.height
      );
      croppedTexture.refresh();
    }

    return {
      key: INTRO_IMAGE_CROPPED_KEY,
      width: cropWidth,
      height: cropHeight
    };
  }
}
