const playerMinX = 60;
const playerMaxX = 900;
const playerMinY = 480;
const playerMaxY = 530;

export default class Player extends Phaser.GameObjects.Sprite {
    constructor (scene, x, y) {
        super(scene, x, y);

        this.setTexture('player');
        this.setPosition(x, y);

        this.currentState = 'INIT';
        this.currentScene = scene;
        this.currentDirection = 'WALK_LEFT';

        this.initAnims();
    }

    initAnims () {
        this.currentScene.anims.create({
            key: 'WALK_LEFT',
            frameRate: 7,
            frames: this.currentScene.anims.generateFrameNumbers('player', { frames: [0, 1] }),
            repeat: -1
        });
        this.currentScene.anims.create({
            key: 'WALK_DOWN',
            frameRate: 7,
            frames: this.currentScene.anims.generateFrameNumbers('player', { frames: [0, 1] }),
            repeat: -1
        });
        this.currentScene.anims.create({
            key: 'WALK_UP',
            frameRate: 7,
            frames: this.currentScene.anims.generateFrameNumbers('player', { frames: [0, 1] }),
            repeat: -1
        });
        this.currentScene.anims.create({
            key: 'WALK_RIGHT',
            frameRate: 7,
            frames: this.currentScene.anims.generateFrameNumbers('player', { frames: [0, 1] }),
            repeat: -1
        });
    }

    walk (pointer) {
        if (this.currentState === 'IS_WALKING') {
            return;
        }

        let that = this;
        let pointerX = pointer.x;
        let pointerY = pointer.y;

        // player facing left/right
        if (pointerX > this.x) {
            this.setScale(-2, 2); // flip horizontally (moving right)
            this.currentDirection = 'WALK_RIGHT';
        } else {
            this.setScale(2, 2); // flip horizontally (moving left)
            this.currentDirection = 'WALK_LEFT';
        }
        
        this.currentState = 'IS_WALKING';

        // the speed the sprite will move at, regardless of the distance it has to travel
        let duration = (Phaser.Math.Distance.BetweenPoints(this, pointer) / 100) * 500;

        // limits
        if (pointerX < playerMinX) {
            pointerX = playerMinX;
        }
        if (pointerX > playerMaxX) {
            pointerX = playerMaxX;
        }
        if (pointerY < playerMinY) {
            pointerY = playerMinY;
        }
        if (pointerY > playerMaxY) {
            pointerY = playerMaxY;
        }

        let tween = this.currentScene.tweens.add({
            targets: this,
            x: pointerX,
            y: pointerY,
            ease: 'NONE',
            duration: duration,
            onStart: () => {
                that.play(that.currentDirection);
            },
            onComplete: () => {
                that.x = pointerX;
                that.y = pointerY;
                that.currentState = 'INIT';
                that.stop();
            }
        });
    }
}
