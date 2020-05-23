class SupermarketHUD extends Phaser.Scene {
    constructor() {
        super({ key: "supermarket_hud" });
    }

    preload() {
        this.load.bitmapFont('pixeled', './assets/fonts/pixeled/pixeled.png', './assets/fonts/pixeled/pixeled.fnt');
        this.load.image("list", "./assets/tiles/supermarket/list.png");

        var cam = this.cameras.main;
        cam.setRoundPixels = true;
        this.cam = cam;
    }

    create() {

        this.shoppingList = this.add.image(720, 550, "list");
        this.shoppingList.setScale(3);
        this.crossOutItem = this.add.graphics().lineStyle(2, 0xFF1100);

        var introText = this.make.bitmapText({
            x: 0,
            y: 240,
            font: 'pixeled',
            text: 'Get every item on your list\nStay 6 feet from other people',
            size: 30,
            align: 1, // 0:left, 1:centre, 2:right,
            add: true,
        });
        introText.setTint(0x72e1fc);
        introText.setX(this.cam.midPoint.x - (introText.width / 2));
        this.time.addEvent({
            callback: () => {
                introText.destroy();
            },
            callbackScope: this,
            delay: 5000,
        });
    }

    update() {}

    crossOffListItem(item) {
        var listItems = {
            "milk": [640, 505, 760, 500],
            "bread": [640, 535, 760, 550],
            "bogroll": [638, 570, 770, 580],
        }
        this.crossOutItem.lineBetween(...listItems[item]);
    }

    goToCheckout() {
        this.shoppingList.destroy();
        this.crossOutItem.destroy();
        this.goToCheckoutText = this.make.bitmapText({
            x: 0,
            y: 240,
            font: 'pixeled',
            text: 'get to the\ncheckout',
            size: 30,
            align: 1, // 0:left, 1:centre, 2:right,
            add: true,
        });
        this.goToCheckoutText.setTint(0x72e1fc);
        this.goToCheckoutText.setX(this.cam.midPoint.x - (this.goToCheckoutText.width/2));
        this.tweens.add({
            targets: this.goToCheckoutText,
            x: 630, 
            y: 500,
            fontSize: 18,
            delay: 1000,
            duration: 300,
        });
    }

    goToExit() {
        this.goToCheckoutText.destroy();
        this.goToExitText = this.make.bitmapText({
            x: 0,
            y: 240,
            font: 'pixeled',
            text: 'get to the\nexit',
            size: 30,
            align: 1, // 0:left, 1:centre, 2:right,
            add: true,
        });
        this.goToExitText.setTint(0x72e1fc);
        this.goToExitText.setX(this.cam.midPoint.x - (this.goToExitText.width/2));
        this.tweens.add({
            targets: this.goToExitText,
            x: 630, 
            y: 500,
            fontSize: 18,
            delay: 1000,
            duration: 300,
        });
    }
}