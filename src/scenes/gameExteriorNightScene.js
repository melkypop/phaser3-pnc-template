import Player from '../player.js';
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

let npc = null;
let objectsData = null;

// dialog
let dialogSubTopic = null;
let dialog = null;

let currentObject = null;

export default class GameExteriorNightScene extends Phaser.Scene {
  constructor () {
      super('GameExteriorNightScene');

      this.menuOpened = false;
  }

  init () {
  }

  create () {
    let { width, height } = this.sys.game.canvas;

    this.input.setDefaultCursor('');

    bg = this.add.image(0, 0, 'bgNight');
    bg.setOrigin(0, 0);

    this.initNpc();

    worldContainer = this.add.container(0, 0, [bg, npc]);

    this.initPlayer();

    dialog = new Dialog(this, 0, 0, []);

    objectsData = this.cache.json.get('objectsData');
    dialog.setObjectsData(objectsData);

    dialog.initPlayerDialogUI();

    this.input.keyboard.on('keyup-ESC', event => {
      if (this.menuOpened) {
        dialog.setVisible(false);
        this.menuOpened = false;
        currentObject = null;
        dialog.clearDialog();
        dialog.hideDialog();
        dialog.hideDialogButtons();
      }
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

        if (currentObject && currentObject === 'npc') {
          dialogSubTopic = 'night';

          let { currentQuestionStatement, currentChoices } = dialog.getDialogData(currentObject, dialogSubTopic, 'object');

          dialog.displayDialog(currentQuestionStatement, currentChoices, dialogX, player.y);

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
      currentObject = null;
    }, that);

    npc.setInteractive({ cursor: 'url(src/assets/ui/cursor.png), pointer' }).on('pointerdown', (pointer, localX, localY, event) => {
      currentObject = 'npc';
    }, that);
  }

  getCurrentObject () {
    return currentObject;
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
