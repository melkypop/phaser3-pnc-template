import Player from '../player.js';
import Inventory from '../inventory.js';
import Dialog from '../dialog.js';

const walkableArea = {
  minX: 180,
  maxX: 770,
  minY: 370,
  maxY: 510
};

let bg = null;
let player = null;

// inventory
let inventory = null;
let inventoryData = null;

let pickupsMap = {};
let currentPickup = null;
let pickupsData = null;

// dialog
let dialogType = null;
let dialog = null;

export default class GameInteriorScene extends Phaser.Scene {
  constructor () {
      super('GameInteriorScene');

      this.menuOpened = false;
  }

  init (data) {
    if (data) {
        inventoryData = data.inventory;
        player = data.player;
        dialog = data.dialog;
    }
  }

  create () {
    bg = this.add.image(0, 0, 'bgInterior');
    bg.setOrigin(0, 0);

    this.initPickups();

    this.initPlayer();

    inventory = new Inventory(this, 400, 570, [], inventoryData.items);
    inventory.setSize(264, 77).setInteractive();

    inventory.initItems(['heart', 'coins', 'money']);
    inventory.setUI();
    inventory.setSize(264, 77).setInteractive();

    this.initInventoryTween();

    this.initPickupsInteraction(Object.keys(pickupsMap));

    dialog = new Dialog(this, 0, 0, []);
    pickupsData = this.cache.json.get('pickupsData');
    dialog.setPickupsData(pickupsData);
    dialog.initPlayerDialogUI();

    this.input.keyboard.on('keyup-ESC', event => {
      if (this.menuOpened) {
        dialog.setVisible(false);
        this.menuOpened = false;
        currentPickup = null;
        dialog.clearDialog();
      }
    });
  }

  initInventoryTween () {
    let that = this;
    let inventoryUI = inventory.getInventoryUI();
    let inventoryItems = inventory.getInventoryItems();

    inventoryUI.on('pointerover', (pointer) => {
      if (this.menuOpened) {
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
            this.menuOpened = true;
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
        if (!this.menuOpened) {
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
            this.menuOpened = false;
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
    // coinsPu = this.add.image(100, 500, 'coinsPu');
    // coinsPu.setOrigin(0, 0);

    // heartPu = this.add.image(200, 500, 'heartPu');
    // heartPu.setOrigin(0, 0);

    // moneyPu = this.add.image(800, 500, 'moneyPu');
    // moneyPu.setOrigin(0, 0);

    // pickupsMap = {
    //   'coins': coinsPu,
    //   'heart': heartPu,
    //   'money': moneyPu
    // };
  }

  initPickupsInteraction (items) {
    let that = this;

    bg.setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
      currentPickup = null;
    }, that);

    items.forEach(item => {
      pickupsMap[item].setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
          currentPickup = item;
      }, that);
    });
  }

  initPlayer () {
    let that = this;

    player = new Player(this, 600, 500);
    player.setScale(2);
    this.physics.add.existing(player);
    this.add.existing(player);

    player.on('WALK_COMPLETE', (player) => {
      if (player.currentState === 'INIT') {
        if (currentPickup) {
          dialogType = 'pickup';

          let { currentQuestionStatement, currentChoices } = dialog.getDialogData(currentPickup, dialogType);

          dialog.displayDialog(currentQuestionStatement, currentChoices, player.x, player.y);

          this.menuOpened = true;
        }
      }
    }, this);

    this.input.on('pointerdown', (pointer) => {
      if (this.menuOpened) {
        return;
      }

      player.walk(pointer, walkableArea);
    }, this);
  }

  getCurrentPickup () {
    return currentPickup;
  }

  addToInventory (pickup) {
    inventory.addItem(pickup);
    pickupsMap[pickup].setVisible(false);
  }
}
