T = 20 // size of one tile

class Supermarket extends Phaser.Scene {
    constructor() {
        super({ key: "supermarket" });
        this.finishedScene = false;
    }

    preload() {
        // Loading Bar
        var midPoint = this.cameras.main.midPoint;
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

        this.load.bitmapFont('pixeled', './assets/fonts/pixeled/pixeled.png', './assets/fonts/pixeled/pixeled.fnt');
        this.load.spritesheet("pc_sp", "./assets/pc/pc_sp_spritesheet.png", { frameWidth: 40, frameHeight: 40, spacing: 2, });
        this.load.spritesheet("granny", "./assets/npcs/granny_spritesheet.png", {frameWidth: 40, frameHeight: 40, spacing: 2});
        this.load.tilemapTiledJSON("map", "./assets/tiles/supermarket/supermarket.json");
        this.load.image("tiles", "./assets/tiles/supermarket/supermarket_tileset.png");
        this.load.spritesheet("checkout", "./assets/tiles/supermarket/checkout.png", { frameWidth: 40, frameHeight: 80, spacing: 1 });
        this.load.image("sign_bogroll", "/assets/tiles/supermarket/sign_bogroll.png");
        this.load.image("sign_milk", "/assets/tiles/supermarket/sign_milk.png");
        this.load.image("sign_bread", "/assets/tiles/supermarket/sign_bread.png");
        this.load.image("bogroll", "/assets/tiles/supermarket/bogroll.png");
        this.load.image("milk", "/assets/tiles/supermarket/milk.piko");
        this.load.image("bread", "/assets/tiles/supermarket/bread.png");
        this.load.image("door", "/assets/tiles/supermarket/door.png");
        this.load.audio("collect", "./assets/sounds/collectItem.wav");
        this.load.audio("kaching", "./assets/sounds/kaching.wav");

        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    }

