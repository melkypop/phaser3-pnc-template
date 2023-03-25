const MAX_POS = 5;

let inventoryUI = null;
let coinsInv = null;
let heartInv = null;
let moneyInv = null;
let eggInv = null;
let turnipInv = null;
let flanInv = null;

let items = {
    0: { x: 12, y: 10, count: 0, name: '' },
    1: { x: 52, y: 10, count: 0, name: '' },
    2: { x: 92, y: 10, count: 0, name: '' },
    3: { x: 132, y: 10, count: 0, name: '' },
    4: { x: 172, y: 10, count: 0, name: '' },
    5: { x: 212, y: 10, count: 0, name: '' }
};

let nameMap = {};

let activePos = 0;

let currentPos = 0;

export default class Inventory extends Phaser.GameObjects.Container {
    constructor (scene, x, y, children, items) {
        super(scene, x, y, children, items);

        this.scene = scene;
        this.x = x;
        this.y = y;
        this.children = children;
        this.items = items;
    }

    getInventoryUI () {
        return inventoryUI;
    }

    getInventoryItems () {
        return [heartInv, coinsInv, moneyInv, eggInv, turnipInv, flanInv];
    }

    getItems () {
        return items;
    }

    initItems (inventoryItems) {
        inventoryUI = this.scene.add.image(0, 0, 'inventoryUI');
        inventoryUI.setOrigin(0, 0).setInteractive();

        let invItems = [];

        inventoryItems.forEach(item => {
            if (item === 'heart') {
                heartInv = this.scene.add.image(0, 0, 'heartInv');
                heartInv.setOrigin(0, 0);
                heartInv.visible = false;
                invItems.push(heartInv);
            } else if (item === 'coins') {
                coinsInv = this.scene.add.image(0, 0, 'coinsInv');
                coinsInv.setOrigin(0, 0);
                coinsInv.visible = false;
                invItems.push(coinsInv);
            } else if (item === 'money') {
                moneyInv = this.scene.add.image(0, 0, 'moneyInv');
                moneyInv.setOrigin(0, 0);
                moneyInv.visible = false;
                invItems.push(moneyInv);
            } else if (item === 'egg') {
                eggInv = this.scene.add.image(0, 0, 'eggInv');
                eggInv.setOrigin(0, 0);
                eggInv.visible = false;
                invItems.push(eggInv);
            } else if (item === 'turnip') {
                turnipInv = this.scene.add.image(0, 0, 'turnipInv');
                turnipInv.setOrigin(0, 0);
                turnipInv.visible = false;
                invItems.push(turnipInv);
            } else if (item === 'flan') {
                flanInv = this.scene.add.image(0, 0, 'flanInv');
                flanInv.setOrigin(0, 0);
                flanInv.visible = false;
                invItems.push(flanInv);
            }

            nameMap[item] = invItems[invItems.length - 1];
        });

        this.children = [inventoryUI, ...invItems];

        this.scene.add.container(this.x, this.y, this.children);
    }

    checkForItem (name) {
        let found = false;

        if (this.items && Array.isArray(Object.values(this.items)) && Object.values(this.items).length > 0) {
            Object.values(this.items).forEach(it => {
                if (it.name === name) {
                    found = true;
                    return found;
                }
            })
        }

        return found;
    }

    addItem (name) {
        if (currentPos === MAX_POS) {
            return;
        }

        nameMap[name].setPosition(items[currentPos].x, items[currentPos].y);
        items[currentPos].count += 1;
        items[currentPos].name = name;
        nameMap[name].visible = true;

        activePos = currentPos;

        if (currentPos < MAX_POS) {
            currentPos++;
        }

        this.items = items;

    }

    removeItem (name) {
        if (this.items && Array.isArray(Object.values(this.items)) && Object.values(this.items).length > 0) {
            Object.values(this.items).forEach((it, idx) => {
                if (it.name === name) {
                    nameMap[name].visible = false;
                    this.items[idx].name = '';
                    this.items[idx].count = 0;
                }
            })
        }
    }

    setUI () {
        if (!this.items) {
            return;
        }

        (Object.keys(this.items) || []).forEach((key, idx) => {
            if (this.items[key] && this.items[key].name && nameMap[this.items[key].name] && this.items[key].x && this.items[key].y) {
                nameMap[this.items[key].name].setPosition(this.items[key].x, this.items[key].y);
                nameMap[this.items[key].name].visible = true;
            }
        });
    }

}
