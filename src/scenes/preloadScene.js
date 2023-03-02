import bg from '../assets/bg/bg.png';
import bgNight from '../assets/bg/bg_night.png';
import bgInterior from '../assets/bg/bg-interior.png';
import player from '../assets/sprites/BearSprites.png';
import playBtn from '../assets/buttons/play-btn.png';
import inventoryUI from '../assets/ui/inventory-ui.png';
import title from '../assets/ui/title.png';

export default class PreloadScene extends Phaser.Scene {
    constructor () {
        super('PreloadScene');
    }

    preload () {
        this.load.image('bg', bg);
        this.load.image('bgNight', bgNight);
        this.load.image('bgInterior', bgInterior);
        this.load.spritesheet('player', player, { frameWidth: 32, frameHeight: 32, startFrame: 0, endFrame: 1 });
        this.load.image('playBtn', playBtn);
        this.load.image('inventoryUI', inventoryUI);
        this.load.image('title', title);
    }
      
    create () {
        const bg = this.add.image(0, 0, 'bg');
        bg.setOrigin(0, 0);

        const textField = this.add.text(160, 210, 'LOADING...', {
            font: '24px Courier New',
            fill: '#483C32'
        });

        setTimeout(() => {
            this.scene.stop('PreloadScene');
            this.scene.start('MenuMainScene');
        }, 2000);
    }
}
