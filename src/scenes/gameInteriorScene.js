import Player from '../player.js';
import Inventory from '../inventory.js';
import Dialog from '../dialog.js';

const walkableArea = {
  minX: 180,
  maxX: 770,
  minY: 370,
  maxY: 510
};

let sceneWidth = 0;
let sceneHeight = 0;

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
let dialogSubTopic = null;

// door
let door = null;
let currentDoor = null;
let doorsData = null;

let currentObject = null;

// food
let eggPu = null;
let flanPu = null;
let sushiPu = null;

let pot = null;
let potContents = [];

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
        potContents = data.potContents || [];
    }
  }

  create () {
    let { width, height } = this.sys.game.canvas;

    this.input.setDefaultCursor('');

    sceneWidth = width;
    sceneHeight = height;

    bg = this.add.image(0, 0, 'bgInterior');
    bg.setOrigin(0, 0);

    this.initPickups();

    let doorRect = new Phaser.Geom.Rectangle(300, 500, 400, 50);
    let door = this.add.graphics({ fillStyle: { color: 0x0000ff, alpha: 0 } });
    door.fillRectShape(doorRect);
    door.setInteractive(doorRect, Phaser.Geom.Rectangle.Contains);

    let potRect = new Phaser.Geom.Rectangle(640, 310, 60, 40);
    pot = this.add.graphics({ fillStyle: { color: 0x0000ff, alpha: 0 } });
    pot.fillRectShape(potRect);
    pot.setInteractive(potRect, Phaser.Geom.Rectangle.Contains);

    this.initPlayer();

    inventory = new Inventory(this, sceneWidth/2 - 132, sceneHeight - 30, [], inventoryData ? inventoryData.items : []);
    inventory.initItems(['heart', 'coins', 'money', 'egg', 'turnip', 'flan']);
    inventory.setUI();
    inventory.setSize(264, 77).setInteractive();

    // check for egg
    if ((!inventory.checkForItem('egg') && potContents.includes('egg')) || (!inventory.checkForItem('egg') && !potContents.includes('egg'))) {
      eggPu.setVisible(true);
    } else {
      eggPu.setVisible(false);
    }

    this.initInventoryTween();

    this.initPickupsInteraction(Object.keys(pickupsMap));

    dialog = new Dialog(this, 0, 0, []);

    pickupsData = this.cache.json.get('pickupsData');
    dialog.setPickupsData(pickupsData);

    doorsData = this.cache.json.get('doorsData');
    dialog.setDoorsData(doorsData);

    dialog.initPlayerDialogUI();

    door.on('pointerover', () => {
      this.input.setDefaultCursor('url(src/assets/ui/cursor.png), pointer');
    });

    door.on('pointerout', () => {
      this.input.setDefaultCursor('');
    });

    door.on('pointerdown', () => {
      currentPickup = null;
      currentDoor = 'outside';
      currentObject = null;
    });

    pot.on('pointerdown', () => {
      currentDoor = null;
      currentObject = 'pot';
      currentPickup = null;
    });

    pot.on('pointerover', () => {
      this.input.setDefaultCursor('url(src/assets/ui/cursor.png), pointer');
    });

    pot.on('pointerout', () => {
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

  getPotContents () {
    return potContents;
  }

  setPotContents (item) {
    if (potContents && Array.isArray(potContents) && !potContents.includes(item)) {
      potContents.push(item);
    }
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
    this.anims.create({
      key: 'egg',
      frames: this.anims.generateFrameNumbers('food', { frames: [ 0, 1 ] }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'flan',
      frames: this.anims.generateFrameNumbers('food', { frames: [ 8, 9 ] }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'sushi',
      frames: this.anims.generateFrameNumbers('food', { frames: [ 6, 7 ] }),
      frameRate: 8,
      repeat: -1
    });

    eggPu = this.add.sprite(295, 320);
    eggPu.setScale(2);
    eggPu.play('egg');

    flanPu = this.add.sprite(680, 420);
    flanPu.setScale(2);
    flanPu.play('flan');
    flanPu.setVisible(false);

    sushiPu = this.add.sprite(480, 320);
    sushiPu.setScale(2);
    sushiPu.play('sushi');

    pickupsMap = {
      'egg': eggPu,
      'flan': flanPu,
      'sushi': sushiPu
    };
  }

  initPickupsInteraction (items) {
    let that = this;

    bg.setInteractive().on('pointerdown', (pointer, localX, localY, event) => {
      currentDoor = null;
      currentPickup = null;
      currentObject = null;
    }, that);

    items.forEach(item => {
      pickupsMap[item].setInteractive({ cursor: 'url(src/assets/ui/cursor.png), pointer' }).on('pointerdown', (pointer, localX, localY, event) => {
        currentDoor = null;  
        currentPickup = item;
        currentObject = null;
      }, that);
    });
  }

  initPlayer () {
    let that = this;

    player = new Player(this, 580, 420);
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

        if (currentDoor) {
          dialogSubTopic = 'door';

          let { currentQuestionStatement, currentChoices } = dialog.getDialogData('outside', dialogSubTopic, 'door');

          dialog.displayDialog(currentQuestionStatement, currentChoices, player.x, player.y);

          this.menuOpened = true;
        }

        if (currentObject) {
          dialogSubTopic = 'object';

          if (currentObject === 'pot' && inventory.checkForItem('turnip') && potContents && Array.isArray(potContents) && !potContents.includes('turnip')) {
            dialogSubTopic = 'addTurnip';
          }

          if (currentObject === 'pot' && inventory.checkForItem('egg') && potContents && Array.isArray(potContents) && !potContents.includes('egg')) {
            dialogSubTopic = 'addEgg';
          }

          if (potContents.includes('egg') && potContents.includes('turnip') && !potContents.includes('flan')) {
            dialogSubTopic = 'mixPot';
          }

          if (potContents.includes('egg') && potContents.includes('turnip') && !potContents.includes('flan') && flanPu && !inventory.checkForItem('flan')) {
            flanPu.setVisible(true);
            dialogSubTopic = 'potResultMixYes';
          }

          let { currentQuestionStatement, currentChoices } = dialog.getDialogData(currentObject, dialogSubTopic, 'object');

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

  getCurrentDoor () {
    return currentDoor;
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
      this.scene.stop('GameInteriorScene');
      this.scene.start('GameExteriorScene', { inventory, player, dialog });
    });
  }
}
