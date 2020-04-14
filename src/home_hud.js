class HomeHUD extends Phaser.Scene {
    constructor() {
        super({ key: "home_hud" });
    }

    preload() {
        // load custom font
        this.load.bitmapFont('pixeled', './assets/fonts/pixeled/pixeled.png', './assets/fonts/pixeled/pixeled.fnt');
        this.moodVal = 300;
    }

    create() {
        var cam = this.cameras.main;
        cam.roundPixels = true;

        var moodText = this.add.bitmapText(cam.midPoint.x, 10, 'pixeled', 'mood', 20);
        this.moodText = moodText;

        this.drawMoodBar(this.moodVal);
    }

    update() {
        this.moodVal -= 0.1;
        this.drawMoodBar(this.moodVal);
    }

    drawMoodBar(val) {
        var drawArgs = [
            this.moodText.x + this.moodText.width + 8, // x
            18, // y
            300, // width
            20 // height
        ];
        if (this.moodBarContainer === undefined) {
            this.moodBarContainer = this.add.graphics();
            this.moodBarContainer.lineStyle(1, "0x000000");
            this.moodBarContainer.strokeRect(...drawArgs)
        }
        if (this.moodBar === undefined) {
            this.moodBar = this.add.graphics();
        }

        drawArgs[2] = (val >= 0) ? val : 0;
        this.moodBar.clear();
        this.moodBar.fillStyle("0x00BFFF");
        this.moodBar.fillRect(...drawArgs);
    }

}