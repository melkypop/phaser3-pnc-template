let music;

export default class MenuMainScene extends Phaser.Scene {
    constructor() {
        super('MenuMainScene');
    }

    create() {
        music = this.sound.add('music');
        music.loop = true;
        music.play();

        const bg = this.add.image(0, 0, 'bg');
        bg.setOrigin(0, 0);

        const title = this.add.image(0, 40, 'title');
        title.setOrigin(0, 0);

        const playBtn = this.add.image(150, 190, 'playBtn');
        playBtn.setOrigin(0, 0).setInteractive();
        playBtn.on('pointerdown', () => {
            this.scene.stop('MenuMainScene');
            this.scene.start('GameExteriorScene');
        });

        let tfCredits = this.add.text(70, 240, 'Dev by @melkypop \nArt by @florassence | Music by Migfus20', {
            font: "13px Courier New",
            fill: "#483c32",
            align: "center",
            wordWrap: { width: 500 }
        });

    }
}
