T = 20 // size of one tile

class Supermarket extends Phaser.Scene {
    constructor() {
        super({ key: "supermarket" });
    }

    preload() {
        // Loading Bar
        var midPoint = this.cameras.main.midPoint;
        var loadingBar = this.add.graphics();
        this.load.on("progress", function(val) {
            dbglog(val);
            loadingBar.clear();
            loadingBar.fillStyle(BLUE);
            loadingBar.fillRect(midPoint.x - 200, midPoint.y - 5, 400 * val, 10);
        })
        this.load.on("complete", function() {
            loadingBar.clear();
        })

        this.load.bitmapFont('pixeled', './assets/fonts/pixeled/pixeled.png', './assets/fonts/pixeled/pixeled.fnt');
        this.load.spritesheet("pc_sp", "./assets/pc/pc_sp_spritesheet.png", { frameWidth: 40, frameHeight: 40, spacing: 2, });
        this.load.tilemapTiledJSON("map", "./assets/tiles/supermarket/supermarket.json");
        this.load.image("tiles", "./assets/tiles/supermarket/supermarket_tileset.png");

        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    }

    create() {
        var coord = function(n) {
            // get pixel coordinates from tile coordinates
            (n * T) + (T / 2)
        }

        // draw the map
        var map = this.make.tilemap({ key: "map"});
        this.map = map;
        var tiles = map.addTilesetImage('supermarket_tileset', 'tiles', T, T, 1, 2);
        var floor = map.createStaticLayer('floor', tiles);
        var obstacles = map.createStaticLayer('stuff', tiles);
        obstacles.setCollisionByExclusion([-1]);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // camera setup
        var cam = this.cameras.main;
        cam.setZoom(3);
        cam.setRoundPixels(true);
        cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cam = cam;

        // instantiate player
        var pc = this.physics.add.sprite(100, 580, 'pc_sp', 0);
        pc.moveSpeed = 100;
        pc.setCollideWorldBounds(true);
        pc.body.setSize(38,38);
        pc.setScale(0.5);
        pc.isMoving = function() {
            let v = pc.body.velocity;
            return Boolean(v.x || v.y);
        }
        cam.startFollow(pc);
        this.physics.add.collider(pc, obstacles);
        this.pc = pc;

        //pc anims
        var FRAMERATE = 5;
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers("pc_sp", { frames: [0, 1] }),
            frameRate: FRAMERATE,
            repeat: -1,
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers("pc_sp", { frames: [4, 5] }),
            frameRate: FRAMERATE,
            repeat: -1,
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers("pc_sp", { frames: [3, 10] }),
            frameRate: FRAMERATE,
            repeat: -1,
        });
        this.anims.create({
            key: 'l/r',
            frames: this.anims.generateFrameNumbers("pc_sp", { frames: [6, 8] }),
            frameRate: FRAMERATE,
            repeat: -1,
        });

        this.pc.anims.play('idle');

        this.controlsEnabled = true;
    }

    update() {
        var pc = this.pc;

        if (this.controlsEnabled) {
            if (this.downKey.isDown) {
                if (!this.leftKey.isDown && !this.rightKey.isDown) {
                    pc.setFlipX(false);
                    pc.anims.play('down', true);
                }
                pc.setVelocityY(pc.moveSpeed);
            } else if (this.upKey.isDown) {
                if (!this.leftKey.isDown && !this.rightKey.isDown) {
                    pc.setFlipX(false);
                    pc.anims.play('up', true);
                }
                pc.setVelocityY(-pc.moveSpeed);
            } else {
                pc.setVelocityY(0);
            }

            if (this.leftKey.isDown) {
                pc.setFlipX(false);
                pc.anims.play('l/r', true);
                pc.setVelocityX(-pc.moveSpeed);
            } else if (this.rightKey.isDown) {
                pc.setFlipX(true);
                pc.anims.play('l/r', true);
                pc.setVelocityX(pc.moveSpeed);
            } else {
                pc.setVelocityX(0);
            }

            if (!pc.isMoving()) {
                pc.setFlipX(false);
                pc.anims.play('idle', true);
            }
        }
    }
}