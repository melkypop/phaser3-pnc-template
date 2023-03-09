const MAX_POS = 5;

let inventoryUI = null;
let coinsInv = null;
let heartInv = null;
let moneyInv = null;

let items = {
    0: { x: 12, y: 10, count: 0, name: '' },
    1: { x: 52, y: 10, count: 0, name: '' },
    2: { x: 92, y: 10, count: 0, name: '' },
    3: { x: 132, y: 10, count: 0, name: '' },
    4: { x: 172, y: 10, count: 0, name: '' },
    5: { x: 212, y: 10, count: 0, name: '' }
}

let nameMap = {};

let activePos = 0;

let currentPos = 0;

export default class Inventory extends Phaser.GameObjects.Container {
    constructor (scene, x, y, children) {
        super(scene, x, y, children);

        this.scene = scene;
        this.x = x;
        this.y = y;
        this.children = children;

        this.initItems();
    }

    getInventoryUI () {
        return inventoryUI;
    }

    getInventoryItems () {
        return [heartInv, coinsInv, moneyInv];
    }

    initItems () {
        inventoryUI = this.scene.add.image(0, 0, 'inventoryUI');
        inventoryUI.setOrigin(0, 0).setInteractive();

        heartInv = this.scene.add.image(0, 0, 'heartInv');
        heartInv.setOrigin(0, 0);
        heartInv.visible = false;

        coinsInv = this.scene.add.image(0, 0, 'coinsInv');
        coinsInv.setOrigin(0, 0);
        coinsInv.visible = false;

        moneyInv = this.scene.add.image(0, 0, 'moneyInv');
        moneyInv.setOrigin(0, 0);
        moneyInv.visible = false;

        nameMap = {
            'coins': coinsInv,
            'heart': heartInv,
            'money': moneyInv
        };

        this.children = [inventoryUI, coinsInv, heartInv, moneyInv];

        this.scene.add.container(this.x, this.y, this.children);
    }

    addItem (name) {
        if (currentPos === MAX_POS) {
            return;
        }

        nameMap[name].setPosition(items[currentPos].x, items[currentPos].y);
        items.count += 1;
        items.name = name;
        nameMap[name].visible = true;

        activePos = currentPos;

        if (currentPos < MAX_POS) {
            currentPos++;
        }

    }

}
