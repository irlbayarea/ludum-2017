// Forces webpack to inline the files in this precise order.
import 'p2';
import 'pixi';
// tslint:disable-next-line:ordered-imports
import 'phaser';
// End force webpack inline.

import * as phaser from 'phaser-ce';
import * as common from './common';

import Boot from './ui/states/boot';
import { generateMap } from './map/generator';
import Main from './ui/states/main';
import PeriodicCrisisGenerator from './crisis/periodic_crisis_generator';
import ICrisisGenerator from './crisis/crisis_generator';
import GameEvents from './game_events';
import { jsonCrises } from './crisis/crises';
import CrisisSerializer from './crisis/crisis_serializer';

class Game extends phaser.Game {
  public crisisGenerator: ICrisisGenerator;
  public gameEvents: GameEvents;

  constructor() {
    super({
      height: common.globals.dimensions.height,
      parent: '',
      renderer: phaser.AUTO,
      resolution: 1,
      width: common.globals.dimensions.width,
    });

    this.gameEvents = new GameEvents();

    const crises = CrisisSerializer.unserializeAll(JSON.stringify(jsonCrises));
    this.crisisGenerator = new PeriodicCrisisGenerator(10000, crises);

    this.state.add('Boot', Boot);
    this.state.add('Main', Main);
    this.state.start('Boot');
  }
}

if (common.globals.debug) {
  const $DEBUG = {
    generateMap: () => generateMap(21, 21),
  };
  common.debug.log('Debugging enabled', common.globals.dimensions);
  common.debug.log('Experiments enabled', common.globals.experiments);
  common.debug.log(
    'See the "$D" object for helper functions',
    Object.keys($DEBUG)
  );
  (window as any).$D = $DEBUG;
}

export const game = new Game();
