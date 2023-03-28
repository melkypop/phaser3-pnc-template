import bg from '../assets/bg/bg.png';
import bgNight from '../assets/bg/bgNight.png';
import bgInterior from '../assets/bg/bg-interior2.png';
import player from '../assets/sprites/BearSprites.png';
import food from '../assets/sprites/FoodSprites2.png';
import playBtn from '../assets/buttons/play-btn.png';
import coinsInv from '../assets/inventory/coins-inventory.png';
import heartInv from '../assets/inventory/heart-inventory.png';
import moneyInv from '../assets/inventory/money-inventory.png';
import eggInv from '../assets/inventory/egg-inventory2.png';
import turnipInv from '../assets/inventory/turnip-inventory2.png';
import flanInv from '../assets/inventory/flan-inventory2.png';
import coinsPu from '../assets/pickups/coins-pickup.png';
import heartPu from '../assets/pickups/heart-pickup.png';
import moneyPu from '../assets/pickups/money-pickup.png';
import inventoryUI from '../assets/ui/inventory-ui.png';
import title from '../assets/ui/title.png';
import pickupsData from '../data/pickups.json';
import doorsData from '../data/doors.json';
import objectsData from '../data/objects.json';

export default class PreloadScene extends Phaser.Scene {
    constructor () {
        super('PreloadScene');
    }

    preload () {
        this.load.audio('music', ['migfus20_music.mp3', 'migfus20_music.ogg']);
    
        this.load.image('bg', bg);
        this.load.image('bgNight', bgNight);
        this.load.image('bgInterior', bgInterior);
        this.load.spritesheet('player', player, { frameWidth: 32, frameHeight: 32, startFrame: 0, endFrame: 10 });
        this.load.spritesheet('food', food, { frameWidth: 32, frameHeight: 32, startFrame: 0, endFrame: 10 });
        this.load.image('playBtn', playBtn);
        this.load.image('inventoryUI', inventoryUI);
        this.load.image('title', title);

        // inventory
        this.load.image('coinsInv', coinsInv);
        this.load.image('heartInv', heartInv);
        this.load.image('moneyInv', moneyInv);
        this.load.image('eggInv', eggInv);
        this.load.image('turnipInv', turnipInv);
        this.load.image('flanInv', flanInv);

        // pickups
        this.load.image('coinsPu', coinsPu);
        this.load.image('heartPu', heartPu);
        this.load.image('moneyPu', moneyPu);

        // data
        this.load.json('pickupsData', pickupsData);
        this.load.json('doorsData', doorsData);
        this.load.json('objectsData', objectsData);
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
