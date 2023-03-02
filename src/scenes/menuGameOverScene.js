export default class MenuGameOverScene extends Phaser.Scene {
    constructor () {
        super('MenuGameOverScene');
    }
      
    create () {
        const bgNight = this.add.image(0, 0, 'bgNight');
        bgNight.setOrigin(0, 0);
    }
}
