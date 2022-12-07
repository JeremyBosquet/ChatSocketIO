import React from 'react'
import Phaser from 'phaser'



export default class PongScene extends Phaser.Scene {
  playerAPos: {x: number, y:number, percentx:number, percenty: number} = {x: 25, y: 50, percentx: 0, percenty: 0}
  playerBPos: {x: number, y:number, percentx:number, percenty: number} = {x: 75, y: 50, percentx: 0, percenty: 0}
  ballPos: {x: number, y:number, percentx:number, percenty: number} = {x: 50, y: 50, percentx: 0, percenty: 0}
  grid: any
  paddleA: any
  paddleB: any
  ball: any
  cursors: any
  constructor() {
    super('pong')
  }
  PongResize(e : any)
  {
    console.log("Uwu", this.playerAPos, this.playerBPos, this.ballPos);
    // Update playerA position
    this.playerAPos.x = this.playerAPos.percentx * e._width;
    this.playerAPos.y = this.playerAPos.percenty * e._height;
    // Update playerB position
    this.playerBPos.x = this.playerBPos.percentx * e._width;
    this.playerBPos.y = this.playerBPos.percenty * e._height;
    // Update ball position
    this.ballPos.x = this.ballPos.percentx * e._width;
    this.ballPos.y = this.ballPos.percenty * e._height;

    if (this.paddleA != null)
      this.paddleA.setPosition(this.playerAPos.x, this.playerAPos.y);
    if (this.paddleB != null)
      this.paddleB.setPosition(this.playerBPos.x, this.playerBPos.y);
    if (this.ball != null)
      this.ball.setPosition(this.ballPos.x, this.ballPos.y);

  }
  preload() {
    this.load.image('ball', '/b.png')  
    this.load.image('paddle', '/a.png')

    //Desactive gravity
    this.physics.world.gravity.y = 0
    this.scale.on('resize', this.PongResize, this)
    
  }

  create() {
    //Create a grid
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.paddleA = this.physics.add.image(this.game.scale.width * 0.15,this.game.scale.height / 2, 'paddle')
    this.paddleA.setCollideWorldBounds(true)
    this.paddleA.setImmovable(true)
    this.paddleA.setBounce(1)
    this.paddleA.setVelocityY(0)
    this.paddleA.setVelocityX(0)
    this.paddleA.setDisplaySize(50, 100)

    this.paddleB = this.physics.add.image(this.game.scale.width * 0.85, this.game.scale.height / 2, 'paddle')
    this.paddleB.setCollideWorldBounds(true)
    this.paddleB.setImmovable(true)
    this.paddleB.setBounce(1)
    this.paddleB.setVelocityY(0)
    this.paddleB.setVelocityX(0)
    this.paddleB.setDisplaySize(50, 100)

    this.ball = this.physics.add.image(this.game.scale.width / 2, this.game.scale.height / 2, 'ball')
    this.ball.setCollideWorldBounds(true)
    this.ball.setBounce(1)
    this.ball.setVelocityY(0)
    this.ball.setVelocityX(0)
    this.ball.setDisplaySize(50, 50)

    this.playerAPos.x = this.game.scale.width * 0.15;
    this.playerAPos.y = this.game.scale.height / 2;
    this.playerAPos.percentx = 0.15;
    this.playerAPos.percenty = 0.5;
    this.playerBPos.x = this.game.scale.width * 0.85;
    this.playerBPos.y = this.game.scale.height / 2;
    this.playerBPos.percentx = 0.85;
    this.playerBPos.percenty = 0.5;
    this.ballPos.x = this.game.scale.width / 2;
    this.ballPos.y = this.game.scale.height / 2;
    this.ballPos.percentx = 0.5;
    this.ballPos.percenty = 0.5;

    // add particles to the ball
    //this.ball.particles = this.add.particles('ball')
    //this.ball.emitter = this.ball.particles.createEmitter({
    //  speed: 100,
    //  scale: { start: 1, end: 0 },
    //  blendMode: 'ADD'
    //})


    // On resize, update the camera AND the physics world bounds
    
  }

  update() {
    // TODO
    this.cameras.main.setSize(window.innerWidth, window.innerHeight)
    this.physics.world.setBounds(0, 0, window.innerWidth, window.innerHeight)
    if (this.cursors.up.isDown) {
      this.paddleA.setVelocityY(-500)
    }
    else if (this.cursors.down.isDown) {
      this.paddleA.setVelocityY(500)
    }
    else {
      this.paddleA.setVelocityY(0)
    }
    // detect mouse position
    if (this.input.mousePointer.y - 50 <= 0)
    {
      this.paddleB.y = 50;
    }
    else if (this.input.mousePointer.y + 50 > this.game.scale.height)
    {
      this.paddleB.y = this.game.scale.height - 50;
    }
    else
     this.paddleB.y = this.input.mousePointer.y


  }
}

