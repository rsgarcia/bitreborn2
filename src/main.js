import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig.js';
import './styles/base.css';

const game = new Phaser.Game(gameConfig);

window.__BITREBORN_GAME__ = game;
