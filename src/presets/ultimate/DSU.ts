import dsu_p1 from '/arena/dsu-p1.png';
import dsu_p2a from '/arena/dsu-p2a.png';
import dsu_p2b from '/arena/dsu-p2b.png';
import dsu_p3 from '/arena/dsu-p3.png';
import dsu_p4 from '/arena/dsu-p4.png';
import dsu_p5 from '/arena/dsu-p5.png';
import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: dsu_p1,
};

const PRESET_2A: ArenaPreset = {
    name: 'Phase 2a',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: dsu_p2a,
};

const PRESET_2B: ArenaPreset = {
    name: 'Phase 2b',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: dsu_p2b,
};

const PRESET_3: ArenaPreset = {
    name: 'Phase 3',
    shape: ArenaShape.Rectangle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: dsu_p3,
};

const PRESET_4: ArenaPreset = {
    name: 'Phase 4',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: dsu_p4,
};

const PRESET_5: ArenaPreset = {
    name: 'Phase 5',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: dsu_p5,
};

export const ARENA_PRESETS_ULTIMATE_DSU = [PRESET_1, PRESET_2A, PRESET_2B, PRESET_3, PRESET_4, PRESET_5];
