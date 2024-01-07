import tea_p1 from '/arena/tea-p1.png';
import tea_p2 from '/arena/tea-p2.png';
import tea_p3 from '/arena/tea-p3.png';
import tea_p4 from '/arena/tea-p4.png';
import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_1: ArenaPreset = {
    name: 'Phase 1',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: tea_p1,
};

const PRESET_2: ArenaPreset = {
    name: 'Phase 2',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: tea_p2,
};

const PRESET_3: ArenaPreset = {
    name: 'Phase 3',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: tea_p3,
};

const PRESET_4: ArenaPreset = {
    name: 'Phase 4',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: tea_p4,
};

export const ARENA_PRESETS_ULTIMATE_TEA = [PRESET_1, PRESET_2, PRESET_3, PRESET_4];
