import React from 'react'
import Phaser from 'phaser'

export default class PongScene extends Phaser.Scene {
  grid: any
  paddleA: any
  paddleB: any
  ball: any
  cursors: any
  constructor() {
    super('pong')
  }

  preload() {
    this.load.image('ball', '/b.png')  
    this.load.image('paddle', '/a.png')

    //Desactive gravity
    this.physics.world.gravity.y = 0

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


  }
}

