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
        this.scene.setActive(false);
        this.scene.setVisible(false);

        // declare variables for the interaction box
        this.interactionBox = {
            box: undefined,
            titleText: undefined,
            bodyText: undefined,
            optionTexts: []
        };

        this.choice = 0;
        this.nChoices = 0;
        this.choiceColor = "0xFF6347";
        this.userSelection;
        this.userSelectionData;
    }

    update() {
        if (this.objData) {
            if (this.interactionBox.box === undefined) {
                this.drawInteractionBox(
                    this.objData.title,
                    null,
                    Object.keys(this.objData.options),
                    this.choice,
                );
            } else if (Phaser.Input.Keyboard.JustDown(this.upKey)) {
                this.moveUpList();
            } else if (Phaser.Input.Keyboard.JustDown(this.downKey)) {
                this.moveDownList();
            } else if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
                if (this.nChoices) {
                    this.userSelection = Object.keys(this.objData.options)[this.choice];
                    this.userSelectionData = this.objData.options[this.userSelection];
                    if (this.actionAllowed(this.userSelection, this.userSelectionData.frequencyAllowed)) {
                        this.drawInteractionBox(
                            null,
                            this.userSelectionData.response,
                            null,
                            null,
                        );
                    } else {
                        this.drawInteractionBox(
                            null,
                            this.userSelectionData.ifNotAllowed,
                            null,
                            null,
                        );
                    }
                } else if (this.userSelection) {
                    if (this.actionAllowed(this.userSelection, this.userSelectionData.frequencyAllowed)) {
                        this.applyResults();
                        this.addEventToHistory(this.userSelection);
                    }

                    if (["exit", undefined].includes(this.userSelectionData.next)) {
                        this.setInteractionObj(null);
                        this.exitInteraction();
                    } else if(["exercise", "clap", "supermarket"].includes(this.userSelectionData.next)){
                        this.setInteractionObj(null);
                        this.cam.fadeOut();
                        this.time.addEvent({
                            callback: () => { 
                                this.sound.stopAll();
                                this.scene.start(this.userSelectionData.next);
                            },
                            callbackScope: this,
                            delay: 1500,
                        });

                    } else if (this.userSelection.next) {
                        this.setInteractionObj(this.obj, this.userSelectionData.next);
                        this.clearInteractionBox();
                    } else {
                        // emergency! don't know what happened!
                        this.exitInteraction();
                    }
                }
            }
        }

        // debug
        if (game.config.physics.arcade.debug) {
            if (this.debugText === undefined) {
                this.debugText = this.add.text(
                    this.cam.midPoint.x,
                    this.cam.midPoint.y + 10,
                    '', { fontFamily: "Arial", fontSize: 16, color: "#fff", stroke: "#000" }
                );
            }
            var next = (this.objData === undefined ? undefined : this.objData.next);
            var title = (this.objData === undefined ? undefined : this.objData.title);
            var historyString = "\n"
            this.history.forEach((x) => { historyString += ("  {time:" + x.time + ", key:" + x.key + "}\n") })
            this.debugText.setText(
                "this.obj: " + this.obj +
                "\nthis.choice: " + this.choice +
                "\nthis.nChoices: " + this.nChoices +
                "\nthis.objData: " + this.objData +
                "\nthis.userSelection: " + this.userSelection +
                "\nthis.history: " + historyString
            );
            this.debugText.setDepth(5);
        }
    }

    moveUpList() {
        if (this.nChoices) {
            this.choice--;
            if (this.choice < 0) {
                this.choice = this.nChoices - 1;
            }

            this.interactionBox.optionTexts.forEach((option) => { option.clearTint() });
            this.interactionBox.optionTexts[this.choice].setTint(this.choiceColor);
        }
    }

    moveDownList() {
        if (this.nChoices) {
            this.choice++;
            if (this.choice >= this.nChoices) {
                this.choice = 0;
            }
            this.interactionBox.optionTexts.forEach((option) => { option.clearTint() });
            this.interactionBox.optionTexts[this.choice].setTint(this.choiceColor);
        }
    }

    drawInteractionBox(title, body, options, choice) {

        this.clearInteractionBox();

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
        var titleText;
        var bodyText;
        var optionTexts = new Array();

        if (title) {
            titleText = this.add.text(x - 10, y, title, { fontFamily: "Courier", fontSize: 28 });
            titleText.setWordWrapWidth(560);
            y += titleText.displayHeight;
        } else {
            titleText = undefined;
        }

        if (body) {
            y += 10;
            bodyText = this.add.text(x, y, body, { fontFamily: "Courier", fontSize: 22 });
            bodyText.setWordWrapWidth(540);
            y += bodyText.displayHeight;
        } else {
            bodyText = undefined;
        }

        if (options) {
            this.nChoices = options.length;
            options.forEach((option) => {
                y += 10;
                var newOption = this.add.text(x, y, option, { fontFamily: "Courier", fontSize: 22 });
                newOption.setWordWrapWidth(540);
                y += newOption.displayHeight;
                optionTexts = optionTexts.concat(newOption);
            });
            optionTexts[choice].setTint(this.choiceColor);
        } else {
            optionTexts = [];
            this.nChoices = 0;
        }

        this.interactionBox = { box: box, titleText: titleText, bodyText: bodyText, optionTexts: optionTexts };
    }

    clearInteractionBox() {
        if (this.interactionBox.box) {
            this.interactionBox.box.clear();
            this.interactionBox.box = undefined;
        }
        if (this.interactionBox.titleText) {
            this.interactionBox.titleText.destroy();
            this.interactionBox.titleText = undefined;
        }
        if (this.interactionBox.bodyText) {
            this.interactionBox.bodyText.destroy();
            this.interactionBox.bodyText = undefined;
        }
        if (this.interactionBox.optionTexts.length) {
            this.interactionBox.optionTexts.forEach((option) => { option.destroy() });
            this.interactionBox.optionTexts = new Array();
        }
    }

    setInteractionObj(obj, objData) {
        this.obj = obj;
        if (objData) {
            this.objData = objData;
        } else {
            this.objData = this.textData[this.obj];
        }

        if (this.objData && this.objData.options) {
            this.nChoices = Object.keys(this.objData.options).length;
        } else {
            this.nChoices = 0;
        }
    }

    enterInteraction() {
        this.home.scene.setActive(false);
        this.scene.setVisible(true);
        this.scene.setActive(true);
        this.choice = 0;
    }

    exitInteraction() {
        this.clearInteractionBox();
        this.home.scene.setActive(true);
        this.home.setControlsActive(true);
        this.scene.setVisible(false);
        this.scene.setActive(false);
    }

    addEventToHistory(key) {
        this.history = this.history.concat({
            "time": this.hud.hoursPassed,
            "key": key,
        });
    }

    applyResults() {
        if (this.userSelectionData.points) {
            this.hud.drawMoodBar(this.userSelectionData.points);
        }
        if (this.userSelectionData.time) {
            this.hud.hoursPassed += this.userSelectionData.time;
            dbglog()
        }

    }

    actionAllowed(key, nHours) {
        // You can only do actions that you haven't done for a while
        // This checks whether it's been `nHours`` since you last did `key`
        var mostRecent = -4800;
        this.history.forEach((e) => { if (e.key == key) { mostRecent = e.time } });
        return (this.hud.hoursPassed - mostRecent) > nHours;
    }
}