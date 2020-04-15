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
        cam.fadeIn();

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

    getToolTip(x) {
        // get a hint when near interactable objects
        var interactables = [
            {lower: 220, higher: 290, text: "space to use computer"},
            {lower: 350, higher: 445, text: "space to watch TV"},
            {lower: 580, higher: 640, text: "space to read a book"},
            {lower: 660, higher: 700, text: "space to go out"},
        ];
        var obj;
        for (obj of interactables) {
            if(x>obj.lower && x<obj.higher) {
                return obj.text;
            }
        }
        return "";
    }

    drawToolTip(x) {
        // show the hint when near interactable objects
        var cam = this.cameras.main;
        if (this.toolTip === undefined) {
            this.toolTip = this.add.bitmapText(0, 0, 'pixeled', '', 20);
            this.toolTip.setPosition(cam.midPoint.x, cam.displayHeight - 35);
        }
        var text = this.getToolTip(x);
        this.toolTip.setText(text);
        this.toolTip.setX(cam.midPoint.x - (this.toolTip.width / 2));
    }
}