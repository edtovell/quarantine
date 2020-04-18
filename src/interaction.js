class Interaction extends Phaser.Scene {
    constructor() {
        super({ key: "interaction" });
    }

    preload() {
        this.load.bitmapFont('pixeled', './assets/fonts/pixeled/pixeled.png', './assets/fonts/pixeled/pixeled.fnt');
        this.load.json('interactions', './src/interactions.json');
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create() {
        this.history = new Array();
        this.hud = this.scene.get("home_hud");
        this.cam = this.cameras.main();
    }

    update() {

    }

    drawInteractionBox(title, options, choice) {
        var cam = this.cam;
        var box = this.add.graphics();
        box.lineStyle(1, "0x000000");
        box.fillStyle("0x00BFFF");
        boxArgs = [
            cam.midPoint.x - 350, // x
            cam.midPoint.y - 250, // y
            700, // width
            500, // height
        ];
        box.strokeRect();
        box.fillRect();

        var titleText = this.add.bitmapText(0, 0, 'pixeled', title, 20);
        titleText.setTint("0x000000");

        var optionTexts = new Array();
        options.forEach((option)=>{
            optionTexts = optionTexts.concat(
                this.add.bitmapText(0, 0, 'pixeled', option, 20)
            );
        });
        optionTexts[choice].setTint("0x00BFFF");
    }

    addEventToHistory(key) {
        this.history = this.history.concat(
            {
                "time": this.hud.hoursPassed,
                "key": key,
            }
        );
    }
}