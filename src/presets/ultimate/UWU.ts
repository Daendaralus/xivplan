import uwu_p3a from '/arena/uwu-p3a.png';
import uwu_p3b from '/arena/uwu-p3b.png';
import uwu_p3c from '/arena/uwu-p3c.png';
import uwu_p5 from '/arena/uwu-p5.png';
import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_3A: ArenaPreset = {
    name: 'Phase 3a',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: uwu_p3a,
};

const PRESET_3B: ArenaPreset = {
    name: 'Phase 3b',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: uwu_p3b,
};

const PRESET_3C: ArenaPreset = {
    name: 'Phase 3c',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: uwu_p3c,
};

const PRESET_5: ArenaPreset = {
    name: 'Phase 5',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: uwu_p5,
};

export const ARENA_PRESETS_ULTIMATE_UWU = [PRESET_3A, PRESET_3B, PRESET_3C, PRESET_5];
