import top_p1 from '/arena/top-p1.png';
import top_p2 from '/arena/top-p2.png';
import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: top_p1,
};

const PRESET_2: ArenaPreset = {
    name: 'Phase 2',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: top_p2,
};

export const ARENA_PRESETS_ULTIMATE_TOP = [PRESET_1, PRESET_2];
