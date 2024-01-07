import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';
import { SPOKES_45_DEGREES } from '../Components';
import e8 from '/arena/e8.png';

const PRESET_2: ArenaPreset = {
    name: "Eden's Gate: Descent (E2)",
    shape: ArenaShape.Rectangle,
    width: 400,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Rectangular,
        rows: 6,
        columns: 4,
    },
};

const PRESET_5: ArenaPreset = {
    name: "Eden's Verse: Fulmination (E5)",
    shape: ArenaShape.Rectangle,
    width: 860,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.CustomRectangular,
        rows: [-200, -100, 0, 100, 200],
        columns: [-170, -85, 85, 170],
    },
};

const PRESET_8: ArenaPreset = {
    name: "Eden's Verse: Refulgence (E8)",
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.CustomRadial,
        rings: [120, 240],
        spokes: SPOKES_45_DEGREES,
    },
    backgroundImage: e8,
    backgroundOpacity: 65,
};

const PRESET_12: ArenaPreset = {
    name: "Eden's Promise: Eternity (E12)",
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: {
        type: GridType.Radial,
        angularDivs: 16,
        radialDivs: 2,
    },
};

export const ARENA_PRESETS_SAVAGE_EDEN = [PRESET_2, PRESET_5, PRESET_8, PRESET_12];
