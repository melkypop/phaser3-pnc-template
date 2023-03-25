let currentQuestionStatement = null;
let currentChoices = [];

let questionStatement = null;
let questionStatementTF = null;
let choiceTFs = [];
let choiceButtons = [];

let currentTopic = null;

let dialogContainer = null;
let dialogType = null;

let pickupsData = null;
let doorsData = null;
let objectsData = null;

let currentX = 0;
let currentY = 0;

export default class Dialog extends Phaser.GameObjects.Container {
    constructor (scene, x, y, children) {
        super(scene, x, y, children);

        this.scene = scene;
        this.x = x;
        this.y = y;
        this.children = children;
    }

    setPickupsData (data) {
        pickupsData = data;
    }

    setDoorsData (data) {
        doorsData = data;
    }

    setObjectsData (data) {
        objectsData = data;
    }

    getDialogData(topic, subTopic, dType) {
        let dataMap = {
            'pickup': pickupsData,
            'door': doorsData,
            'object': objectsData
        }

        // if (!dType && subTopic.toLowerCase().indexOf('pickup') !== -1) {
        //     dType = 'pickup';
        // } else {
        //     dType = 'door';
        // }

        if (!dType) {
            if (subTopic.indexOf('pickup') !== -1) {
                dType = 'pickup';
            } else if (subTopic.indexOf('door') !== -1) {
                dType = 'door';
            } else {
                dType = 'object';
            }
        }
        
        dialogType = dType;

        let node = dataMap[dialogType] && dataMap[dialogType][topic] && dataMap[dialogType][topic][subTopic] ? dataMap[dialogType][topic][subTopic] : null;

        // clear all current choices
        currentChoices.length = 0;

        if (node) {
            if (!currentTopic) {
                currentTopic = subTopic;
            }

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
        } else {
            return null;
        }

        return {
            currentQuestionStatement,
            currentChoices
        }
    }

    displayDialog (currQuestionStatement, currChoices, x, y) {
        if (!currQuestionStatement) {
            this.clearDialog();
            this.hideDialog();
            this.hideDialogButtons();
            this.scene.menuOpened = false;
            return;
        }

        currentX = x;
        currentY = y;

        dialogContainer.x = currentX;
        dialogContainer.y = currentY;
        dialogContainer.setVisible(true);

        this.showDialog();

        questionStatementTF.setText(currQuestionStatement);

        if (!Array.isArray(currChoices) || (Array.isArray(currChoices) && currChoices.length === 0)) {
            this.hideDialogButtons();

            setTimeout(() => {
                this.clearDialog();
                this.hideDialog();
                this.scene.menuOpened = false;
            }, 1000);

            return;
        }

        this.showDialogButtons();

        (currChoices || []).forEach((choice, idx) => {
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

    destroyDialog () {
        this.clearDialog();
        currentChoices.length = 0;
        choiceTFs.length = 0;
        choiceButtons.length = 0;
    }

    setNextDialog (data, currNode, currTopic) {
        this.clearDialog();

        if (data && data[currNode] && data[currNode][currTopic]) {
            this.getDialogData(currNode, currTopic);

            this.displayDialog(currentQuestionStatement, currentChoices, currentX, currentY);
        }
    }

    initPlayerDialogUI () {
        let that = this;

        // question / statement
        questionStatement = this.scene.add.graphics();
        questionStatement.lineStyle(3, 0x483c32, 1);
        questionStatement.fillStyle(0xFFFFFF, 1);
        questionStatement.fillRoundedRect(-100, -95, 200, 60, 20);
        questionStatement.strokeRoundedRect(-100, -95, 200, 60, 20);

        questionStatementTF = this.scene.add.text(-90, -90, 'Test', {
            font: "16px Courier New",
            fill: "#483c32",
            align: "left",
            wordWrap: { width: 190 }
        });

        // choice buttons
        let choiceBtn1 = this.scene.add.graphics();
        choiceBtn1.lineStyle(3, 0x483c32, 1);
        choiceBtn1.fillStyle(0xFFFFFF, 1);
        choiceBtn1.fillRoundedRect(105, -95, 100, 25, 10);
        choiceBtn1.strokeRoundedRect(105, -95, 100, 25, 10);
        choiceBtn1.setInteractive(new Phaser.Geom.Rectangle(105, -95, 100, 25), Phaser.Geom.Rectangle.Contains);

        choiceButtons.push(choiceBtn1);

        let choiceTF1 = this.scene.add.text(110, -90, '', {
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

        let choiceBtn2 = this.scene.add.graphics();
        choiceBtn2.lineStyle(3, 0x483c32, 1);
        choiceBtn2.fillStyle(0xFFFFFF, 1);
        choiceBtn2.fillRoundedRect(105, -65, 100, 25, 10);
        choiceBtn2.strokeRoundedRect(105, -65, 100, 25, 10);
        choiceBtn2.setInteractive(new Phaser.Geom.Rectangle(105, -65, 100, 25), Phaser.Geom.Rectangle.Contains);

        choiceButtons.push(choiceBtn2);

        let choiceTF2 = this.scene.add.text(110, -60, '', {
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

        this.children = [questionStatement, choiceBtn1, choiceBtn2, questionStatementTF, ...choiceTFs];

        dialogContainer = this.scene.add.container(this.x, this.y, this.children);
        dialogContainer.setVisible(false);
    }

    chooseChoice (num) {
        if (currentChoices[num]) {
            currentTopic = currentChoices[num].nextTopic;

            if (dialogType === 'pickup') {
                if (currentTopic === 'pickupResultYes') {
                    this.scene.addToInventory(this.scene.getCurrentPickup());
                }

                this.setNextDialog(pickupsData, this.scene.getCurrentPickup(), currentTopic);
            }

            if (dialogType === 'door') {

                this.setNextDialog(doorsData, this.scene.getCurrentDoor(), currentTopic);

                if (currentTopic === 'doorResultYes') {
                    setTimeout(() => {
                        this.destroyDialog();
                        this.scene.enterScene();
                    }, 800);
                }
            }
        }
    }
}