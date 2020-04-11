var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            // debug: true,
        }
    },
    scene: [Home]
}

var game = new Phaser.Game(config);
