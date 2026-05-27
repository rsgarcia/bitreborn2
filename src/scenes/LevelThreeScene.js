import Phaser from 'phaser';
import { COLORS, FONT } from '../config/theme.js';
import { DemoPendrive } from '../entities/DemoPendrive.js';
import { DemoPlayer } from '../entities/DemoPlayer.js';
import { DemoTerminal } from '../entities/DemoTerminal.js';
import { EXPRESSION_CHALLENGE, EXPRESSION_CONCEPT_LINES, LEVEL_THREE, PHASE_THREE_FEEDBACK } from '../levels/levelThree.js';
import { CyberBackground } from '../systems/CyberBackground.js';
import { ParticleBurst } from '../systems/Particles.js';

const STARTING_HEARTS = 2;
const PLATFORM_VISIBILITY_DECLARATION = 'const visibilidadePlataforma = true;';

export class LevelThreeScene extends Phaser.Scene {
  constructor() {
    super('LevelThreeScene');
  }

  create() {
    this.pendriveCollected = false;
    this.nearStartTerminal = false;
    this.nearFinalTerminal = false;
    this.platformsLocked = false;
    this.showingConstDialog = false;
    this.constDialogInput = '';
    this.constDialogFeedback = '';
    this.hearts = STARTING_HEARTS;

    this.physics.world.setBounds(0, 0, LEVEL_THREE.width, LEVEL_THREE.height);
    this.cameras.main.setBounds(0, 0, LEVEL_THREE.width, LEVEL_THREE.height);
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.background = new CyberBackground(this);
    this.background.create();
    this.particles = new ParticleBurst(this);

    this.createDeathFloor();
    this.createPlatforms();
    this.createHud();

    this.player = new DemoPlayer(this, LEVEL_THREE.player.x, LEVEL_THREE.player.y, this.particles);
    this.startTerminal = new DemoTerminal(this, LEVEL_THREE.startTerminal.x, LEVEL_THREE.startTerminal.y);
    this.pendrive = new DemoPendrive(
      this,
      LEVEL_THREE.pendrive.x,
      LEVEL_THREE.pendrive.y,
      this.particles,
      LEVEL_THREE.pendrive.label
    );
    this.finalTerminal = new DemoTerminal(this, LEVEL_THREE.terminal.x, LEVEL_THREE.terminal.y);

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
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    this.input.keyboard.on('keydown', this.handleConstDialogKeyDown, this);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', this.handleConstDialogKeyDown, this);
    });
  }

  update(time) {
    this.background.update();
    this.particles.update();
    this.updateDeathFloor();
    this.updateDynamicPlatforms(time);
    this.startTerminal.update(time);
    this.finalTerminal.update(time);
    this.pendrive.update();

    if (this.showingConstDialog) {
      this.handleConstDialogInput();
      return;
    }

    this.player.update(this.keys);

    if (this.player.sprite.y > LEVEL_THREE.height + 100 || this.isTouchingDeathFloor()) {
      this.loseHeart('Falha no piso corrompido. Reiniciando do checkpoint.');
    }

    if (this.pendrive.overlaps(this.player.getBounds())) {
      this.pendriveCollected = true;
      this.pendrive.collect();
      this.statusText.setText('✓ PENDRIVE EXP COLETADO');
      this.statusText.setColor('#00ff50');
    }

    this.updateInteractions();

    if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
      this.scene.start('GameScene');
    }
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.dynamicPlatforms = [];

    LEVEL_THREE.platforms.forEach((platform) => {
      const block = this.add
        .rectangle(platform.x, platform.y, platform.width, platform.height, platform.fixed ? 0x144c64 : 0x321464, 1)
        .setOrigin(0)
        .setDepth(10);
      block.setStrokeStyle(2, platform.fixed ? COLORS.platformBorder : COLORS.glitch);

      this.physics.add.existing(block, true);
      block.body.updateFromGameObject();
      this.platforms.add(block);

      const bits = this.createPlatformBits(platform, platform.fixed);
      if (!platform.fixed) {
        this.dynamicPlatforms.push({ block, bits, phase: platform.phase ?? 0, active: true });
      }
    });
  }

  createPlatformBits(platform, fixed) {
    const padding = 4;
    const bitWidth = Math.max(0, platform.width - padding * 2);
    const bitHeight = Math.max(0, platform.height - padding);
    const bitCount = Math.ceil(bitWidth / 9);

    return this.add
      .text(platform.x + padding, platform.y + 2, fixed ? '01'.repeat(bitCount) : 'T/F'.repeat(bitCount), {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: fixed ? '#00b4ff' : '#ff78dc',
        fixedWidth: bitWidth,
        fixedHeight: bitHeight
      })
      .setDepth(11);
  }

  updateDynamicPlatforms(time) {
    this.dynamicPlatforms.forEach((platform) => {
      const active = this.platformsLocked || Math.sin(time / 360 + platform.phase) > 0.35;
      if (platform.active === active) {
        return;
      }

      platform.active = active;
      platform.block.setVisible(active);
      platform.bits.setVisible(active);
      platform.block.body.enable = active;
      platform.block.setAlpha(active ? 1 : 0);
      platform.bits.setAlpha(active ? 1 : 0);
    });
  }

  createDeathFloor() {
    const textureKey = this.createDeathFloorTexture();
    const floor = LEVEL_THREE.deathFloor;

    this.deathFloor = this.add
      .tileSprite(floor.x, floor.y, floor.width, floor.height, textureKey)
      .setOrigin(0)
      .setDepth(6);

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
    const key = 'bitreborn-expression-death-floor';
    if (this.textures.exists(key)) {
      return key;
    }

    const texture = this.textures.createCanvas(key, 512, 80);
    const ctx = texture.getContext();
    ctx.fillStyle = '#170013';
    ctx.fillRect(0, 0, 512, 80);

    for (let y = 0; y < 80; y += 4) {
      const offset = Math.sin(y * 0.35) * 20;
      ctx.fillStyle = y % 12 === 0 ? '#ff3250' : '#4a0038';
      ctx.fillRect(offset, y, 512 - Math.abs(offset), 2);
    }

    ctx.font = '18px Courier New';
    for (let x = -20; x < 520; x += 50) {
      const y = 20 + ((x * 5) % 48);
      ctx.fillStyle = x % 100 === 0 ? '#00ffdc' : '#ff78dc';
      ctx.fillText(x % 100 === 0 ? '2*3' : '4+2', x + Math.sin(x) * 8, y);
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
    this.nearStartTerminal = this.startTerminal.isNear(playerBounds);
    this.nearFinalTerminal = this.finalTerminal.isNear(playerBounds);

    if (this.nearStartTerminal && !this.platformsLocked) {
      this.interactionText.setVisible(true);
      this.interactionText.setText('Pressione E para declarar a visibilidade constante das plataformas');
      this.interactionText.setPosition(this.startTerminal.x - 70, this.startTerminal.y - 34);

      if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
        this.openConstDialog();
      }
      return;
    }

    if (this.nearFinalTerminal) {
      this.interactionText.setVisible(true);
      this.interactionText.setText(
        this.pendriveCollected
          ? 'Pressione E para inserir o pendrive EXP'
          : 'Colete o pendrive EXP antes de usar o computador'
      );
      this.interactionText.setPosition(this.finalTerminal.x - 94, this.finalTerminal.y - 34);

      if (Phaser.Input.Keyboard.JustDown(this.keys.interact) && this.pendriveCollected) {
        this.registry.set('terminalData', {
          header: '  TERMINAL v3.0 — PENDRIVE EXP_003.usb',
          conceptLines: EXPRESSION_CONCEPT_LINES,
          nextScene: 'ChallengeScene'
        });
        this.registry.set('challengeData', EXPRESSION_CHALLENGE);
        this.registry.set('feedbackData', PHASE_THREE_FEEDBACK);
        this.scene.start('TerminalScene');
      }
      return;
    }

    this.interactionText.setVisible(false);
  }

  openConstDialog() {
    this.showingConstDialog = true;
    this.constDialogInput = '';
    this.constDialogFeedback = '';
    this.dialogLayer.setVisible(true);
    this.updateConstDialogText();
    this.messageText.setText('');
    this.player.sprite.body.setVelocity(0, 0);
  }

  handleConstDialogInput() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
      this.submitConstDialogInput();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.escape)) {
      this.showingConstDialog = false;
      this.dialogLayer.setVisible(false);
    }
  }

  handleConstDialogKeyDown(event) {
    if (!this.showingConstDialog) {
      return;
    }

    if (event.key === 'Backspace') {
      this.constDialogInput = this.constDialogInput.slice(0, -1);
      this.constDialogFeedback = '';
      this.updateConstDialogText();
      return;
    }

    if (event.key === 'Enter' || event.key === 'Escape') {
      return;
    }

    if (event.key.length === 1 && this.constDialogInput.length < 48) {
      this.constDialogInput += event.key;
      this.constDialogFeedback = '';
      this.updateConstDialogText();
    }
  }

  submitConstDialogInput() {
    if (this.normalizeConstDialogInput(this.constDialogInput) === this.normalizeConstDialogInput(PLATFORM_VISIBILITY_DECLARATION)) {
      this.platformsLocked = true;
      this.showingConstDialog = false;
      this.dialogLayer.setVisible(false);
      this.messageText.setText(`${PLATFORM_VISIBILITY_DECLARATION} Plataformas estabilizadas.`);
      this.statusText.setText('✓ PLATAFORMAS CONSTANTES');
      this.statusText.setColor('#00ff50');
      this.updateDynamicPlatforms(Number.POSITIVE_INFINITY);
      return;
    }

    this.constDialogFeedback = 'Linha incorreta. Declare uma constante verdadeira para a visibilidade.';
    this.updateConstDialogText();
  }

  normalizeConstDialogInput(value) {
    return value.trim().replace(/\s+/g, '');
  }

  updateConstDialogText() {
    const cursor = Date.now() % 1000 < 500 ? '|' : '';
    this.constDialogInputText?.setText(`${this.constDialogInput}${cursor}`);
    this.constDialogFeedbackText?.setText(this.constDialogFeedback);
  }

  createHud() {
    this.add.rectangle(0, 0, this.scale.width, 74, 0x080f23, 1).setOrigin(0).setScrollFactor(0).setDepth(90);
    this.add.line(0, 74, 0, 0, this.scale.width, 0, COLORS.glitch, 1).setOrigin(0).setScrollFactor(0).setDepth(91);

    this.add
      .text(16, 10, 'FASE 3 — EXPRESSÕES', {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#00ffdc'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.heartsText = this.add
      .text(300, 10, this.getHeartsText(), {
        fontFamily: FONT.family,
        fontSize: '20px',
        color: '#ff3250'
      })
      .setScrollFactor(0)
      .setDepth(92);

    this.statusText = this.add
      .text(430, 10, '[ ] PENDRIVE EXP', {
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

    this.createConstDialog();
  }

  createConstDialog() {
    this.dialogLayer = this.add.container(0, 0).setScrollFactor(0).setDepth(110).setVisible(false);
    this.dialogLayer.add(this.add.rectangle(480, 300, 760, 290, 0x050814, 0.96).setStrokeStyle(2, COLORS.glitch));
    this.dialogLayer.add(
      this.add
        .text(480, 210, 'TERMINAL DE VISIBILIDADE', {
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
          278,
          'As plataformas estão alternando entre visível/com colisão e invisível/sem colisão.\nDigite uma linha que declare que a visibilidade das plataformas é constante e verdadeira.',
          {
            fontFamily: FONT.family,
            fontSize: '18px',
            color: '#c8f0ff',
            align: 'center',
            wordWrap: { width: 660 },
            lineSpacing: 8
          }
        )
        .setOrigin(0.5)
    );
    this.dialogLayer.add(
      this.add
        .text(196, 352, '_____', {
          fontFamily: FONT.family,
          fontSize: '28px',
          color: '#ffdc00'
        })
        .setOrigin(0, 0.5)
    );
    this.dialogLayer.add(this.add.rectangle(276, 336, 510, 40, 0x002814, 1).setOrigin(0).setStrokeStyle(1, COLORS.green));
    this.constDialogInputText = this.add.text(288, 352, '', {
      fontFamily: FONT.family,
      fontSize: '22px',
      color: '#00ffdc'
    }).setOrigin(0, 0.5);
    this.dialogLayer.add(this.constDialogInputText);
    this.constDialogFeedbackText = this.add
      .text(480, 395, '', {
        fontFamily: FONT.family,
        fontSize: '15px',
        color: '#ff3250',
        align: 'center',
        wordWrap: { width: 660 }
      })
      .setOrigin(0.5);
    this.dialogLayer.add(this.constDialogFeedbackText);
    this.dialogLayer.add(
      this.add
        .text(480, 422, '[ ENTER confirmar ]    [ ESC cancelar ]', {
          fontFamily: FONT.family,
          fontSize: '18px',
          color: '#00ff50'
        })
        .setOrigin(0.5)
    );
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
    const floor = LEVEL_THREE.deathFloor;
    return bounds.bottom >= floor.y && bounds.right > floor.x && bounds.left < floor.x + floor.width;
  }
}
