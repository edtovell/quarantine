class Interaction extends Phaser.Scene {
    constructor() {
        super({ key: "interaction" });
    }

    preload() {
        this.load.bitmapFont('pixeled', './assets/fonts/pixeled/pixeled.png', './assets/fonts/pixeled/pixeled.fnt');
        this.load.json('interactions', './src/interactions.json');

        // Set controls
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    }

    create() {
        this.history = new Array();
        this.home = this.scene.get("home");
        this.hud = this.scene.get("home_hud");
        this.cam = this.cameras.main;
        this.textData = this.cache.json.get('interactions');

        // declare a variable for the interaction box
        this.interactionBox;
        this.choiceColor = "0xFF6347"
    }

    update() {
        if (this.obj) {
            var nChoices = Object.keys(this.textData[this.obj].options).length;
            if (this.interactionBox === undefined) {
                this.interactionBox = this.drawInteractionBox(
                    this.textData[this.obj].title,
                    Object.keys(this.textData[this.obj].options),
                    this.choice,
                );
            } else if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
                this.choice--;
                this.interactionBox.optionTexts.forEach((option) => { option.clearTint() });
                this.interactionBox.optionTexts[this.choice % nChoices].setTint(this.choiceColor);
            } else if (Phaser.Input.Keyboard.JustDown(this.downKey)) {
                this.choice++;
                this.interactionBox.optionTexts.forEach((option) => { option.clearTint() });
                this.interactionBox.optionTexts[this.choice % nChoices].setTint(this.choiceColor);
            } else if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
                this.exitInteraction();
            }
        }
    }

    drawInteractionBox(title, options, choice) {

        var cam = this.cam;
        var box = this.add.graphics();
        box.lineStyle(1, "0x000000");
        box.fillStyle("0x000000", 0.5);
        var boxArgs = [
            cam.midPoint.x - 350, // x
            cam.midPoint.y - 250, // y
            700, // width
            500, // height
        ];
        box.strokeRect(...boxArgs);
        box.fillRect(...boxArgs);

        var x = 80;
        var y = 70;

        var titleText = this.add.text(x - 10, y, title, { fontFamily: "Courier", fontSize: 26 });
        titleText.setWordWrapWidth(560);
        y += titleText.displayHeight;

        var optionTexts = new Array();
        options.forEach((option) => {
            y += 10;
            var newOption = this.add.text(x, y, option, { fontFamily: "Courier", fontSize: 20 });
            newOption.setWordWrapWidth(540);
            y += newOption.displayHeight;
            optionTexts = optionTexts.concat(newOption);
        });
        optionTexts[choice].setTint(this.choiceColor);
        return { box: box, titleText: titleText, optionTexts: optionTexts }
    }

    enterInteraction(obj) {
        this.home.scene.setActive(false);
        this.scene.setVisible(true);
        this.scene.setActive(true);
        this.choice = 0;
        this.obj = obj;
    }

    exitInteraction() {
        this.interactionBox.box.clear();
        this.interactionBox.titleText.destroy();
        this.interactionBox.optionTexts.forEach((option) => { option.destroy() });
        this.interactionBox = undefined;
        this.home.scene.setActive(true);
        this.scene.setVisible(false);
        this.scene.setActive(false);
    }

    addEventToHistory(key) {
        this.history = this.history.concat({
            "time": this.hud.hoursPassed,
            "key": key,
        });
    }
}