// Main entry point for the Phaser game.
// Initializes the game with specified scenes and configuration.
import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false, // Set to true for physics debugging
        },
    },
    scene: [BootScene, GameScene, UIScene, GameOverScene],
};

const game = new Phaser.Game(config);