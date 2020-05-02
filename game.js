var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
        }
    },
    // scene: [Title, Home, HomeHUD, Interaction]
    scene: [Exercise]
}

var game = new Phaser.Game(config);
