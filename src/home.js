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

        this.cursors = this.input.keyboard.createCursorKeys();
        this.load.spritesheet("pc", "./assets/pc/pc_spritesheet.png", { frameWidth: 50, frameHeight: 100, spacing: 2, });
        this.load.image("bg", "./assets/tiles/flat.png");
        this.load.image("tv", "./assets/tiles/tv.png");
        this.load.image("outsideA", "./assets/tiles/outsideA.png");
        this.load.image("outsideB", "./assets/tiles/outsideB.png");
        this.load.audio("home", "./assets/sounds/home.wav"); // https://beepbox.co/#8n31s0k0l00e03t2-m0a7g0fj07i0r1o3210T0v1L4u00q1d3f5y3z1C0w8c1h0T5v4L4u05q1d7f2y6z1C0c0h4HU70U0000000000T0v1L4u10q0d0f8y0z1C2w2c0h0T4v1L4uf0q1z6666ji8k8k3jSBKSJJAArriiiiii07JCABrzrrrrrrr00YrkqHrsrrrrjr005zrAqzrjzrrqr1jRjrqGGrrzsrsA099ijrABJJJIAzrrtirqrqjqixzsrAjrqjiqaqqysttAJqjikikrizrHtBJJAzArzrIsRCITKSS099ijrAJS____Qg99habbCAYrDzh00b4zg00000000h4g000000018i000000004x800000000p23LKrnW3qU7CFPn-1K3rHuZHZ7JacVC_9TJldtWj5pHfGBIRnpAKSBjbdoIHmi2_ZnJ5T_1ydJKZlLkZSa1IMnfWfRei0GqfNYOFH_jF4EHjh_bXpi9jk-DTCKFWWf8aoWCnQZJqNROZsLioXnbUZjyc0yDnbJRaqDN_iFE-Lnk4wHjh-fyG0KqcX0CqcHIA72fa18WqjhCplpeph7le0kRszyfpTtPaWyfc8WifpMzFEzFD90
        dbglog("preloaded home scene");

    }

    create() {
        var music = this.sound.add("home", { loop: true });
        music.play();

        // Instantiate world
        var bg = this.add.image(game.config.width / 2, game.config.height / 2, 'bg');
        var topLeft = bg.getTopLeft();
        this.physics.world.setBounds(topLeft.x + (T / 2), topLeft.y, bg.width - T, bg.height);
        this.bg = bg;

        // Instantiate Player Character
        var pc = this.physics.add.sprite(20, 300, "pc", 0);
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
        cam.roundPixels = true;
        cam.fadeIn();
        this.cam = cam;

        // Fore- and Background parallax
        var tv = this.add.image(450, 350, 'tv');
        tv.setScale(2);
        tv.setScrollFactor(1.25);

        var outsideA = this.add.image(250, 260, 'outsideA');
        outsideA.setDepth(-1);
        outsideA.setScrollFactor(0.9);

        var outsideB = this.add.image(500, 260, 'outsideB');
        outsideB.setDepth(-1);
        outsideB.setScrollFactor(0.85);

        // Instantiate HUD
        this.scene.launch("home_hud");
        this.hud = this.scene.get("home_hud");

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

        // Fade in music with a tween
        music.setVolume(0);
        this.tweens.add({
            targets: music,
            volume: 1,
            duration: 1000,
        });

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

        // Draw tooltip based on pc's Xposition
        this.hud.drawToolTip(pc.body.x);

        if (game.config.physics.arcade.debug) {
            // show pc's X position
            if (this.pcX===undefined) {
                this.pcX = this.add.text(this.cam.midPoint.x, this.cam.midPoint.y-80, 'X: ', {fontFamily: "Arial", fontSize: 10, color: BLUE});
            }
            this.pcX.setText("X: " + pc.body.x);
            this.pcX.setX(this.cam.midPoint.x);
        }
    }
}