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
    scene: [Clap]
    // scene: [Title, Home, HomeHUD, Interaction, Exercise]
}

var game = new Phaser.Game(config);
