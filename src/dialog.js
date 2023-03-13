let currentQuestionStatement = null;
let currentChoices = [];

let questionStatement = null;
let questionStatementTF = null;
let choiceTFs = [];
let choiceButtons = [];

let currentTopic = null;

let dialogContainer = null;
let dialogType = 'pickup';

let pickupsData;

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

    getDialogData(topic, topicNode) {
        let node = pickupsData && pickupsData[topic] && pickupsData[topic][topicNode] ? pickupsData[topic][topicNode] : null;

        // clear all current choices
        currentChoices.length = 0;

        if (node) {
            if (!currentTopic) {
                currentTopic = topicNode;
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

        let choiceTF1 = this.scene.add.text(110, -90, 'Y', {
            font: "16px Courier New",
            fill: "#483c32",
            align: "left",
            wordWrap: { width: 90 }
        });

        choiceTFs.push(choiceTF1);

        choiceBtn1.on('pointerdown', () => {
            that.chooseChoice(0, this.scene.getCurrentPickup());
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

        let choiceTF2 = this.scene.add.text(110, -60, 'N', {
            font: "16px Courier New",
            fill: "#483c32",
            align: "left",
            wordWrap: { width: 90 }
        });

        choiceTFs.push(choiceTF2);

        choiceBtn2.on('pointerdown', () => {
            that.chooseChoice(1, this.scene.getCurrentPickup());
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

    chooseChoice (num, currentPickup) {
        if (currentChoices[num]) {
            currentTopic = currentChoices[num].nextTopic;

            if (dialogType === 'pickup' && currentTopic === 'pickupResultYes') {
                this.scene.addToInventory(currentPickup);
            }

            this.setNextDialog(pickupsData, currentPickup, currentTopic);
        }
    }
}