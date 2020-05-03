class Exercise extends Phaser.Scene {
    constructor() {
        super({ key: "exercise" });
    }

    preload() {
        // Loading Bar
        this.cam = this.cameras.main;
        var midPoint = this.cam.midPoint;
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
        this.load.audio("exercise", "./assets/sounds/exercise.wav");

        this.load.spritesheet("pc_e", "./assets/pc/pc_exercise_spritesheet.png", { frameWidth: 47, frameHeight: 74, spacing: 2, });
        this.load.spritesheet("joggerA", "./assets/npcs/jogger_A_spritesheet.png", { frameWidth: 49, frameHeight: 99, spacing: 2, });
        this.load.image("park", "./assets/tiles/park.png");
        this.load.image("grass", "./assets/tiles/grass.png");

        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        this.finishedScene = false;
    }

    create() {
        var music = this.sound.add("exercise", { loop: true });
        music.play();

        // Draw background
        var park = this.add.image(game.config.width / 2, game.config.height / 2, 'park');
        park.setScale(2);

        // Draw player
        var pc = this.physics.add.sprite(this.cam.midPoint.x, this.cam.displayHeight - 72, "pc_e", 0);
        pc.setScale(3);

        this.anims.create({
            key: "run",
            frames: this.anims.generateFrameNumbers("pc_e", { frames: [0, 1] }),
            frameRate: 2,
            repeat: -1,
        })
        pc.anims.play('run');

        var pcBounceUpAnim = this.time.addEvent({
            callback: () => { pc.setY(pc.y - 3) },
            callbackScope: this,
            delay: 500,
            loop: true,
        });
        var pcBounceDownAnim = this.time.addEvent({
            callback: () => { pc.setY(pc.y + 3) },
            callbackScope: this,
            delay: 500,
            loop: true,
            startAt: 250,
        });

        pc.setDepth(2);
        this.pc = pc;

        // Player has an aura representing 6ft radius
        var aura = this.add.graphics();
        aura.fillStyle("0x00BFFF");
        aura.fillCircle(pc.x, pc.y, 200);
        aura.setAlpha(0.2);
        aura.setDepth(1);

        this.tweens.add({
            targets: aura,
            alpha: 0,
            duration: 1000,
            loop: -1,
            yoyo: true,
        });

        this.aura = aura;

        // pc hitbox mimics aura (because I can't get graphics to collide)
        pc.setCircle(55, -30, -18);

        // Tween constantly moving player to whichever track he's in
        pc.trackIndex = 2 // i.e. the middle track out of 5
        pc.moveDistance = 160 // how far player moves between tracks
        this.trackXCoords = new Array(
            this.cam.midPoint.x - (pc.moveDistance * 2),
            this.cam.midPoint.x - pc.moveDistance,
            this.cam.midPoint.x,
            this.cam.midPoint.x + pc.moveDistance,
            this.cam.midPoint.x + (pc.moveDistance * 2),
        );
        pc.trackTween = this.tweens.add({
            targets: pc,
            start: pc.x,
            x: this.trackXCoords[pc.trackIndex],
            duration: 300,
        });

        // Spawn joggers
        this.nJoggers = 0;
        this.joggers = this.add.group();

        var joggerSpawnEvent = this.time.addEvent({
            callback: this.spawnJogger,
            callbackScope: this,
            delay: 4000,
            loop: true,
            paused: true,
        });

        // Animate grass
        this.time.addEvent({
            callback: this.spawnGrass,
            callbackScope: this,
            delay: 100,
            loop: true
        })

        // Intro text
        var introText = this.make.bitmapText({
            x: 0,
            y: 240,
            font: 'pixeled',
            text: 'Run for 45 Minutes\nStay 6 feet from other people',
            size: 20,
            align: 1, // 0:left, 1:centre, 2:right,
            add: true,
        });
        introText.setX(this.cam.midPoint.x - (introText.width / 2));
        this.time.addEvent({
            callback: () => {
                introText.destroy();
                joggerSpawnEvent.paused = false;
                timerTickEvent.paused = false;
            },
            callbackScope: this,
            delay: 5000,
        });

        // Timer
        this.timerValue = 0;
        this.timerText = this.add.bitmapText(0, 20, 'pixeled', this.timerValue, 40);
        this.timerText.setDepth(3);
        var timerTickEvent = this.time.addEvent({
            callback: () => { this.timerValue++ },
            callbackScope: this,
            delay: 1500,
            loop: true,
            paused: true,
        });

        // Wait on the eventual fadeout to go back home
        this.cam.once('camerafadeoutcomplete', function(){
            this.scene.scene.stop('home');
            this.scene.scene.stop('home_hud');
            this.scene.scene.start('home');
        });

    }

    update() {
        var pc = this.pc;
        if (Phaser.Input.Keyboard.JustDown(this.leftKey) && pc.trackIndex > 0) {
            pc.trackIndex--;
            pc.trackTween.restart();
        }
        if (Phaser.Input.Keyboard.JustDown(this.rightKey) && pc.trackIndex < 4) {
            pc.trackIndex++;
            pc.trackTween.restart();
        }

        pc.trackTween.updateTo("x", pc.x, true); // 3rd arg updates the start value
        pc.trackTween.updateTo("x", this.trackXCoords[pc.trackIndex]);

        this.aura.setX(pc.x - 400);

        // Update the timer
        this.timerText.setText(this.timerValue.toString());
        this.timerText.setX(this.cam.midPoint.x - (this.timerText.width / 2));
        if (this.timerValue >= 45 && !(this.finishedScene)) {
            var winText = this.add.bitmapText(0, 260, 'pixeled', 'You did it!', 50);
            winText.setX(this.cam.midPoint.x - (winText.width / 2));
            this.cam.fadeOut(3000);
            this.finishedScene = true;
        }

        // If you hit a jogger, u ded
        this.joggers.children.iterate(function(jogger) {
            var scene = jogger.scene;
            if (scene.physics.collide(jogger, pc) && !(scene.finishedScene)) {
                var tooClose = scene.add.bitmapText(0, 260, 'pixeled', 'Too Close!', 50);
                tooClose.setX(scene.cam.midPoint.x - (tooClose.width / 2));
                scene.cam.fadeOut(3000);
                scene.finishedScene = true;
            }
        });
    }

    spawnJogger() {
        var modelPool = ["joggerA"];
        var model = Phaser.Math.RND.pick(modelPool);
        var jogger = this.physics.add.sprite(this.cam.midPoint.x, -200, model, 0);
        jogger.setScale(2.5);
        this.joggers.add(jogger);

        // run animation
        var animName = "npc_run_" + this.nJoggers;
        this.nJoggers++;
        this.anims.create({
            key: animName,
            frames: this.anims.generateFrameNumbers(model, { frames: [0, 1] }),
            frameRate: 2,
            repeat: -1,
        });
        jogger.anims.play(animName);
        var targetX = Phaser.Math.RND.pick(this.trackXCoords);

        // move down screen
        this.tweens.add({
            targets: jogger,
            x: targetX,
            y: 700,
            duration: 5000,
            onComplete: () => {
                this.joggers.killAndHide(jogger);
                jogger.destroy();
            },
            onCompleteScope: this,
        });
    }

    spawnGrass() {
        var onLeft = Phaser.Math.Between(0, 1);
        var xOrigin = onLeft ? Phaser.Math.Between(20, 240) : Phaser.Math.Between(560, 780);
        var xTarget = onLeft ? xOrigin - 300 : xOrigin + 300;
        var grass = this.add.image(xOrigin, -10, "grass");
        this.tweens.add({
            targets: grass,
            x: xTarget,
            y: this.cam.displayHeight + 10,
            duration: 10000,
            onComplete: grass.destroy,
        })
    }
}