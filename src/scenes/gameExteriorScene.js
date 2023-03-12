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

let pickupsMap = {};
let currentPickup = null;
let pickupsData = null;

let currentQuestionStatement = null;
let currentChoices = [];

let questionStatement = null;
let questionStatementTF = null;
let choiceTFs = [];
let choiceButtons = [];

let currentTopic = null;

let dialogContainer = null;
let dialogType = null;

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

    pickupsData = this.cache.json.get('pickupsData');

    this.initPickupsInteraction(Object.keys(pickupsMap));

    this.initPlayerDialogUI();

    this.input.keyboard.on('keyup-ESC', event => {
      if (menuOpened) {
        dialogContainer.setVisible(false);
        menuOpened = false;
        currentPickup = null;
        this.clearDialog();
      }
    });
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

          currentTopic = dialogType;

          that.getDialogData(currentPickup, dialogType);

          that.displayDialog(currentQuestionStatement, currentChoices);

          dialogContainer.x = player.x;
          dialogContainer.y = player.y;
          dialogContainer.setVisible(true);

          menuOpened = true;
        }
      }
    }, this);

    this.input.on('pointerdown', (pointer) => {
      if (menuOpened) {
        return;
      }

      player.walk(pointer);
    }, this);
  }

  getDialogData(topic, topicNode) {
    let node = pickupsData && pickupsData[topic] && pickupsData[topic][topicNode] ? pickupsData[topic][topicNode] : null;

    currentChoices.length = 0;

    if (node) {
      if (node.question) {
        currentQuestionStatement = node.question || node.statement || '';

        if (node.choices && node.choices.length) {
          for (let i = 0; i < node.choices.length; i++) {
            if (node.choices[i] && node.choices[i].answer) {
              currentChoices.push(node.choices[i]);
            }
          }
        }
      } else {
        if (node.statement) {
          currentQuestionStatement = node.statement;
        }
      }
    }
  }

  displayDialog (currQuestionStatement, currChoices) {
    if (!currQuestionStatement) {
      this.clearDialog();
      this.hideDialog();
      this.hideDialogButtons();
      menuOpened = false;
      return;
    }

    this.showDialog();

    questionStatementTF.setText(currQuestionStatement);

    if (!Array.isArray(currChoices) || (Array.isArray(currChoices) && currChoices.length === 0)) {
      this.hideDialogButtons();

      setTimeout(() => {
        this.clearDialog();
        this.hideDialog();
        menuOpened = false;
      }, 1000);

      return;
    }

    this.showDialogButtons();

    currChoices.forEach((choice, idx) => {
      if (choiceTFs[idx] && choice.answer) {
        choiceTFs[idx].setText(choice.answer);
      }
    });
  }

  showDialogButtons () {
    choiceButtons.forEach(btn => {
      btn.setVisible(true);
    });
  }

  hideDialogButtons () {
    choiceButtons.forEach(btn => {
      btn.setVisible(false);
    });
  }

  showDialog () {
    questionStatement.setVisible(true);
  }

  hideDialog () {
    questionStatement.setVisible(false);
  }

  clearDialog () {
    questionStatementTF.setText('');

    choiceTFs.forEach((choice) => {
      if (choice) {
        choice.setText('');
      }
    });
  }

  setNextDialog (data, currNode, currTopic) {
    this.clearDialog();

    if (data && data[currNode] && data[currNode][currTopic]) {
      this.getDialogData(currNode, currTopic);

      this.displayDialog(currentQuestionStatement, currentChoices);
    }
  }

  initPlayerDialogUI () {
    let that = this;

    // question / statement
    questionStatement = this.add.graphics();
    questionStatement.lineStyle(3, 0x483c32, 1);
    questionStatement.fillStyle(0xFFFFFF, 1);
    questionStatement.fillRoundedRect(-100, -95, 200, 60, 20);
    questionStatement.strokeRoundedRect(-100, -95, 200, 60, 20);

    questionStatementTF = this.add.text(-90, -90, 'Test', {
      font: "16px Courier New",
      fill: "#483c32",
      align: "left",
      wordWrap: { width: 190 }
    });

    // choice buttons
    let choiceBtn1 = this.add.graphics();
    choiceBtn1.lineStyle(3, 0x483c32, 1);
    choiceBtn1.fillStyle(0xFFFFFF, 1);
    choiceBtn1.fillRoundedRect(105, -95, 100, 25, 10);
    choiceBtn1.strokeRoundedRect(105, -95, 100, 25, 10);
    choiceBtn1.setInteractive(new Phaser.Geom.Rectangle(105, -95, 100, 25), Phaser.Geom.Rectangle.Contains);

    choiceButtons.push(choiceBtn1);

    let choiceTF1 = this.add.text(110, -90, 'Y', {
      font: "16px Courier New",
      fill: "#483c32",
      align: "left",
      wordWrap: { width: 90 }
    });

    choiceTFs.push(choiceTF1);
    
    choiceBtn1.on('pointerdown', () => {
      that.chooseChoice(0);
    });
    choiceBtn1.on('pointerover', (event, gameObjects) => {
      choiceTF1.setFill(0xfa8b66);
    });
    choiceBtn1.on('pointerout', (event, gameObjects) => {
      choiceTF1.setFill(0x483c32);
    });

    let choiceBtn2 = this.add.graphics();
    choiceBtn2.lineStyle(3, 0x483c32, 1);
    choiceBtn2.fillStyle(0xFFFFFF, 1);
    choiceBtn2.fillRoundedRect(105, -65, 100, 25, 10);
    choiceBtn2.strokeRoundedRect(105, -65, 100, 25, 10);
    choiceBtn2.setInteractive(new Phaser.Geom.Rectangle(105, -65, 100, 25), Phaser.Geom.Rectangle.Contains);

    choiceButtons.push(choiceBtn2);
    
    let choiceTF2 = this.add.text(110, -60, 'N', {
      font: "16px Courier New",
      fill: "#483c32",
      align: "left",
      wordWrap: { width: 90 }
    });

    choiceTFs.push(choiceTF2);
    
    choiceBtn2.on('pointerdown', () => {
      that.chooseChoice(1);
    });
    choiceBtn2.on('pointerover', (event, gameObjects) => {
      choiceTF2.setFill(0xfa8b66);
    });
    choiceBtn2.on('pointerout', (event, gameObjects) => {
      choiceTF1.setFill(0x483c32);
    });

    dialogContainer = this.add.container(0, 0, [questionStatement, choiceBtn1, choiceBtn2, questionStatementTF, ...choiceTFs]);
    dialogContainer.setVisible(false);
  }

  chooseChoice (num) {
    if (currentChoices[num]) {
      currentTopic = currentChoices[num].nextTopic;

      if (dialogType === 'pickup' && currentTopic === 'pickupResultYes') {
        inventory.addItem(currentPickup);
        pickupsMap[currentPickup].setVisible(false);
      }

      this.setNextDialog(pickupsData, currentPickup, currentTopic);
    }
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
