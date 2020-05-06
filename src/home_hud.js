class HomeHUD extends Phaser.Scene {
    // Calculates and draws the heads-up display

    constructor() {
        super({ key: "home_hud" });
    }

    preload() {
        // load custom font
        this.load.bitmapFont('pixeled', './assets/fonts/pixeled/pixeled.png', './assets/fonts/pixeled/pixeled.fnt');
        this.moodValMax = 300;
        this.moodVal = game.registry.get('moodVal') || this.moodValMax;
        this.hoursPassed = game.registry.get('hoursPassed') || 0;
    }

    create() {
        var cam = this.cameras.main;
        cam.roundPixels = true;
        cam.fadeIn();

        var moodText = this.add.bitmapText(cam.midPoint.x, 10, 'pixeled', 'mood', 20);
        this.moodText = moodText;

        // This is the first run, so use this.firstRun to make sure all graphics get drawn
        this.firstRun = true;
        this.drawMoodBar(0);
        this.drawTimePassed();
        this.drawToolTip(0);
        this.firstRun = false;

        // Increase time passed
        this.time.addEvent({
            callback: () => {
                this.hoursPassed += 1;
                game.registry.set('hoursPassed', this.hoursPassed);
            },
            callbackScope: this,
            delay: 5000,
            loop: true,
        });

        // Decrease mood
        this.time.addEvent({
            callback: () => { this.drawMoodBar(-1) },
            callbackScope: this,
            delay: 400,
            loop: true,
        });
    }

    update() {
        this.drawMoodBar(0);
        this.drawTimePassed();
    }

    drawMoodBar(diff) {
        if (diff) {
            // only count the diff up to the max, or down to 0
            if (this.moodVal + diff < 0) {
                diff = this.moodVal;
            } else if (this.moodVal + diff > this.moodValMax) {
                diff = this.moodValMax - this.moodVal;
            }
        }

        var drawArgs = [
            this.moodText.x + this.moodText.width + 8, // x
            18, // y
            this.moodValMax, // width
            20 // height
        ];
        if (this.firstRun) {
            // draw the container
            this.moodBarContainer = this.add.graphics();
            this.moodBarContainer.lineStyle(1, "0x000000");
            this.moodBarContainer.strokeRect(...drawArgs)
            // draw the moodbar
            this.moodBar = this.add.graphics();
        }

        drawArgs[2] = this.moodVal + diff;
        this.moodBar.clear();
        this.moodBar.fillStyle("0x00BFFF");
        this.moodBar.fillRect(...drawArgs);

        // if there is a diff, draw it
        if (diff) {
            var moodBarDiff = this.add.graphics();
            drawArgs[0] = drawArgs[0] + this.moodVal;
            drawArgs[2] = diff;
            moodBarDiff.fillStyle((diff > 0) ? "0x32CD32" : "0xDC143C") // green if positive, else red
            moodBarDiff.fillRect(...drawArgs);

            // then destroy it
            this.time.addEvent({
                callback: () => { moodBarDiff.clear() },
                callbackScope: this,
                delay: 300,
            });

            // change moodBarVal accordingly
            this.moodVal += diff;
            game.registry.set("moodVal", this.moodVal);
        }
    }

    drawTimePassed() {
        if (this.firstRun) {
            this.timePassedTextObj = this.add.bitmapText(10, 10, 'pixeled', '', 20);
        }
        var days = Math.trunc(this.hoursPassed / 24).toString().padStart(2, "0");
        var hours = (this.hoursPassed % 24).toString().padStart(2, "0");
        this.timePassedTextObj.setText(days + " days, " + hours + " hrs");
    }

    getToolTip(x) {
        // get a hint when near interactable objects
        var interactables = [
            { lower: 220, higher: 290, text: "space to use computer", key: "computer" },
            { lower: 350, higher: 450, text: "space to watch TV", key: "TV" },
            { lower: 570, higher: 640, text: "space to read a book", key: "book" },
            { lower: 645, higher: 700, text: "space to go out", key: "out" },
        ];
        var obj;
        for (obj of interactables) {
            if (x > obj.lower && x < obj.higher) {
                return obj;
            }
        }
        return "";
    }

    drawToolTip(x) {
        // show the hint when near interactable objects
        var cam = this.cameras.main;
        if (this.firstRun) {
            this.toolTip = this.add.bitmapText(0, 0, 'pixeled', '', 20);
            this.toolTip.setPosition(cam.midPoint.x, cam.displayHeight - 35);
        }
        var obj = this.getToolTip(x);
        this.toolTip.setText(obj.text);
        this.toolTip.setX(cam.midPoint.x - (this.toolTip.width / 2));
        return obj.key;
    }
}