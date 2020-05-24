class GameOver extends Phaser.Scene {

    constructor() {
        super({ key: "game_over" });
    }

    init(data){
        this.finalScore = data.finalScore || 0;
        this.finalScoreDays = Math.trunc(this.finalScore / 24).toString();
        this.finalScoreHours = (this.finalScore % 24).toString(); 
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
            loadingBar.clear();
        })

        this.load.audio("title", "./assets/sounds/title.wav");
        this.load.bitmapFont('pixeled', './assets/fonts/pixeled/pixeled.png', './assets/fonts/pixeled/pixeled.fnt');

        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    create(){

        //kill the other scenes, just to be sure
        this.scene.stop('home');
        this.scene.stop('home_hud');
        this.scene.stop('interaction');

        this.sound.stopAll();
        this.titleMusic = this.sound.add("title", { loop: true });
        this.titleMusic.play();

        var gameOverText = this.make.bitmapText({
            x: 0,
            y: 200,
            font: 'pixeled',
            text: "game over",
            size: 50,
            align: 1, // 0:left, 1:centre, 2:right,
            add: true,
        });
        gameOverText.setX(this.cam.midPoint.x - (gameOverText.width/2));
        gameOverText.setTint(0xDC143C);

        var gotBoredText = this.make.bitmapText({
            x: 0,
            y: 300,
            font: 'pixeled',
            text: "You got bored after " + this.finalScoreDays + " days and " + this.finalScoreHours + " hours",
            size: 20,
            align: 1, // 0:left, 1:centre, 2:right,
            add: true,
        });
        gotBoredText.setX(this.cam.midPoint.x - (gotBoredText.width/2));
        gotBoredText.setTint(0xDC143C);

        var spaceToRestart = this.make.bitmapText({
            x: 0,
            y: 500,
            font: 'pixeled',
            text: "space to restart",
            size: 20,
            align: 1, // 0:left, 1:centre, 2:right,
            add: true,
        });
        spaceToRestart.setX(this.cam.midPoint.x - (spaceToRestart.width/2));
        spaceToRestart.setTint(0xDC143C);
        spaceToRestart.setVisible(false);

        this.cam.fadeIn();

        // listen for fadeout to restart from title
        this.cam.once('camerafadeoutcomplete', function(){
            this.scene.scene.start('title');
        });

        this.controlsEnabled = false;
        this.time.addEvent({
            callback: function() {
                this.controlsEnabled = true;
                spaceToRestart.setVisible(true);
            },
            callbackScope: this,
            delay: 6000,
        });
    }

    update(){
        if (this.controlsEnabled && this.spacebar._justDown){
            this.controlsEnabled = false;
            this.cam.fadeOut();
            this.tweens.add({
                targets: this.titleMusic,
                volume: 0,
                duration: 1000,
                onComplete: () => {this.titleMusic.stop()},
            });
        }
    }
}
