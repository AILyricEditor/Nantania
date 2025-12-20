// HeroMovement now extends AnimatedMovement and adds keyboard input
export class HeroMovement extends AnimatedMovement {
  constructor(scene, hero, animations, speed = 150) {
    super(hero, animations, speed);

    this.scene = scene;

    // Track keys pressed
    this.keysDownStack = [];
    this.keyToDirection = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down",
      KeyA: "left",
      KeyD: "right",
      KeyW: "up",
      KeyS: "down",
    };

    // Listen to keyboard events
    scene.input.keyboard.on("keydown", (event) => {
      if (!this.keysDownStack.includes(event.code)) this.keysDownStack.push(event.code);
    });

    scene.input.keyboard.on("keyup", (event) => {
      const index = this.keysDownStack.indexOf(event.code);
      if (index > -1) this.keysDownStack.splice(index, 1);
    });
  }

  update() {
    // Determine last pressed key still held
    let moveDirection = null;
    for (let i = this.keysDownStack.length - 1; i >= 0; i--) {
      const dir = this.keyToDirection[this.keysDownStack[i]];
      if (dir) {
        moveDirection = dir;
        break;
      }
    }

    // Delegate movement and animation to AnimatedMovement
    this.move(moveDirection);
  }
}
