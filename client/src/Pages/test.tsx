import React, { useEffect } from "react";
import Phaser from 'phaser'
import HelloWorldScene from './Scenes/HelloWorldScene'
import useEventListener from "@use-it/event-listener";

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
              mode: Phaser.Scale.ScaleModes.RESIZE,
              width: 500,
              height: window.innerHeight - 500 ,
            },
            physics: {
              default: 'arcade',
              arcade: {
                gravity: { y: 200 },
              },
            },
            scene: [HelloWorldScene],
          }
        setGame(new Phaser.Game(config));
    }, []);
    function handleClick() {
        console.log("click");
        if (game)
        {
            const scene = game.scene.keys.helloworld as HelloWorldScene;
            scene.createEmitter();
        }
    }
    return (
        <div>
            hey
            <button className="App-button" onClick={handleClick}>
                Or click me
            </button>
        </div>
    )
}

export default TestPage;