import Phaser from "phaser";
import Controller from "./Controller.js"; // Optional if you keep them separate
import AnimatedMovement from "./AnimatedMovement.js"; // Optional if you keep them separate

// Base Entity class
class Entity {
  constructor(scene, x, y, texture, animations, speed = 150, scale = 2) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setScale(scale);
    this.sprite.setDepth(2); // Places entities on top of the map
    this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST); // Makes pixels crisp
    this.speed = speed;

    // Ensure entities stay inside canvas
    this.sprite.setCollideWorldBounds(true);

    this.movement = new AnimatedMovement(this.sprite, animations, speed);

    // TODO
    // Automatically collide with collision layer if exists
    // if (scene.collisionLayer) {
    //   scene.physics.add.collider(this.sprite, scene.collisionLayer);
    // }
  }

  update() {
    // Default: just delegate movement
  }
}

// Hero class (input-controlled)
class Hero extends Entity {
  constructor({scene, x, y, texture, animations, speed = 150, scale = 2} = {}) {
    super(scene, x, y, texture, animations, speed, scale);
    this.movement = new Controller(scene, this.sprite, animations, speed);
  }

  update() {
    this.movement.update();
  }
}

// Monster class (AI-controlled)
class Monster extends Entity {
  constructor({scene, x, y, texture, animations, speed = 100, scale = 2} = {}) {
    super(scene, x, y, texture, animations, speed, scale);
    this.directions = ["left", "right", "up", "down", "stop"];
    this.currentDirection = Phaser.Math.RND.pick(this.directions);
    this.interval = 0;
  }

  update() {
    this.interval++;
    if (this.interval > 60) { // Change direction every 2 seconds
      this.currentDirection = Phaser.Math.RND.pick(this.directions);
      this.interval = 0;
    }

    if (this.currentDirection !== "stop") {
      this.movement.move(this.currentDirection);
    } else {
      this.movement.stop();
    }
  }
}

// Phaser scene setup
let hero, skeleton;

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 640,
  backgroundColor: "#87CEEB",
  physics: { default: "arcade", arcade: { debug: true } },
  scene: { preload, create, update },
};

function autoCreateAnimations({scene, key, prefix, frames}) {
  for (const anim in frames) {
    const { start, end, frameRate = 10 } = frames[anim];
    scene.anims.create({
      key: `${prefix}-${anim}`,
      frames: scene.anims.generateFrameNumbers(key, { start, end }),
      frameRate,
      repeat: -1
    });
  }
}

function preload() {
  this.load.tilemapTiledJSON("map", "assets/maps/lvl1.json");
  this.load.image("TS1", "assets/tiles/Grass-Cliffs.png");
  this.load.image("TS2", "assets/tiles/Collision.png");
  this.load.spritesheet("hero", "assets/hero/Hero.png", { frameWidth: 32, frameHeight: 32 });
  this.load.spritesheet("skeleton", "assets/monsters/Skeleton.png", { frameWidth: 32, frameHeight: 32 });
}

function create() {
  const map = this.make.tilemap({ key: "map" });
  const grassCliffsTS = map.addTilesetImage("Grass-Cliffs", "TS1");
  const collisionTS = map.addTilesetImage("Collision", "TS2");
  const layer1 = map.createLayer("Layer 1", grassCliffsTS, 0, 0);
  const layer2 = map.createLayer("Layer 2", grassCliffsTS, 0, 0);
  // const collisionLayer = map.createLayer("Collision", collisionTS, 0, 0);
  // collisionLayer.setVisible(false);

  // Mark collidable tiles
  // collisionLayer.setCollisionByProperty({ collides: true });

  // Save in scene for entity use
  // this.collisionLayer = collisionLayer;

  layer1.setDepth(0);
  layer2.setDepth(0);
  // collisionLayer.setDepth(1);

  const heroFrames = {
    "walk-down": { start: 18, end: 23 },
    "walk-right": { start: 24, end: 29 },
    "walk-up": { start: 30, end: 35 },
    "idle-down": { start: 0, end: 5 },
    "idle-right": { start: 6, end: 11 },
    "idle-up": { start: 12, end: 17 },
  };

  autoCreateAnimations({scene: this, key: "hero", prefix: "hero", frames: heroFrames});

  const skeletonFrames = {
    "walk-down": { start: 18, end: 23 },
    "walk-right": { start: 24, end: 29 },
    "walk-up": { start: 30, end: 35 },
    "idle-down": { start: 0, end: 5 },
    "idle-right": { start: 6, end: 11 },
    "idle-up": { start: 12, end: 17 },
  };

  // TODO: Make adding animations more modular and less repetitive
  autoCreateAnimations({scene: this, key: "skeleton", prefix: "skeleton", frames: skeletonFrames});

  // Create entities
  hero = new Hero({scene: this, x: 100, y: 100, texture: "hero", animations: {
    walk: {
      up: "hero-walk-up",
      down: "hero-walk-down",
      right: "hero-walk-right",
    },
    idle: {
      up: "hero-idle-up",
      down: "hero-idle-down",
      right: "hero-idle-right",
    }
  }, speed: 150});

  skeleton = new Monster({scene: this, x: 300, y: 500, texture: "skeleton", animations: {
    walk: {
      up: "skeleton-walk-up",
      down: "skeleton-walk-down",
      right: "skeleton-walk-right",
    },
    idle: {
      up: "skeleton-idle-up",
      down: "skeleton-idle-down",
      right: "skeleton-idle-right",
    },
  }, speed: 80});

  // Collide with collision layer
  // this.physics.add.collider(hero.sprite, collisionLayer);
  // this.physics.add.collider(skeleton.sprite, collisionLayer);

  // Optional: collide hero with monsters
  this.physics.add.collider(hero.sprite, skeleton.sprite);
}


function update() {
  hero.update();
  skeleton.update();
}

new Phaser.Game(config);
