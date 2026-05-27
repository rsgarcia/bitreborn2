import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';
import { JS_INTRO_PAGES } from '../levels/javascriptIntro.js';
import { CyberBackground } from '../systems/CyberBackground.js';

export class JavaScriptIntroScene extends Phaser.Scene {
  constructor() {
    super('JavaScriptIntroScene');
  }

  create() {
    this.pageIndex = 0;
    this.background = new CyberBackground(this);
    this.background.create();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.input.on('pointerup', () => this.advancePage());
    this.renderPage();
  }

  update() {
    this.background.update();

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.advancePage();
    }
  }

  advancePage() {
    if (this.pageIndex < JS_INTRO_PAGES.length - 1) {
      this.pageIndex += 1;
      this.renderPage();
      return;
    }

    this.scene.start('LevelOneScene');
  }

  renderPage() {
    this.pageGroup?.destroy(true);
    this.pageGroup = this.add.group();

    this.pageGroup.addMultiple([
      this.add.rectangle(40, 30, 880, 540, 0x081432, 0.96).setOrigin(0).setStrokeStyle(2, COLORS.cyan),
      this.add.rectangle(40, 30, 880, 40, COLORS.cyan, 1).setOrigin(0),
      this.add.text(48, 40, `  JAVASCRIPT BASICO - PAGINA ${this.pageIndex + 1}/${JS_INTRO_PAGES.length}`, {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#050814'
      })
    ]);

    JS_INTRO_PAGES[this.pageIndex].forEach((line, index) => {
      this.pageGroup.add(
        this.add
          .text(480, 112 + index * 36, line.text, {
            fontFamily: FONT.family,
            fontSize: `${line.size}px`,
            color: line.color,
            align: 'center',
            wordWrap: { width: 800 }
          })
          .setOrigin(0.5)
      );
    });

    this.pageGroup.add(
      this.add
        .text(480, 538, this.pageIndex < JS_INTRO_PAGES.length - 1 ? '[ ENTER para continuar ]' : '[ ENTER para iniciar a Fase 1 ]', {
          fontFamily: FONT.family,
          fontSize: '22px',
          color: '#00ff50'
        })
        .setOrigin(0.5)
    );

    this.drawScanlines();
  }

  drawScanlines() {
    this.scanlines?.destroy();
    this.scanlines = this.add.graphics().setDepth(10);
    this.scanlines.lineStyle(1, 0x000000, 0.18);
    for (let y = 0; y < this.scale.height; y += 4) {
      this.scanlines.lineBetween(0, y, this.scale.width, y);
    }
  }
}
