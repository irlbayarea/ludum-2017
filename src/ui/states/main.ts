import * as Phaser from 'phaser-ce';
import { forIn } from 'lodash';

import Controller from '../../input/controller';
import MessagePanel from '../hud/message';

import * as common from '../../common';
import * as textures from '../../character/textures';

import { game } from '../../index';
import Character, { CharacterType } from '../../character/character';
import { generateMap, convertToTiles } from '../../map/generator';
import HudRenderer from '../hud/hud_renderer';
import { ITicker } from '../../ticker';

import * as demo from '../demo';
import { SpawnConfig } from '../../character/spawn_config';

/**
 * Main state (i.e. in the game).
 */
export default class Main extends Phaser.State {
  private alwaysOnTop: Phaser.Group;
  private hudRenderer: HudRenderer;

  public create(): void {
    // Enable keyboard.
    game.controller = new Controller(this.game);

    // Enable physics.
    game.physics.startSystem(Phaser.Physics.P2JS);

    // Enable HUD.
    this.alwaysOnTop = this.game.add.group();
    this.hudRenderer = new HudRenderer(
      game,
      this.game.plugins.add(MessagePanel, this.alwaysOnTop, game.controller)
    );
    game.hud = game.hud.setMessage('Welcome to Guard Captain');

    this.createDemos();
    this.createPlayerCharacter();
  }

  public preload(): void {
    game.worldState.setMap(this.createMap());
  }

  public update(): void {
    game.world.bringToTop(this.alwaysOnTop);
    game.worldState.update();

    const elapsed: number = game.time.elapsed;
    game.gameEvents.tick(elapsed);

    if (common.experiment('generators')) {
      game.generators.forEach((generator: ITicker) => generator.tick(elapsed));
    }

    if (game.hud.question) {
      if (game.controller.is1JustDown) {
        game.hud.question.callback(1);
        game.hud.clearQuestion();
        this.hudRenderer.setMessagePanelClearCountdown();
      } else if (game.controller.is2JustDown) {
        game.hud.question.callback(2);
        game.hud.clearQuestion();
        this.hudRenderer.setMessagePanelClearCountdown();
      } else if (game.controller.is3JustDown) {
        game.hud.question.callback(3);
        game.hud.clearQuestion();
        this.hudRenderer.setMessagePanelClearCountdown();
      } else if (game.controller.is4JustDown) {
        game.hud.question.callback(4);
        game.hud.clearQuestion();
        this.hudRenderer.setMessagePanelClearCountdown();
      }
    }

    // Render
    this.hudRenderer.render(game.hud);
  }

  private createPlayerCharacter(): void {
    const playerCharacterTemplate: Character = new Character(
      'Porgby',
      CharacterType.Player
    );
    const sc: SpawnConfig = new SpawnConfig(
      playerCharacterTemplate,
      textures.guard(game.armory),
      12,
      12
    );
    game.spawn(sc);
  }

  private createMap(): Phaser.Tilemap {
    // Initialize the physics system (P2).
    game.physics.startSystem(Phaser.Physics.P2JS);

    if (common.experiment('use-generated-map')) {
      return this.createGeneratedMap();
    } else {
      return this.createDefaultMap();
    }
  }

  private createDefaultMap(): Phaser.Tilemap {
    // Create the map.
    const map = game.add.tilemap('Tilemap');

    // Initialize Tilesets.
    forIn(
      {
        collision: 'collision',
        tiles: 'tiles',
      },
      (value, key) => map.addTilesetImage(value, key)
    );

    // Initialize Layers.
    const layers = ['terrain', 'foreground', 'collision', 'huts', 'spawns'].map(
      name => map.createLayer(name)
    );

    layers.forEach(layer => {
      layer.resizeWorld();
      layer.wrap = true;
    });

    const collision = layers[2];
    const huts = layers[3];
    const spawns = layers[4];
    collision.visible = false;
    huts.visible = false;
    spawns.visible = false;

    const p2 = this.game.physics.p2;
    map.setCollision(261, true, collision);
    p2.convertTilemap(map, collision, true, true);
    p2.setBoundsToWorld(true, true, true, true, false);
    p2.restitution = 0.2; // Bounciness. '1' is very bouncy.
    game.worldState.setCollisionFromTilemap(map, collision);

    return map;
  }

  private createGeneratedMap(): Phaser.Tilemap {
    const map = generateMap(43, 43);
    return convertToTiles(map, this.game, 'tiles');
  }

  private createDemos(): void {
    if (common.experiment('demo-armory')) {
      demo.armoryDemo(this.game);
    }
  }
}
