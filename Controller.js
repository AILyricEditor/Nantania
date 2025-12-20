import AnimatedMovement from "./AnimatedMovement.js";

/* Controller class for handling keyboard input */

// HeroMovement now extends AnimatedMovement and adds keyboard input
export default class Controller extends AnimatedMovement {
  constructor(scene, entity, animations, speed = 150) {
    super(entity, animations, speed);

    this.scene = scene;

    // Track keys pressed
    this.keysDownStack = new Set([]);
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
      this.keysDownStack.add(event.code);
    });

    scene.input.keyboard.on("keyup", (event) => {
      this.keysDownStack.delete(event.code);
    });
  }

  update() {
    // Determine last pressed key still held
    let moveDirection = null;
    let iterable = [...this.keysDownStack];
    for (let i = this.keysDownStack.size - 1; i >= 0; i--) {
      const dir = this.keyToDirection[iterable[i]];
      if (dir) {
        moveDirection = dir;
        break;
      }
    }

    // Delegate movement and animation to AnimatedMovement
    this.move(moveDirection);
  }
}
