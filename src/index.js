import Phaser from 'phaser';
import PreloadScene from './scenes/preloadScene.js';
import MenuMainScene from './scenes/menuMainScene.js';
import GameExteriorScene from './scenes/gameExteriorScene.js';
import GameInteriorScene from './scenes/gameInteriorScene.js';
import GameExteriorNightScene from './scenes/gameExteriorNightScene.js';

const config = {
    type: Phaser.WEBGL,
    width: 960,
    height: 600,
    audio: {
     disableWebAudio: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            fps: 60,
            gravity: {y : 0},
        }
    },
    antialias: true,
    scene: [ PreloadScene, MenuMainScene, GameExteriorScene, GameInteriorScene, GameExteriorNightScene ]
};

const game = new Phaser.Game(config);
