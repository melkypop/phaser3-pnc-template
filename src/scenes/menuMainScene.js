export default class MenuMainScene extends Phaser.Scene {
    constructor () {
        super('MenuMainScene');
    }
      
    create () {
        const bg = this.add.image(0, 0, 'bg');
        bg.setOrigin(0, 0);

        const title = this.add.image(0, 40, 'title');
        title.setOrigin(0, 0);

        const playBtn = this.add.image(150, 210, 'playBtn');
        playBtn.setOrigin(0, 0).setInteractive();
        playBtn.on('pointerdown', () => {
            this.scene.stop('MenuMainScene');
            this.scene.start('GameExteriorScene');
        });

    }
}
