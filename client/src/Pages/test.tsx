import React, { useEffect } from "react";
import Phaser from 'phaser'
import HelloWorldScene from './Scenes/HelloWorldScene'
import useEventListener from "@use-it/event-listener";
import PongScene from "./Scenes/PongScene";

function TestPage() {
    const [game, setGame] = React.useState<Phaser.Game>();
    useEffect(() => {
        if (game)
            game.destroy(true);
        const config : Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: 'phaser-container',
            backgroundColor: '#282c34',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                // Do not change item position when resizing
                // https://photonstorm.github.io/phaser3-docs/Phaser.Scale.ScaleManager.html#setResizeCallback__anchor
                width: window.innerWidth,
                height: window.innerHeight
            },
            physics: {
              default: 'arcade',
              arcade: {
                gravity: { y: 200 },
              },
            },
            scene: [PongScene],
          }
        setGame(new Phaser.Game(config));
        // Change paddleA position
        if (game)
        {
            //game.scene.keys['PongScene'].paddleA.y = 100;

        }
        // Listen for resize events
        //useEventListener('resize', () => {
        //    game?.scale.resize(window.innerWidth, window.innerHeight);
        //    game?.scale.refresh();
        //}
        //);

        // Destroy game on cleanup
        return () => game?.destroy(true);

    }, []);
    return (
        <>
        fps : {game?.loop.actualFps}
        </>
    )
}

export default TestPage;