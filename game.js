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
    // scene: [Title, Home, HomeHUD, Interaction, Exercise, Clap]
    scene: [Clap]
}

var game = new Phaser.Game(config);
