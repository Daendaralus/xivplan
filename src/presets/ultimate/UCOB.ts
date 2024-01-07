import ucob_p3 from '/arena/ucob-p3.png';
import ucob_p4 from '/arena/ucob-p4.png';
import { ArenaPreset, ArenaShape, DEFAULT_ARENA_PADDING, GridType } from '../../scene';

const PRESET_3: ArenaPreset = {
    name: 'Phase 3',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: ucob_p3,
};

const PRESET_4: ArenaPreset = {
    name: 'Phase 4',
    shape: ArenaShape.Circle,
    width: 600,
    height: 600,
    padding: DEFAULT_ARENA_PADDING,
    grid: { type: GridType.None },
    backgroundImage: ucob_p4,
};

export const ARENA_PRESETS_ULTIMATE_UCOB = [PRESET_3, PRESET_4];
