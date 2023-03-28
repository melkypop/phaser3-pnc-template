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

let sceneWidth = 0;
let sceneHeight = 0;

let worldContainer = null; // items to be moved for parallax

let bg = null;
let player = null;

let npc = null;
let objectsData = null;

// inventory
let inventory = null;
let inventoryData = null;

// pickups
let coinsPu = null;
let heartPu = null;
let moneyPu = null;
let turnipPu = null;

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

let currentObject = null;
let sign = null;
let shrub = null;

let potContents = [];

export default class GameExteriorScene extends Phaser.Scene {
  constructor () {
      super('GameExteriorScene');

      this.menuOpened = false;
  }

  init (data) {
    if (data) {
        inventoryData = data.inventory;
        player = data.player;
        dialog = data.dialog;
        potContents = data.potContents || [];
    }
  }

  create () {
    let { width, height } = this.sys.game.canvas;

    this.input.setDefaultCursor('');

    sceneWidth = width;
    sceneHeight = height;

    bg = this.add.image(0, 0, 'bg');
    bg.setOrigin(0, 0);

    this.initPickups();

    this.initNpc();

    let doorRect = new Phaser.Geom.Rectangle(800, 320, 80, 170);
    door = this.add.graphics({ fillStyle: { color: 0x0000ff, alpha: 0 } });
    door.fillRectShape(doorRect);
    door.setInteractive(doorRect, Phaser.Geom.Rectangle.Contains);

    let signRect = new Phaser.Geom.Rectangle(940, 400, 80, 80);
    sign = this.add.graphics({ fillStyle: { color: 0x0000ff, alpha: 0 } });
    sign.fillRectShape(signRect);
    sign.setInteractive(signRect, Phaser.Geom.Rectangle.Contains);

    let shrubRect = new Phaser.Geom.Rectangle(500, 390, 150, 80);
    shrub = this.add.graphics({ fillStyle: { color: 0x0000ff, alpha: 0 } });
    shrub.fillRectShape(shrubRect);
    shrub.setInteractive(shrubRect, Phaser.Geom.Rectangle.Contains);

    worldContainer = this.add.container(0, 0, [bg, coinsPu, heartPu, moneyPu, turnipPu, npc, door, sign, shrub]);

    this.initPlayer();

    inventory = new Inventory(this, sceneWidth/2 - 132, sceneHeight - 30, [], inventoryData ? inventoryData.items : []);
    inventory.initItems(['heart', 'coins', 'money', 'egg', 'turnip', 'flan']);
    inventory.setUI();
    inventory.setSize(264, 77).setInteractive();

    this.initInventoryTween();

    this.initPickupsInteraction(Object.keys(pickupsMap));

    dialog = new Dialog(this, 0, 0, []);

    pickupsData = this.cache.json.get('pickupsData');
    dialog.setPickupsData(pickupsData);

    doorsData = this.cache.json.get('doorsData');
    dialog.setDoorsData(doorsData);

    objectsData = this.cache.json.get('objectsData');
    dialog.setObjectsData(objectsData);

    dialog.initPlayerDialogUI();

    door.on('pointerover', () => {
      this.input.setDefaultCursor('url(src/assets/ui/cursor.png), pointer');
    });

    door.on('pointerout', () => {
      this.input.setDefaultCursor('');
    });

    door.on('pointerdown', () => {
      currentDoor = 'cafe';
      currentObject = null;
      currentPickup = null;
    });

    sign.on('pointerdown', () => {
      currentDoor = null;
      currentObject = 'sign';
      currentPickup = null;
    });

    sign.on('pointerover', () => {
      this.input.setDefaultCursor('url(src/assets/ui/cursor.png), pointer');
    });

    sign.on('pointerout', () => {
      this.input.setDefaultCursor('');
    });

    shrub.on('pointerdown', () => {
      if (inventory.checkForItem('money')) {
        currentDoor = null;
        currentObject = 'shrub';
        currentPickup = null;
      }
    });

    shrub.on('pointerover', () => {
      if (inventory.checkForItem('money')) {
        this.input.setDefaultCursor('url(src/assets/ui/cursor.png), pointer');
      }
    });

    shrub.on('pointerout', () => {
      this.input.setDefaultCursor('');
    });

    this.input.keyboard.on('keyup-ESC', event => {
      if (this.menuOpened) {
        dialog.setVisible(false);
        this.menuOpened = false;
        currentPickup = null;
        currentDoor = null;
        currentObject = null;
        dialog.clearDialog();
        dialog.hideDialog();
        dialog.hideDialogButtons();
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
    coinsPu.setVisible(false);

    heartPu = this.add.image(940, 480, 'heartPu');
    heartPu.setOrigin(0, 0);
    heartPu.setVisible(false);

    moneyPu = this.add.image(800, 500, 'moneyPu');
    moneyPu.setOrigin(0, 0);
    moneyPu.setVisible(false);

    this.anims.create({
      key: 'turnip',
      frames: this.anims.generateFrameNumbers('food', { frames: [ 2, 3 ] }),
      frameRate: 8,
      repeat: -1
    });

    turnipPu = this.add.sprite(500, 500);
    turnipPu.setScale(2);
    turnipPu.play('turnip');
    turnipPu.setVisible(false);

    pickupsMap = {
      'coins': coinsPu,
      'heart': heartPu,
      'money': moneyPu,
      'turnip': turnipPu
    };
  }

  showPickup (name) {
    pickupsMap[name].setVisible(true);
  }

  initPickupsInteraction (items) {
    let that = this;

    bg.setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
      currentPickup = null;
      currentDoor = null;
      currentObject = null;
    }, that);

    items.forEach(item => {
      pickupsMap[item].setInteractive({ cursor: 'url(src/assets/ui/cursor.png), pointer' }).on('pointerdown', (pointer, localX, localY, event) => {
          currentPickup = item;
          currentDoor = null;
          currentObject = null;
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

        let dialogX = player.x;

        if (player.x > 600) {
          dialogX = player.x - 150;
        } else if (player.x < 360) {
          dialogX = player.x + 100;
        }

        if (currentPickup) {
          dialogSubTopic = 'pickup';

          let { currentQuestionStatement, currentChoices } = dialog.getDialogData(currentPickup, dialogSubTopic, 'pickup');

          dialog.displayDialog(currentQuestionStatement, currentChoices, dialogX, player.y);

          this.menuOpened = true;
        }

        if (currentDoor) {
          dialogSubTopic = 'door';

          if (currentDoor === 'cafe') {
            if (inventory.checkForItem('money')) {
              dialogSubTopic = 'door'
            } else {
              dialogSubTopic = 'noMoney';
            }
          }

          let { currentQuestionStatement, currentChoices } = dialog.getDialogData('cafe', dialogSubTopic, 'door');

          dialog.displayDialog(currentQuestionStatement, currentChoices, dialogX, player.y);

          this.menuOpened = true;
        }

        if (currentObject) {
          dialogSubTopic = 'object';

          if (currentObject === 'npc') {
            if (inventory.checkForItem('flan')) {
              dialogSubTopic = 'flan';
            } else if (inventory.checkForItem('turnip') || potContents.includes('turnip')) {
              dialogSubTopic = 'hungry';
            } else if (inventory.checkForItem('money')) {
              dialogSubTopic = 'money';
            } else if (inventory.checkForItem('heart')) {
              dialogSubTopic = 'heart';
            }
          }

          if (currentObject === 'shrub' && turnipPu && !inventory.checkForItem('turnip') && !potContents.includes('turnip') && !potContents.includes('flan')) {
            turnipPu.setVisible(true);
          }

          let { currentQuestionStatement, currentChoices } = dialog.getDialogData(currentObject, dialogSubTopic, 'object');

          dialog.displayDialog(currentQuestionStatement, currentChoices, dialogX, player.y);

          this.menuOpened = true;

          if (currentObject === 'sign' && heartPu && (!inventory.checkForItem('heart'))) {
            heartPu.setVisible(true);
          }

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

  initNpc () {
    let that = this;

    this.anims.create({
      key: 'npc',
      frames: this.anims.generateFrameNumbers('player', { frames: [ 2, 3 ] }),
      frameRate: 8,
      repeat: -1
    });

    npc = this.add.sprite(155, 470);
    npc.setScale(2);
    npc.flipX = true;
    npc.play('npc');

    bg.setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
      currentDoor = null;
      currentPickup = null;
      currentObject = null;
    }, that);

    npc.setInteractive({ cursor: 'url(src/assets/ui/cursor.png), pointer' }).on('pointerdown', (pointer, localX, localY, event) => {
      currentDoor = null;  
      currentPickup = null;
      currentObject = 'npc';
    }, that);
  }

  getCurrentPickup () {
    return currentPickup;
  }

  getCurrentDoor () {
    return currentDoor;
  }

  getCurrentObject () {
    return currentObject;
  }

  addToInventory (pickup) {
    inventory.addItem(pickup);
    pickupsMap[pickup].setVisible(false);
  }

  removeFromInventory (pickup) {
    inventory.removeItem(pickup);
  }

  enterScene () {
    this.cameras.main.fadeOut(800, 0, 0, 0);
      
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
      this.scene.stop('GameExteriorScene');
      this.scene.start('GameInteriorScene', { inventory, player, dialog, potContents });
    });
  }

  enterNightScene () {
    this.cameras.main.fadeOut(800, 0, 0, 0);
      
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
      this.scene.stop('GameExteriorScene');
      this.scene.start('GameExteriorNightScene');
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
