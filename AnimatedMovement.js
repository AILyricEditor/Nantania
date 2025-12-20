/* This class handles the animated movement and idle states of a sprite in a Phaser game.
 It uses Phaser's animation system to manage the sprite's movements and idle states.
 The class also handles the horizontal flipping of the sprite based on the direction of movement.
*/

export default class AnimatedMovement {
  constructor(sprite, animations, speed = 150) {
    this.sprite = sprite;
    this.animations = animations;
    this.speed = speed;

    this.lastDirection = "down";
  }

  /**
   * Move the sprite in a specific direction.
   * direction: "left", "right", "up", "down" or null for idle
   */
  move(direction) {
    // Reset velocity
    if (this.sprite.body) this.sprite.body.setVelocity(0);

    if (direction) {
      // Set velocity
      if (this.sprite.body) {
        if (direction === "left") this.sprite.body.setVelocityX(-this.speed);
        if (direction === "right") this.sprite.body.setVelocityX(this.speed);
        if (direction === "up") this.sprite.body.setVelocityY(-this.speed);
        if (direction === "down") this.sprite.body.setVelocityY(this.speed);
      }

      // Handle horizontal flipping
      if (direction === "left") {
        this.sprite.setFlipX(true);
        this.sprite.anims.play(this.animations.walk[direction], true);
      } else {
        // IMPORTANT: Ensure that the animation names match the expected format (e.g., right: "walk-right")
        this.sprite.setFlipX(false);
        this.sprite.anims.play(this.animations.walk[direction], true);
      }

      this.lastDirection = direction;
    } else {
      this._playIdle();
    }
  }

  stop() {
    if (this.sprite.body) {
      this.sprite.body.setVelocity(0);
    }
    this._playIdle();
  }

  /**
   * Internal helper to play idle animation based on last direction
   */
  _playIdle() {
    let idleAnim;
    switch (this.lastDirection) {
      case "left":
        this.sprite.setFlipX(true);
        idleAnim = this.animations.idle.right;
        break;
      default:
        // IMPORTANT: Ensure that the animation names match the expected format (e.g., right: "idle-right")
        this.sprite.setFlipX(false);
        idleAnim = this.animations.idle[this.lastDirection];
    }
    this.sprite.anims.play(idleAnim, true);
  }
}