dbglog = function(text) {
    if (this.game.config.physics.arcade.debug) {
        console.log(text);
    }
}

ANIMS_FRAMERATE = 10;
PC_WALK_SPEED = 200;
T = 50; // size of one tile

class Home extends Phaser.Scene {

    constructor() {
        super({ key: "home" });
        dbglog("initialised home scene");
    }

    preload() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.load.spritesheet("pc", "../assets/pc/pc_spritesheet.png", { frameWidth: 50, frameHeight: 100, spacing: 2, });
        this.load.image("bg", "../assets/tiles/flat.png");
        dbglog("preloaded home scene");
    }

    create() {
        // Instantiate world
        var bg = this.add.image(game.config.width / 2, game.config.height / 2, 'bg');
        var topLeft = bg.getTopLeft();
        this.physics.world.setBounds(topLeft.x+(T/2), topLeft.y, bg.width-T, bg.height);
        this.bg = bg;

        // Instantiate Player Character
        var pc = this.physics.add.sprite(200, 300, "pc", 0);
        pc.isMoving = function() {
            let vel = this.body.velocity;
            return Boolean(vel.x || vel.y);
        }
        pc.setCollideWorldBounds(true);
        this.pc = pc;


        // Sort out Camera and World Bounds
        var cam = this.cameras.main;
        cam.setBounds(topLeft.x, topLeft.y, bg.width, bg.height);
        cam.startFollow(pc);
        cam.setZoom(3);
        cam.fadeIn();
        this.cam = cam;

        // Instantiate Animations
        this.anims.create({
            key: "pc_idle",
            frames: this.anims.generateFrameNumbers("pc", { frames: [0, 1] }),
            frameRate: ANIMS_FRAMERATE / 2,
            repeat: -1,
        })
        this.anims.create({
            key: "pc_walk",
            frames: this.anims.generateFrameNumbers("pc", { frames: [0, 2, 3, 4, 5, 6, 7] }),
            frameRate: ANIMS_FRAMERATE,
            repeat: -1,
        })
        pc.anims.play('pc_idle');

        dbglog("created home scene");

    }

    update() {
        var pc = this.pc;
        var cursors = this.cursors;

        // Player Animations Controller
        if (!pc.isMoving()) {
            if (cursors.left.isDown && cursors.right.isDown) {
                pc.anims.play('pc_idle');
            } else if (cursors.right.isDown) {
                pc.setFlipX(false);
                pc.anims.play('pc_walk');
            } else if (cursors.left.isDown) {
                pc.setFlipX(true);
                pc.anims.play('pc_walk');
            } else if (pc.anims.currentAnim.key != "pc_idle") {
                pc.anims.play("pc_idle");
            }
        }

        // Player Movement Controls
        if (cursors.left.isDown && cursors.right.isDown) {
            pc.body.setVelocity(0);
        } else if (cursors.right.isDown) {
            pc.body.setVelocityX(PC_WALK_SPEED);
        } else if (cursors.left.isDown) {
            pc.body.setVelocityX(-PC_WALK_SPEED);
        } else {
            pc.body.setVelocity(0);
        }
    }
}