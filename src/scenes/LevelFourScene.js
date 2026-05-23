import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';
import { DemoPendrive } from '../entities/DemoPendrive.js';
import { DemoPlayer } from '../entities/DemoPlayer.js';
import { DemoTerminal } from '../entities/DemoTerminal.js';
import { LEVEL_FOUR, LEVEL_FOUR_COMPLETE_LINES, PHASE_FOUR_FEEDBACK } from '../levels/levelFour.js';
import { CyberBackground } from '../systems/CyberBackground.js';
import { ParticleBurst } from '../systems/Particles.js';

const STARTING_HEARTS = 2;

export class LevelFourScene extends Phaser.Scene {
  constructor() {
    super('LevelFourScene');
  }

  create() {
    this.hearts = STARTING_HEARTS;
    this.pendriveCollected = false;
    this.bridgeBuilt = false;
    this.showingFormulaDialog = false;
    this.formulaInput = '';

    this.physics.world.setBounds(0, 0, LEVEL_FOUR.width, LEVEL_FOUR.height);
    this.cameras.main.setBounds(0, 0, LEVEL_FOUR.width, LEVEL_FOUR.height);
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.background = new CyberBackground(this);
    this.background.create();
    this.particles = new ParticleBurst(this);

    this.createDeathFloor();
    this.createPlatforms();
    this.createHud();
    this.createFormulaDialog();
    this.createMeasurementLabels();

    this.player = new DemoPlayer(this, LEVEL_FOUR.player.x, LEVEL_FOUR.player.y, this.particles);
    this.startTerminal = new DemoTerminal(this, LEVEL_FOUR.startTerminal.x, LEVEL_FOUR.startTerminal.y);
    this.pendrive = new DemoPendrive(
      this,
      LEVEL_FOUR.pendrive.x,
      LEVEL_FOUR.pendrive.y,
      this.particles,
      LEVEL_FOUR.pendrive.label
    );
    this.finalTerminal = new DemoTerminal(this, LEVEL_FOUR.terminal.x, LEVEL_FOUR.terminal.y);

    this.physics.add.collider(this.player.sprite, this.platforms);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1, -180, 0);

    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    this.input.keyboard.on('keydown', this.handleFormulaKeyDown, this);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', this.handleFormulaKeyDown, this);
    });
  }

  update(time) {
    this.background.update();
    this.particles.update();
    this.updateDeathFloor();
    this.startTerminal.update(time);
    this.finalTerminal.update(time);
    this.pendrive.update();

    if (this.showingFormulaDialog) {
      return;
    }

    this.player.update(this.keys);

    if (this.player.sprite.y > LEVEL_FOUR.height + 100 || this.isTouchingDeathFloor()) {
      this.loseHeart('Piso corrompido detectado. Recalculando rota.');
    }

    if (this.pendrive.overlaps(this.player.getBounds())) {
      this.pendriveCollected = true;
      this.pendrive.collect();
      this.statusText.setText('✓ PENDRIVE CALC COLETADO');
      this.statusText.setColor('#00ff50');
    }

    this.updateInteractions();

    if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
      this.scene.start('GameScene');
    }
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.bridgePlatforms = [];

    [LEVEL_FOUR.startPlatform, LEVEL_FOUR.endPlatform].forEach((platform) => {
      this.addPlatform(platform, 0x144c64, COLORS.platformBorder, '01');
    });
  }

  addPlatform(platform, fill, border, pattern) {
    const block = this.add.rectangle(platform.x, platform.y, platform.width, platform.height, fill, 1).setOrigin(0).setDepth(10);
    block.setStrokeStyle(2, border);

    this.physics.add.existing(block, true);
    block.body.updateFromGameObject();
    this.platforms.add(block);
    this.createPlatformBits(platform, pattern, border);

    return block;
  }

  createPlatformBits(platform, pattern, color) {
    const padding = 4;
    const bitWidth = Math.max(0, platform.width - padding * 2);
    const bitHeight = Math.max(0, platform.height - padding);
    const bitCount = Math.ceil(bitWidth / 9);

    this.add
      .text(platform.x + padding, platform.y + 2, pattern.repeat(bitCount), {
        fontFamily: FONT.family,
        fontSize: '15px',
        color,
        fixedWidth: bitWidth,
        fixedHeight: bitHeight
      })
      .setDepth(11);
  }

  buildBridge() {
    if (this.bridgeBuilt) {
      return;
    }

    const bridge = LEVEL_FOUR.bridge;
    const count = this.getRequiredPlatforms();
    for (let i = 0; i < count; i += 1) {
      const platform = {
        x: bridge.x + i * bridge.platformSize,
        y: bridge.y,
        width: bridge.platformSize,
        height: bridge.platformHeight
      };
      this.bridgePlatforms.push(this.addPlatform(platform, 0x1a4f52, COLORS.green, '160'));
    }

    this.bridgeBuilt = true;
    this.statusText.setText(`✓ ${count} PLATAFORMAS GERADAS`);
    this.statusText.setColor('#00ff50');
    this.messageText.setText('quantidade = distancia / tamanhoPlataforma = 6');
  }

  createDeathFloor() {
    const textureKey = this.createDeathFloorTexture();
    const floor = LEVEL_FOUR.deathFloor;

    this.deathFloor = this.add.tileSprite(floor.x, floor.y, floor.width, floor.height, textureKey).setOrigin(0).setDepth(6);

    const g = this.add.graphics().setDepth(7);
    g.lineStyle(2, COLORS.red, 0.8);
    for (let x = floor.x; x < floor.x + floor.width; x += 64) {
      const y1 = floor.y + Phaser.Math.Between(2, 14);
      const y2 = floor.y + floor.height - Phaser.Math.Between(2, 10);
      g.lineBetween(x, y1, x + 26, y2);
      g.lineBetween(x + 26, y2, x + 54, y1 + Phaser.Math.Between(4, 16));
    }

    g.lineStyle(1, COLORS.cyan, 0.45);
    for (let x = floor.x + 10; x < floor.x + floor.width; x += 92) {
      g.lineBetween(x, floor.y + 7, x + 42, floor.y + floor.height - 8);
    }
  }

  createDeathFloorTexture() {
    const key = 'bitreborn-calculated-death-floor';
    if (this.textures.exists(key)) {
      return key;
    }

    const texture = this.textures.createCanvas(key, 512, 80);
    const ctx = texture.getContext();
    ctx.fillStyle = '#150008';
    ctx.fillRect(0, 0, 512, 80);

    for (let y = 0; y < 80; y += 4) {
      const offset = Math.sin(y * 0.31) * 18;
      ctx.fillStyle = y % 12 === 0 ? '#ff3250' : '#460018';
      ctx.fillRect(offset, y, 512 - Math.abs(offset), 2);
    }

    ctx.font = '18px Courier New';
    for (let x = -20; x < 520; x += 52) {
      const y = 20 + ((x * 7) % 48);
      ctx.fillStyle = x % 104 === 0 ? '#00ffdc' : '#ff3250';
      ctx.fillText(x % 104 === 0 ? '960' : '/160', x + Math.sin(x) * 8, y);
    }

    for (let i = 0; i < 120; i += 1) {
      ctx.fillStyle = i % 3 === 0 ? '#ffdc00' : '#ff3250';
      ctx.globalAlpha = 0.28;
      ctx.fillRect(Math.random() * 512, Math.random() * 80, 2 + Math.random() * 18, 1 + Math.random() * 4);
    }
    ctx.globalAlpha = 1;

    texture.refresh();
    return key;
  }

  updateDeathFloor() {
    this.deathFloor.tilePositionX += 1.2;
    this.deathFloor.tilePositionY += 0.25;
  }

  updateInteractions() {
    const playerBounds = this.player.getBounds();
    const nearStartTerminal = this.startTerminal.isNear(playerBounds);
    const nearFinalTerminal = this.finalTerminal.isNear(playerBounds);

    if (nearStartTerminal && !this.bridgeBuilt) {
      this.interactionText.setVisible(true);
      this.interactionText.setText('Pressione E para calcular quantidade de plataformas');
      this.interactionText.setPosition(this.startTerminal.x - 72, this.startTerminal.y - 34);

      if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
        this.openFormulaDialog();
      }
      return;
    }

    if (nearFinalTerminal) {
      this.interactionText.setVisible(true);
      this.interactionText.setText(
        this.pendriveCollected
          ? 'Pressione E para enviar a rota calculada'
          : 'Colete o pendrive CALC antes de usar o computador'
      );
      this.interactionText.setPosition(this.finalTerminal.x - 110, this.finalTerminal.y - 34);

      if (Phaser.Input.Keyboard.JustDown(this.keys.interact) && this.pendriveCollected) {
        this.registry.set('terminalData', {
          header: '  TERMINAL v4.0 — PENDRIVE CALC_004.usb',
          conceptLines: LEVEL_FOUR_COMPLETE_LINES,
          nextScene: 'FeedbackScene'
        });
        this.registry.set('feedbackData', PHASE_FOUR_FEEDBACK);
        this.scene.start('TerminalScene');
      }
      return;
    }

    this.interactionText.setVisible(false);
  }

  openFormulaDialog() {
    this.showingFormulaDialog = true;
    this.formulaInput = '';
    this.formulaFeedbackText.setText('');
    this.formulaInputText.setText('|');
    this.dialogLayer.setVisible(true);
    this.player.sprite.body.setVelocity(0, 0);
  }

  handleFormulaKeyDown(event) {
    if (!this.showingFormulaDialog) {
      return;
    }

    if (event.key === 'Escape') {
      this.showingFormulaDialog = false;
      this.dialogLayer.setVisible(false);
      return;
    }

    if (event.key === 'Backspace') {
      this.formulaInput = this.formulaInput.slice(0, -1);
      this.updateFormulaInputText();
      return;
    }

    if (event.key === 'Enter') {
      this.submitFormula();
      return;
    }

    if (event.key.length === 1 && this.formulaInput.length < 48) {
      this.formulaInput += event.key;
      this.updateFormulaInputText();
    }
  }

  submitFormula() {
    const normalized = this.normalizeFormula(this.formulaInput);
    const accepted = [
      'distancia/tamanhoplataforma',
      '960/160',
      '6',
      'constquantidade=distancia/tamanhoplataforma;',
      'constquantidade=960/160;'
    ];

    if (!accepted.includes(normalized)) {
      this.formulaFeedbackText.setText('Expressão inválida. Use distancia / tamanhoPlataforma.');
      return;
    }

    this.showingFormulaDialog = false;
    this.dialogLayer.setVisible(false);
    this.buildBridge();
  }

  updateFormulaInputText() {
    this.formulaInputText.setText(`${this.formulaInput}${Date.now() % 1000 < 500 ? '|' : ''}`);
  }

  normalizeFormula(value) {
    return value.replace(/\s+/g, '').toLowerCase();
  }

  createHud() {
    this.add.rectangle(0, 0, this.scale.width, 74, 0x080f23, 1).setOrigin(0).setScrollFactor(0).setDepth(90);
    this.add.line(0, 74, 0, 0, this.scale.width, 0, COLORS.green, 1).setOrigin(0).setScrollFactor(0).setDepth(91);

    this.add
      .text(16, 10, 'FASE 4 — PONTE CALCULADA', {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#00ffdc'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.heartsText = this.add
      .text(360, 10, this.getHeartsText(), {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#ff3250'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.statusText = this.add
      .text(490, 10, '[ ] PENDRIVE CALC', {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#5078a0'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.add
      .text(948, 40, 'WASD / ←→ MOVER   ESPAÇO PULAR   E INTERAGIR', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#5078a0'
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(92);

    this.messageText = this.add
      .text(480, 80, '', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#ffdc00',
        backgroundColor: '#080f23'
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(94);

    this.interactionText = this.add
      .text(0, 0, '', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#ffdc00'
      })
      .setVisible(false)
      .setDepth(95);
  }

  createFormulaDialog() {
    const bridge = LEVEL_FOUR.bridge;
    this.dialogLayer = this.add.container(0, 0).setScrollFactor(0).setDepth(110).setVisible(false);
    this.dialogLayer.add(this.add.rectangle(480, 300, 820, 360, 0x050814, 0.96).setStrokeStyle(2, COLORS.green));
    this.dialogLayer.add(
      this.add
        .text(480, 160, 'TERMINAL DE CÁLCULO DE PONTE', {
          fontFamily: FONT.family,
          fontSize: '28px',
          color: '#00ffdc'
        })
        .setOrigin(0.5)
    );
    this.dialogLayer.add(
      this.add
        .text(
          480,
          230,
          `distancia = ${bridge.distance} bits\n` +
            `tamanhoPlataforma = ${bridge.platformSize} bits\n` +
            'Digite a expressão para calcular a quantidade de plataformas:',
          {
            fontFamily: FONT.family,
            fontSize: '18px',
            color: '#c8f0ff',
            align: 'center',
            wordWrap: { width: 720 },
            lineSpacing: 8
          }
        )
        .setOrigin(0.5)
    );
    this.dialogLayer.add(this.add.rectangle(480, 332, 620, 42, 0x002814, 1).setStrokeStyle(1, COLORS.green));
    this.formulaInputText = this.add
      .text(190, 318, '', {
        fontFamily: FONT.family,
        fontSize: '24px',
        color: '#00ffdc',
        fixedWidth: 580
      })
      .setOrigin(0);
    this.dialogLayer.add(this.formulaInputText);
    this.formulaFeedbackText = this.add
      .text(480, 386, '', {
        fontFamily: FONT.family,
        fontSize: '16px',
        color: '#ff3250',
        align: 'center',
        wordWrap: { width: 720 }
      })
      .setOrigin(0.5);
    this.dialogLayer.add(this.formulaFeedbackText);
    this.dialogLayer.add(
      this.add
        .text(480, 444, '[ ENTER calcular ]    [ ESC cancelar ]', {
          fontFamily: FONT.family,
          fontSize: '18px',
          color: '#00ff50'
        })
        .setOrigin(0.5)
    );
  }

  createMeasurementLabels() {
    const bridge = LEVEL_FOUR.bridge;
    const g = this.add.graphics().setDepth(8);
    g.lineStyle(2, COLORS.yellow, 0.85);
    g.lineBetween(bridge.x, bridge.y - 44, bridge.x + bridge.distance, bridge.y - 44);
    g.lineBetween(bridge.x, bridge.y - 50, bridge.x, bridge.y - 38);
    g.lineBetween(bridge.x + bridge.distance, bridge.y - 50, bridge.x + bridge.distance, bridge.y - 38);
    this.add
      .text(bridge.x + bridge.distance / 2, bridge.y - 74, 'distância: 960 bits', {
        fontFamily: FONT.family,
        fontSize: '16px',
        color: '#ffdc00'
      })
      .setOrigin(0.5)
      .setDepth(9);
    this.add
      .text(bridge.x + 80, bridge.y + 24, 'cada plataforma: 160 bits', {
        fontFamily: FONT.family,
        fontSize: '16px',
        color: '#00ff50'
      })
      .setOrigin(0.5)
      .setDepth(9);
  }

  getRequiredPlatforms() {
    return LEVEL_FOUR.bridge.distance / LEVEL_FOUR.bridge.platformSize;
  }

  getHeartsText() {
    return `${'♥'.repeat(this.hearts)}${'♡'.repeat(STARTING_HEARTS - this.hearts)}`;
  }

  loseHeart(message) {
    if (this.recovering) {
      return;
    }

    this.recovering = true;
    this.hearts -= 1;
    this.heartsText.setText(this.getHeartsText());
    this.messageText.setText(message);

    if (this.hearts <= 0) {
      this.time.delayedCall(800, () => this.scene.start('GameScene'));
      return;
    }

    this.player.respawn();
    this.time.delayedCall(900, () => {
      this.messageText.setText('');
      this.recovering = false;
    });
  }

  isTouchingDeathFloor() {
    const bounds = this.player.getBounds();
    const floor = LEVEL_FOUR.deathFloor;
    return bounds.bottom >= floor.y && bounds.right > floor.x && bounds.left < floor.x + floor.width;
  }
}
