import Phaser from "phaser";
import { HeroMovement, AnimatedMovement } from "./movement.js"; // Optional if you keep them separate

// Base Entity class
class Entity {
  constructor(scene, x, y, texture, animations, speed = 150, scale = 2, health = 100) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setScale(scale);
    this.sprite.setDepth(2); // Places entities on top of the map
    this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST); // Makes pixels crisp
    this.speed = speed;
    this.health = health;

    // Ensure entities stay inside canvas
    this.sprite.setCollideWorldBounds(true);

    this.movement = new AnimatedMovement(this.sprite, animations, speed);

    // COME BACK TO
    // Automatically collide with collision layer if exists
    // if (scene.collisionLayer) {
    //   scene.physics.add.collider(this.sprite, scene.collisionLayer);
    // }
  }

  move(direction) {
    this.movement.move(direction);
  }

  stop() {
    this.movement.stop();
  }

  update() {
    // Default: just delegate movement
  }
}

// Hero class (input-controlled)
class Hero extends Entity {
  constructor(scene, x, y, texture, animations, speed = 150, scale = 2) {
    super(scene, x, y, texture, animations, speed, scale);
    this.movement = new HeroMovement(scene, this.sprite, animations, speed);
  }

  update() {
    this.movement.update();
  }
}

// Monster class (AI-controlled)
class Monster extends Entity {
  constructor(scene, x, y, texture, animations, speed = 100, scale = 2) {
    super(scene, x, y, texture, animations, speed, scale);
    this.directions = ["left", "right", "up", "down", "stop", "death"];
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

function autoCreateAnimations(scene, key, prefix, frames) {
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
  const collisionLayer = map.createLayer("Collision", collisionTS, 0, 0);
  collisionLayer.setVisible(false);

  // Mark collidable tiles
  collisionLayer.setCollisionByProperty({ collides: true });

  // Save in scene for entity use
  this.collisionLayer = collisionLayer;

  layer1.setDepth(0);
  layer2.setDepth(0);
  collisionLayer.setDepth(1);

  const heroFrames = {
    "walk-down": { start: 18, end: 23 },
    "walk-right": { start: 24, end: 29 },
    "walk-up": { start: 30, end: 35 },
    "idle-down": { start: 0, end: 5 },
    "idle-right": { start: 6, end: 11 },
    "idle-up": { start: 12, end: 17 },
  };

  autoCreateAnimations(this, "hero", "hero", heroFrames);

  const skeletonFrames = {
    "walk-down": { start: 18, end: 23 },
    "walk-right": { start: 24, end: 29 },
    "walk-up": { start: 30, end: 35 },
    "idle-down": { start: 0, end: 5 },
    "idle-right": { start: 6, end: 11 },
    "idle-up": { start: 12, end: 17 },
    "death": { start: 36, end: 39, frameRate: 8 },
  };

  autoCreateAnimations(this, "skeleton", "skeleton", skeletonFrames);

  // Create entities
  hero = new Hero(this, 100, 100, "hero", {
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
  }, 150);

  skeleton = new Monster(this, 300, 500, "skeleton", {
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
  }, 80);

  // Enable collisions with the world bounds
  // hero.sprite.setCollideWorldBounds(true);
  // skeleton.sprite.setCollideWorldBounds(true);

  // Collide with collision layer
  this.physics.add.collider(hero.sprite, collisionLayer);
  this.physics.add.collider(skeleton.sprite, collisionLayer);

  // Optional: collide hero with monsters
  this.physics.add.collider(hero.sprite, skeleton.sprite);
}


function update() {
  hero.update();
  skeleton.update();
}

new Phaser.Game(config);
