import {
  WGL_SUPPORT,
  OFFLINE_MODE,
  LEFT, RIGHT, UP, DOWN,
  CONNECTION_URL, CONNECTION_PORT
} from "../cfg";

import Engine from "../Engine";
import Renderer from "../Engine/Renderer";
import Input  from "../Engine/Input";
import Connection from "../Engine/Connection";

import * as Events from "./input.js";
import * as entities from "./entities";
import * as scenes from "./scenes";

/**
 * Game
 * @class Game
 * @export
 */
export default class Game {

  /**
   * @constructor
   */
  constructor() {

    this.canvasNode = document.querySelector("#canvas");
    this.glNode = document.querySelector("#webgl");
    this.uiNode = document.querySelector("#ui");

    this.entities = entities;

    this.scenes = scenes;

    this.engine = new Engine(this);

    this.setup();

  }

  /**
   * Setup
   * @param {Number} stage
   */
  setup(stage = stage === void 0 ? 0 : stage) {

    switch (++stage) {
      case 1:
        this.addWorld(() => this.setup(stage));
      return void 0;
      case 2:
        this.addMap(() => this.setup(stage));
      return void 0;
      case 3:
        this.addEntities(() => this.setup(stage));
      return void 0;
      case 4:
        this.engine.renderer = new Renderer(this.engine);
        this.setup(stage);
      return void 0;
      case 5:
        this.animateNPC();
        this.setup(stage);
      return void 0;
      case 6:
        /** Instant focus local player */
        this.engine.camera.focus(this.engine.getEntityByProperty("Felix", "name"), true);
        this.setup(stage);
      return void 0;
      case 7:
        window.rAF(() => this.engine.renderer.render());
        this.setup(stage);
      return void 0;
      case 8:
        this.input = new Input(Events, this);
        this.setup(stage);
      return void 0;
      case 9:
        if (!OFFLINE_MODE) {
          this.engine.connection = new Connection(
            this,
            `${CONNECTION_URL}:${CONNECTION_PORT}`
          );
        }
      return void 0;
    };

    return void 0;

  }

  animateNPC() {
    setTimeout(this::function() {
      let entity = this.engine.getEntityByProperty("Joy", "name");
      let move = [LEFT, RIGHT, UP, DOWN][(Math.random() * 3) << 0];
      entity.move(move);
      this.animateNPC();
    }, 2e3);
  }

  /**
   * Add world
   * @param {Function} resolve
   */
  addWorld(resolve) {
    this.engine.addWorld("worlds/kanto/index.js", resolve);
  }

  /**
   * Add map
   * @param {Function} resolve
   */
  addMap(resolve) {
    this.engine.addMap("worlds/kanto/town/town.json", resolve);
  }

  /**
   * Add entities
   * @param {Function} resolve
   */
  addEntities(resolve) {

    let player = this.entities.Player;

    this.engine.addEntity(new player({ name: "Joy", map: "Town", x: 120, y: 120, sprite: "assets/img/200.png", width: 16, height: 16, collidable: true,
      onCollide: {
        JavaScript: function(entity, engine) {
          this.faceEntity(entity);
          console.log(engine.instance.notify(this, "Stop!"));
        }
      }
    }));

    this.engine.addEntity(new player({ name: "Merlin", map: "Town", x: 176, y: 152, sprite: "assets/img/85.png", width: 16, height: 16, collidable: true, shadowY: -3,
      onAction: {
        EngelScript: `
          if (trigger.facing == 2 || trigger.facing == 3) {
            FLAGS.COUNTER += 1;
          } {
            FLAGS.COUNTER -= 1;
          }
          kernel.notify(this, '+' + FLAGS.COUNTER + " ");
          this.faceEntity(trigger);
        `
      }
    }));

    this.engine.addEntity(new player({ name: "Merlin2", map: "Town", x: 168, y: 168, sprite: "assets/img/85.png", width: 16, height: 16, collidable: true, shadowY: -3,
      onCollide: {
        EngelScript: `
          kernel.notify(this, trigger.name);
        `
      }
    }));

    this.engine.addEntity(new player({
      name: "Mew", map: "Town",
      x: 0,
      y: 0, sprite: "assets/img/151.png",
      width: 16, height: 16,
      collidable: false,
      following: "Felix"
    }));

    if (OFFLINE_MODE) {
      this.engine.addEntity(new player({ name: "Felix", map: "Town", x: 152, y: 128, sprite: "assets/img/0.png", width: 16, height: 16, isLocalPlayer: true, collidable: true }));
    }

    return (resolve());

  }

}

window.game = new Game();