dbglog = function(text) {
    if (this.game.config.physics.arcade.debug) {
        console.log(text);
    }
}

ANIMS_FRAMERATE = 10;

class Home extends Phaser.Scene {

    constructor() {
        super({ key: "home" });
        dbglog("initialised home scene");
    }

    preload() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.load.spritesheet("pc", "../assets/pc/pc_spritesheet.png", { frameWidth: 50, frameHeight: 100, spacing: 2,});
        dbglog("preloaded home scene");
    }

    create() {
        var pc = this.physics.add.sprite(200, 300, "pc", 0);
        this.pc = pc;

        this.anims.create({
            key: "pc_idle",
            frames:this.anims.generateFrameNumbers("pc", {frames: [0,1]}),
            frameRate: ANIMS_FRAMERATE/2,
            repeat: -1,
        })

        this.anims.create({
            key: "pc_walk",
            frames:this.anims.generateFrameNumbers("pc", {frames: [0,2,3,4,5,6,7]}),
            frameRate: ANIMS_FRAMERATE,
            repeat: -1,
        })

        dbglog("created home scene");

    }

    update() {
        var pc = this.pc;
        var cursors = this.cursors;

        if(cursors.left.isDown && cursors.right.isDown) {
            pc.anims.play('pc_idle');
        } else if(cursors.right.isDown){
            pc.setFlipX(false);
            pc.anims.play('pc_walk');
        } else if(cursors.left.isDown){
            pc.setFlipX(true);
            pc.anims.play('pc_walk');
        }
    }
}