    create() {
        function coord(n) {
            // get pixel coordinates from tile coordinates
            return (n * T) + (T / 2)
        }

        // draw the map
        var map = this.make.tilemap({ key: "map" });
        this.map = map;
        var tiles = map.addTilesetImage('supermarket_tileset', 'tiles', T, T, 1, 2);
        var floor = map.createStaticLayer('floor', tiles);
        var obstacles = map.createStaticLayer('stuff', tiles);
        obstacles.setCollisionByExclusion([-1]);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // camera setup
        var cam = this.cameras.main;
        cam.setZoom(3);
        cam.setRoundPixels(true);
        cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cam = cam;

        // place door
        var door = this.physics.add.image(coord(5), coord(29), 'door');

        // instantiate player
        var pc = this.physics.add.sprite(coord(5), coord(29), 'pc_sp', 0);
        pc.moveSpeed = 100;
        pc.setCollideWorldBounds(true);
        pc.body.setCircle(18, 3, 3);
        pc.setScale(0.5);
        pc.setDepth(2);
        pc.isMoving = function() {
            let v = pc.body.velocity;
            return Boolean(v.x || v.y);
        }
        cam.startFollow(pc);
        pc.controlsEnabled = true;
        this.physics.add.collider(pc, obstacles);
        this.pc = pc;

        // player aura
        var aura = this.add.graphics();
        aura.fillStyle("0x00BFFF");
        aura.fillCircle(pc.x, pc.y, 30);
        aura.setAlpha(0.2);
        aura.setDepth(1);

        this.tweens.add({
            targets: aura,
            alpha: 0,
            duration: 1000,
            loop: -1,
            yoyo: true,
        });

        this.physics.add.existing(aura);
        aura.body.setCircle(30, pc.x-30, pc.y-30);
        this.aura = aura;

        // place checkouts
        var checkouts = this.physics.add.staticGroup();
        for (let i = 16; i < 36; i = i + 3) {
            let checkout = this.physics.add.sprite(coord(i) + 10, coord(26) + 10, 'checkout', 0);
            checkout.body.setSize(38, 78);
            checkout.body.setImmovable(true);
            this.physics.add.collider(pc, checkout);

            let animName = "checkout_" + i.toString();
            this.anims.create({
                key: animName,
                frames: this.anims.generateFrameNumbers("checkout", { frames: [0, 1] }),
                frameRate: 5,
                repeat: -1,
            });

            checkout.anims.play(animName);
            checkouts.add(checkout);
        }
        this.checkouts = checkouts;

        // place signs and collectibles
        this.signs = this.physics.add.staticGroup();
        pc.collectedBogroll = false;
        pc.collectedMilk = false;
        pc.collectedBread = false;

        this.signs.add(this.physics.add.sprite(coord(19.5), coord(15), "sign_bogroll"));
        var bogroll = this.physics.add.sprite(coord(19.5), coord(16), "bogroll");
        this.physics.add.collider(pc, bogroll, function(pc, bogroll){
            console.log('got bogroll');
            bogroll.destroy();
            pc.collectedBogroll = true;
            pc.scene.sound.play('collect');
        });

        this.signs.add(this.physics.add.sprite(coord(7), coord(7), "sign_milk"));
        var milk = this.physics.add.sprite(coord(8.5), coord(7), "milk");
        this.physics.add.collider(pc, milk, function(pc, milk){
            console.log('got milk');
            milk.destroy();
            pc.collectedMilk = true;
            pc.scene.sound.play('collect');
        });
      
        this.signs.add(this.physics.add.sprite(coord(33), coord(2), "sign_bread"));
        var bread = this.physics.add.sprite(coord(35), coord(2), "bread");
        this.physics.add.collider(pc, bread, function(pc, bread){
            console.log('got bread');
            bread.destroy();
            pc.collectedBread = true;
            pc.scene.sound.play('collect');
        });

        this.signs.getChildren().forEach(function(sign) {
            sign.setImmovable();
            sign.scene.physics.add.collider(pc, sign);
        });

        // if you get the three things, you can check out
        pc.hasCheckedOut = false;

        this.checkoutZone = this.add.zone(coord(15), coord(27), T*20, 1);
        this.physics.add.existing(this.checkoutZone).setVisible(true);
        this.physics.add.overlap(pc, this.checkoutZone, function(pc, checkoutZone){
            if(pc.collectedBread && pc.collectedMilk && pc.collectedBogroll ){

                pc.hasCheckedOut = true;
                pc.controlsEnabled = false;
                pc.setVelocity(0,0);
                pc.anims.stop();
                pc.setFrame(2);
                pc.setFlipX(true);

                console.log('checked out');
                pc.scene.sound.play('kaching');
                checkoutZone.destroy();

                pc.scene.time.addEvent({
                    callback: ()=>{pc.controlsEnabled = true},
                    callbackScope: this,
                    delay: 1000,
                });
            }
        });

        // if you have checked out, you can go to the exit and win
        this.physics.add.overlap(pc, door, function(pc, door){
            if(pc.hasCheckedOut){
                console.log('win');
            };
        })

        // pc anims
        var FRAMERATE = 5;
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers("pc_sp", { frames: [0, 1] }),
            frameRate: FRAMERATE,
            repeat: -1,
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers("pc_sp", { frames: [4, 5] }),
            frameRate: FRAMERATE,
            repeat: -1,
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers("pc_sp", { frames: [3, 10] }),
            frameRate: FRAMERATE,
            repeat: -1,
        });
        this.anims.create({
            key: 'l/r',
            frames: this.anims.generateFrameNumbers("pc_sp", { frames: [6, 8] }),
            frameRate: FRAMERATE,
            repeat: -1,
        });

        this.pc.anims.play('idle');

        // spawn other shoppers
        this.shoppers = this.physics.add.group()
        this.nShoppers = 0;

        let paths = [
            [[[5, 22], [5, 10], [3,10], [3,22]], 20000],
            [[[17, 9], [17, 14], [21, 14], [21, 24], [18, 24], [18, 17], [21, 17], [21, 9]], 30000],
            [[[22, 17], [22, 9], [17, 9], [17, 14], [22, 14], [22, 24], [18, 24], [18, 17]], 30000],
            [[[26, 14], [26, 8], [31, 8], [31, 14]], 10000],
            [[[26, 3], [36,3]], 15000],
            [[[34, 8], [34, 18], [30, 18], [30, 24], [36,24], [36, 8]], 30000],
            [[[26, 23], [26, 16]], 7000],
            [[[9,9], [9, 17], [13, 17], [13,9]], 16000],
            [[[13, 18], [13,26], [8,26], [8,18]], 16000],
        ];

        for (let obj of paths){
            let [path, duration] = obj;
            path = path.map((x)=>{return x.map(coord)});
            this.spawnShopper(path, duration);
        }
    }

    update() {
        var pc = this.pc;

        this.aura.setPosition(pc.x - 110, pc.y - 590);

        if (pc.controlsEnabled) {
            if (this.downKey.isDown) {
                if (!this.leftKey.isDown && !this.rightKey.isDown) {
                    pc.setFlipX(false);
                    pc.anims.play('down', true);
                }
                pc.setVelocityY(pc.moveSpeed);
            } else if (this.upKey.isDown) {
                if (!this.leftKey.isDown && !this.rightKey.isDown) {
                    pc.setFlipX(false);
                    pc.anims.play('up', true);
                }
                pc.setVelocityY(-pc.moveSpeed);
            } else {
                pc.setVelocityY(0);
            }

            if (this.leftKey.isDown) {
                pc.setFlipX(false);
                pc.anims.play('l/r', true);
                pc.setVelocityX(-pc.moveSpeed);
            } else if (this.rightKey.isDown) {
                pc.setFlipX(true);
                pc.anims.play('l/r', true);
                pc.setVelocityX(pc.moveSpeed);
            } else {
                pc.setVelocityX(0);
            }

            if (!pc.isMoving()) {
                pc.setFlipX(false);
                pc.anims.play('idle', true);
            }
        }

        this.shoppers.getChildren().forEach(this.updateShopper);
    }

    spawnShopper(path, duration) {
        let [x, y] = path.shift();

        var myPath = new Phaser.Curves.Path(x, y);
        path.forEach(
            (v)=>{myPath.lineTo(v[0], v[1])}
        )
        myPath.lineTo(x, y);

        var modelPool = ['granny'];
        var model = Phaser.Math.RND.pick(modelPool);
        var shopper = this.add.follower(myPath, x, y, model);
        shopper.setScale(0.5);
        this.shoppers.add(shopper);

        shopper.animName = "shopper_" + this.nShoppers.toString();
        this.nShoppers++;
        this.anims.create({
            key: shopper.animName + "_down",
            frames: this.anims.generateFrameNumbers(model, { frames: [0,1] }),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: shopper.animName + "_up",
            frames: this.anims.generateFrameNumbers(model, { frames: [4,5] }),
            frameRate: 5,
            repeat: -1,
        });
        this.anims.create({
            key: shopper.animName + "_l/r",
            frames: this.anims.generateFrameNumbers(model, { frames: [2,3] }),
            frameRate: 5,
            repeat: -1,
        });

        shopper.startFollow({
            positionOnPath: true,
            duration: duration,
            repeat: -1,
            rotateToPath: false,
        });

        shopper.lastPosition = shopper.pathVector;

        this.physics.add.existing(shopper);
        shopper.body.setCircle(15, 8, 8);
        this.physics.add.collider(shopper, this.pc);
        this.physics.add.overlap(shopper, this.aura, function(shopper, aura){
            let scene = shopper.scene;
                if(!scene.finishedScene){   
                    scene.pc.controlsEnabled = false;
                    scene.pc.setVelocity(0,0);
                    scene.pc.setActive(false);
                    scene.shoppers.getChildren().forEach((x)=>{x.setActive(false)});
                    var tooClose = scene.add.bitmapText(0, scene.cam.midPoint.y - 50, 'pixeled', 'Too Close!', 18);
                    tooClose.setX(scene.cam.midPoint.x - (tooClose.width / 2));
                    scene.cam.fadeOut(3000);
                    scene.finishedScene = true;
                }
        });
    }

    updateShopper(shopper){
        let deltaX = shopper.lastPosition.x - shopper.pathVector.x;
        let deltaY = shopper.lastPosition.y - shopper.pathVector.y;

        if(deltaY < 0){
            shopper.anims.play(shopper.animName + "_down", true);
            shopper.setFlipX(false);
        } else if(deltaY > 0){
            shopper.anims.play(shopper.animName + "_up", true);
            shopper.setFlipX(false);
        } else if(deltaX < 0){
            shopper.anims.play(shopper.animName + "_l/r", true);
            shopper.setFlipX(true);
        } else if(deltaX > 0){
            shopper.anims.play(shopper.animName + "_l/r", true);
            shopper.setFlipX(false);
        } else {
            shopper.anims.play(shopper.animName + "_down", true);
            shopper.setFlipX(false);
        }

        shopper.lastPosition = new Phaser.Math.Vector2(shopper.pathVector); 
    }
}