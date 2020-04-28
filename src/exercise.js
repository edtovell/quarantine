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

        this.load.spritesheet("pc_e", "./assets/pc/pc_exercise_spritesheet.png", { frameWidth: 47, frameHeight: 74, spacing: 2, });
        this.load.image("park", "./assets/tiles/park.png");

        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    }

    create() {
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

        pc.setDepth(1);
        this.pc = pc;

        // Player has an aura representing 6ft radius
        var aura = this.add.graphics();
        aura.fillStyle("0x00BFFF");
        aura.fillCircle(pc.x, pc.y, 200);
        aura.setAlpha(0.2);
        aura.setDepth(0);

        this.tweens.add({
            targets: aura,
            alpha: 0,
            duration: 1000,
            loop: -1,
            yoyo: true,
        });
        this.aura = aura;

        // Tween constantly running, moving player to target
        pc.trackIndex = 2 // i.e. the middle track out of 5
        pc.moveDistance = 160 // how far player moves between tracks
        this.trackXCoords = new Array(
            this.cam.midPoint.x - (pc.moveDistance*2),
            this.cam.midPoint.x - pc.moveDistance,
            this.cam.midPoint.x,
            this.cam.midPoint.x + pc.moveDistance,
            this.cam.midPoint.x + (pc.moveDistance*2),
        );
        pc.trackTween = this.tweens.add({
            targets: pc,
            start: pc.x,
            x: this.trackXCoords[pc.trackIndex],
            duration: 300,
        });
    }

    update() {
        var pc = this.pc;
        if (Phaser.Input.Keyboard.JustDown(this.leftKey)){
            pc.trackIndex--;
            pc.trackTween.restart();
        }
        if (Phaser.Input.Keyboard.JustDown(this.rightKey)){
            pc.trackIndex++;
            pc.trackTween.restart();
        }

        if (pc.trackIndex < 0){
            pc.trackIndex = 0;
        } else if (pc.trackIndex > 4){
            pc.trackIndex = 4;
        }

        pc.trackTween.updateTo("x", pc.x, true); // 3rd arg updates the start value
        pc.trackTween.updateTo("x", this.trackXCoords[pc.trackIndex]);



        this.aura.setX(pc.x - 400);
    }
}