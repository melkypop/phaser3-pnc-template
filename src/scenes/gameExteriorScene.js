import Player from '../player.js';
import Inventory from '../inventory.js';
import Dialog from '../dialog.js';

const bgMoveAmount = 1;
const bgLeftLimit = -320;
const playerLeftLimit = 110;
const playerRightLimit = 850;

const walkableArea = {
  minX: 60,
  maxX: 900,
  minY: 480,
  maxY: 530
};

let worldContainer = null; // items to be moved for parallax

let bg = null;
let player = null;

// inventory
let inventory = null;

// pickups
let coinsPu = null;
let heartPu = null;
let moneyPu = null;

let pickupsMap = {};
let currentPickup = null;
let pickupsData = null;

// dialog
let dialogSubTopic = null;
let dialog = null;

// door
let door = null;
let currentDoor = null;
let doorsData = null;

export default class GameExteriorScene extends Phaser.Scene {
  constructor () {
      super('GameExteriorScene');

      this.menuOpened = false;
  }

  init (data) {
    if (data) {
        inventory = data.inventory;
        player = data.player;
        dialog = data.dialog;
    }
  }

  create () {
    bg = this.add.image(0, 0, 'bg');
    bg.setOrigin(0, 0);

    this.initPickups();

    let doorRect = new Phaser.Geom.Rectangle(800, 320, 80, 170);
    door = this.add.graphics({ fillStyle: { color: 0x0000ff, alpha: 0 } });
    door.fillRectShape(doorRect);
    door.setInteractive(doorRect, Phaser.Geom.Rectangle.Contains);

    worldContainer = this.add.container(0, 0, [bg, coinsPu, heartPu, moneyPu, door]);

    this.initPlayer();

    inventory = new Inventory(this, 400, 570, []);
    inventory.initItems(['heart', 'coins', 'money']);
    inventory.setUI();
    inventory.setSize(264, 77).setInteractive();

    this.initInventoryTween();

    this.initPickupsInteraction(Object.keys(pickupsMap));

    dialog = new Dialog(this, 0, 0, []);

    pickupsData = this.cache.json.get('pickupsData');
    dialog.setPickupsData(pickupsData);
    dialog.initPlayerDialogUI();

    doorsData = this.cache.json.get('doorsData');
    dialog.setDoorsData(doorsData);

    door.on('pointerdown', () => {
      currentDoor = 'cafe';
    });

    this.input.keyboard.on('keyup-ESC', event => {
      if (this.menuOpened) {
        dialog.setVisible(false);
        this.menuOpened = false;
        currentPickup = null;
        currentDoor = null;
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
    coinsPu = this.add.image(100, 500, 'coinsPu');
    coinsPu.setOrigin(0, 0);

    heartPu = this.add.image(200, 500, 'heartPu');
    heartPu.setOrigin(0, 0);

    moneyPu = this.add.image(800, 500, 'moneyPu');
    moneyPu.setOrigin(0, 0);

    pickupsMap = {
      'coins': coinsPu,
      'heart': heartPu,
      'money': moneyPu
    };
  }

  initPickupsInteraction (items) {
    let that = this;

    bg.setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
      currentPickup = null;
      currentDoor = null;
    }, that);

    items.forEach(item => {
      pickupsMap[item].setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
          currentPickup = item;
          currentDoor = null;
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
          dialogSubTopic = 'pickup';

          let { currentQuestionStatement, currentChoices } = dialog.getDialogData(currentPickup, dialogSubTopic, 'pickup');

          dialog.displayDialog(currentQuestionStatement, currentChoices, player.x, player.y);

          this.menuOpened = true;
        }

        if (currentDoor) {
          dialogSubTopic = 'door';

          let { currentQuestionStatement, currentChoices } = dialog.getDialogData('cafe', dialogSubTopic, 'door');

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

  enterScene () {
    // this.cameras.main.fadeOut(1000, 0, 0, 0);
      
    // this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
      this.scene.stop('GameExteriorScene');
      this.scene.start('GameInteriorScene', { inventory, player, dialog });
    // });
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
