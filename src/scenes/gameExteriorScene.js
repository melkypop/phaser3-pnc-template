import Player from '../player.js';

const bgMoveAmount = 1;
const bgLeftLimit = -320;
const playerLeftLimit = 110;
const playerRightLimit = 850;

let bg = null;
let inventoryUI = null;
let player = null;

let menuOpened = false;

export default class GameExteriorScene extends Phaser.Scene {
    constructor () {
        super('GameExteriorScene');
    }
      
    create () {
      let that = this;

      bg = this.add.image(0, 0, 'bg');
      bg.setOrigin(0, 0);

      inventoryUI = this.add.image(400, 570, 'inventoryUI');
      inventoryUI.setOrigin(0, 0).setInteractive().setDepth(1000);

      inventoryUI.on('pointerover', (pointer) => {
        if (menuOpened) {
          inventoryUI.y = 540;
          return;
        }

        let tween = that.tweens.add({
          targets: inventoryUI,
          y: inventoryUI.y - 30,
          ease: 'NONE',
          duration: 200,
          onStart: () => {
            inventoryUI.y = 570;
          },
          onComplete: () => {
            menuOpened = true;
            inventoryUI.y = 540;
          }
        });
      }, this);

      inventoryUI.on('pointerout', (pointer) => {
        if (!menuOpened) {
          inventoryUI.y = 570;
          return;
        }

        let tween = that.tweens.add({
          targets: inventoryUI,
          y: inventoryUI.y + 30,
          ease: 'NONE',
          duration: 200,
          onStart: () => {
            inventoryUI.y = 540;
          },
          onComplete: () => {
            menuOpened = false;
            inventoryUI.y = 570;
          }
        });
      }, this);

      player = new Player(this, 600, 500);
      player.setScale(2);
      this.add.existing(player);

      this.input.on('pointerdown', (pointer) => {
        if (menuOpened) {
          return;
        }

        player.walk(pointer);
      }, this);

    }

    update () {
      // parallax
      if (player.x >= playerRightLimit) {
        if (bg.x <= 0 && bg.x > bgLeftLimit) {
          bg.x -= bgMoveAmount;
          player.x -= bgMoveAmount;
        } else {
          bg.x = bgLeftLimit;
        }
      }

      if (player.x <= playerLeftLimit) {
        if (bg.x >= bgLeftLimit && bg.x < 0) {
          bg.x += bgMoveAmount;
          player.x += bgMoveAmount;
        } else {
          bg.x = 0;
        }
      }
    }
}
