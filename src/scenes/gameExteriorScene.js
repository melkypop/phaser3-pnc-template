import Player from '../player.js';
import Inventory from '../inventory.js';

const bgMoveAmount = 1;
const bgLeftLimit = -320;
const playerLeftLimit = 110;
const playerRightLimit = 850;

let worldContainer = null; // items to be moved for parallax

let bg = null;
let player = null;

// inventory
let inventory = null;

// pickups
let coinsPu = null;
let heartPu = null;
let moneyPu = null;

let pickups = [];

let menuOpened = false;

export default class GameExteriorScene extends Phaser.Scene {
    constructor () {
        super('GameExteriorScene');
    }
      
    create () {
      bg = this.add.image(0, 0, 'bg');
      bg.setOrigin(0, 0);

      this.initPickups();

      worldContainer = this.add.container(0, 0, [bg, coinsPu, heartPu, moneyPu]);

      this.initPlayer();

      inventory = new Inventory(this, 400, 570, []);
      inventory.setSize(264, 77).setInteractive();

      this.initInventoryTween();

      this.initCollisions(pickups);
    }

    initInventoryTween () {
      let that = this;
      let inventoryUI = inventory.getInventoryUI();
      let inventoryItems = inventory.getInventoryItems();

      inventoryUI.on('pointerover', (pointer) => {
        if (menuOpened) {
            return;
        }

        let tween = that.tweens.add({
            targets: inventoryUI,
            y: -30,
            ease: 'NONE',
            duration: 200,
            onStart: () => {
              inventoryUI.y = 0;
            },
            onComplete: () => {
              inventoryUI.y = -30;
              menuOpened = true;
            }
        });

        let tweenItems = that.tweens.add({
            targets: inventoryItems,
            y: -20,
            ease: 'NONE',
            duration: 200,
            onStart: () => {
              inventoryItems.forEach(item => {
                item.y = 10;
              });
            },
            onComplete: () => {
              inventoryItems.forEach(item => {
                item.y = -20;
              });
            }
        });

      }, this);

      inventoryUI.on('pointerout', (pointer) => {
          if (!menuOpened) {
              return;
          }

          let tween = that.tweens.add({
            targets: inventoryUI,
            y: 0,
            ease: 'NONE',
            duration: 200,
            onStart: () => {
              inventoryUI.y = -30;
            },
            onComplete: () => {
              inventoryUI.y = 0;
              menuOpened = false;
            }
          });

          let tweenItems = that.tweens.add({
            targets: inventoryItems,
            y: 10,
            ease: 'NONE',
            duration: 200,
            onStart: () => {
              inventoryItems.forEach(item => {
                item.y = -20;
              });
            },
            onComplete: () => {
              inventoryItems.forEach(item => {
                item.y = 10;
              });
            }
        });
      }, this);
    }

    initPickups () {
      coinsPu = this.add.image(100, 500, 'coinsPu');
      coinsPu.setOrigin(0, 0);

      heartPu = this.add.image(200, 500, 'heartPu');
      heartPu.setOrigin(0, 0);

      moneyPu = this.add.image(800, 500, 'moneyPu');
      moneyPu.setOrigin(0, 0);

      pickups = [
        {
          'name': 'coins',
          'pickup': coinsPu
        },
        {
          'name': 'heart',
          'pickup': heartPu
        },
        {
          'name': 'money',
          'pickup': moneyPu
        }
      ];
    }

    initPlayer () {
      player = new Player(this, 600, 500);
      player.setScale(2);
      this.physics.add.existing(player);
      this.add.existing(player);

      this.input.on('pointerdown', (pointer) => {
        if (menuOpened) {
          return;
        }

        player.walk(pointer);
      }, this);
    }

    initCollisions (items) {
      items.forEach(item => {
        const pickup = item.pickup;
        const pickupName = item.name;
        const hitObj = this.physics.add.sprite(pickup.x, pickup.y, null, null).setVisible(false).setActive(true).setOrigin(0, 0);

        hitObj.body.setOffset(10, 10);
        hitObj.body.width = pickup.width;
        hitObj.body.height = pickup.height;

        hitObj.body.setBounce(0).setImmovable(true);
        this.physics.add.overlap(player, hitObj, (player, hitObj) => {
          hitObj.destroy();
          pickup.setVisible(false);

          inventory.addItem(pickupName);
        }, null, this);
      });
    }

    update () {
      // parallax
      if (player.x >= playerRightLimit) {
        if (worldContainer.x <= 0 && worldContainer.x > bgLeftLimit) {
          worldContainer.x -= bgMoveAmount;
          player.x -= bgMoveAmount;
        } else {
          worldContainer.x = bgLeftLimit;
        }
      }

      if (player.x <= playerLeftLimit) {
        if (worldContainer.x >= bgLeftLimit && worldContainer.x < 0) {
          worldContainer.x += bgMoveAmount;
          player.x += bgMoveAmount;
        } else {
          worldContainer.x = 0;
        }
      }
    }
}
