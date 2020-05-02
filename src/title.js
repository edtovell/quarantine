dbglog = function(text) {
    if (this.game.config.physics.arcade.debug) {
        console.log(text);
    }
}

const BLUE = "0x00BFFF";

class Title extends Phaser.Scene {
    constructor() {
        super({ key: "title" });
    }

    preload() {
        var cam = this.cameras.main;
        this.cam = cam;

        var loadingBar = this.add.graphics();
        this.load.on("progress", function(val) {
            dbglog(val);
            loadingBar.clear();
            loadingBar.fillStyle(BLUE);
            loadingBar.fillRect(cam.midPoint.x - 200, cam.midPoint.y - 5, 400 * val, 10);
        })
        this.load.on("complete", function() {
            dbglog("finished loading title");
        })

        this.load.audio("title", "./assets/sounds/title.wav") //beepbox.co/#8n31s5k4l00e0dt2mm0a7g0ej07i0r1o3210T1v1L4uecq1d7fay0z1C3c0AcF8B7VaQ0001PffffE0000T6v3L4u74q1d1f8y2z1C1c0W42T0v1L4u14q1d6f9y2z1C0w5c1h2T4v1L4uf0q1z6666ji8k8k3jSBKSJJAArriiiiii07JCABrzrrrrrrr00YrkqHrsrrrrjr005zrAqzrjzrrqr1jRjrqGGrrzsrsA099ijrABJJJIAzrrtirqrqjqixzsrAjrqjiqaqqysttAJqjikikrizrHtBJJAzArzrIsRCITKSS099ijrAJS____Qg99habbCAYrDzh00b00810xd3gM020w404h4g4x8i4x8i4w0x4h4h4h4gp222GryvjQahHuzYunHGuKOZ2pCIrhYunNX3qOKR_jBNfjq-bpL5-1czDZAxbRsLnHWcCaCzO2idtjhZvb5jhVb95YLOX5PrjLMarQvnITE_0g4LjhD4s2sTghQQqa3nEerEE0
        this.load.bitmapFont('pixeled', './assets/fonts/pixeled/pixeled.png', './assets/fonts/pixeled/pixeled.fnt');
    }

    create() {
        var music = this.sound.add("title", { loop: true });
        music.play();
        this.titleMusic = music;

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.controlsEnabled = true;

        var cam = this.cam;

        var titleText = this.add.bitmapText(0, 0, 'pixeled', 'Quarantine!', 60);
        titleText.setPosition(cam.midPoint.x - (titleText.width / 2), cam.displayHeight * .3);
        titleText.setTint(BLUE);

        var playText = this.add.bitmapText(0, 0, 'pixeled', 'space to start', 20);
        playText.setTint(BLUE);
        playText.setPosition(cam.midPoint.x - (playText.width / 2), cam.displayHeight *.8);

        cam.fadeIn();


        // listen for the next fadeout to launch the game
        cam.once('camerafadeoutcomplete', function(){
            this.scene.scene.start('home');
        });
    }

    update() {
        if(this.controlsEnabled){
            // Space to start - tween to fade music out
            if (this.spacebar._justDown) {
                this.tweens.add({
                    targets: this.titleMusic,
                    volume: 0,
                    duration: 1000,
                    onComplete: () => {this.titleMusic.stop()},
                })
                this.cam.fadeOut();
                this.controlsEnabled = false;
            }
        }
    }
}