class Clap extends Phaser.Scene {
    constructor() {
        super({ key: "clap" });
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

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.load.bitmapFont('pixeled', './assets/fonts/pixeled/pixeled.png', './assets/fonts/pixeled/pixeled.fnt');
        this.load.spritesheet("pc_clap", "./assets/pc/pc_clap_spritesheet.png", { frameWidth: 50, frameHeight: 100, spacing: 2, });
        this.load.image("door", "./assets/tiles/front_door.png");
        this.load.audio("clap", "./assets/sounds/clap.wav");
    }

    create() {
        this.sound.stopAll();
        var clap = this.sound.add("clap");

        var cam = this.cameras.main;
        var door = this.add.image(game.config.width / 2, game.config.height / 2, 'door');
        door.setScale(5);
        var pc = this.physics.add.sprite(350, 313, "pc_clap", 0);
        pc.setScale(4);
        this.pc = pc;

        // Intro text
        var introText = this.make.bitmapText({
            x: 0,
            y: 250,
            font: 'pixeled',
            text: 'space to clap for the NHS',
            size: 30,
            align: 1, // 0:left, 1:centre, 2:right,
            add: true,
        });
        introText.setX(cam.midPoint.x - (introText.width / 2));

        this.nClaps = 0;
        this.nClapsText = this.add.bitmapText(700, 20, 'pixeled', '0', 20);

        // Start after 3 seconds
        this.controlsEnabled = false;
        this.time.addEvent({
            callback: () => {
                introText.destroy();
                this.controlsEnabled = true;

            },
            callbackScope: this,
            delay: 3000,
        });

        // Stop after 30 seconds
        this.time.addEvent({
            callback: () => {
                this.controlsEnabled = false;
                this.nClapsText.destroy();
                var outroText = this.add.bitmapText(0, 250, 'pixeled', 'You Clapped ' + this.nClaps + ' Times', 30);
                outroText.setX(cam.midPoint.x - outroText.width / 2);
            },
            callbackScope: this,
            delay: 30000,
        });

        // Fade Out after 35 seconds
        this.time.addEvent({
            callback: () => { cam.fadeOut() },
            callbackScope: this,
            delay: 35000,
        });

        // Listen for fadeOut to go back home
        cam.once('camerafadeoutcomplete', function() {
            this.scene.scene.stop('home');
            this.scene.scene.stop('home_hud');
            this.scene.scene.start('home');
        });
    }

    update() {
        if (this.controlsEnabled) {
            if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
                this.nClaps++;
                this.nClapsText.setText(this.nClaps.toString());
                this.pc.setFrame(1);
                this.sound.play("clap");

            } else if (Phaser.Input.Keyboard.JustUp(this.spacebar)) {
                this.pc.setFrame(0);
            }
        }
    }
}