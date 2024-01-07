export interface JobProps {
    name: string;
    icon: string;
}

export enum Job {
    RoleAny,
    RoleTank,
    RoleHealer,
    RoleDps,
    RoleMelee,
    RoleRanged,
    RoleMagicRanged,
    RolePhysicalRanged,
    Paladin,
    Warrior,
    DarkKnight,
    Gunbreaker,
    WhiteMage,
    Scholar,
    Astrologian,
    Monk,
    Dragoon,
    Ninja,
    Reaper,
    Sage,
    Samurai,
    Bard,
    Machinist,
    Dancer,
    BlackMage,
    Summoner,
    RedMage,
}

const JOBS: Record<Job, JobProps> = {
    [Job.RoleAny]: { name: 'Any player', icon: 'any.png' },
    [Job.RoleTank]: { name: 'Tank', icon: 'tank.png' },
    [Job.RoleHealer]: { name: 'Healer', icon: 'healer.png' },
    [Job.RoleDps]: { name: 'DPS', icon: 'dps.png' },
    [Job.RoleMelee]: { name: 'Melee DPS', icon: 'melee.png' },
    [Job.RoleRanged]: { name: 'Ranged DPS', icon: 'ranged.png' },
    [Job.RoleMagicRanged]: { name: 'Magic Ranged DPS', icon: 'magic_ranged.png' },
    [Job.RolePhysicalRanged]: { name: 'Physical Ranged DPS', icon: 'physical_ranged.png' },
    [Job.Paladin]: { name: 'Paladin', icon: 'PLD.png' },
    [Job.Warrior]: { name: 'Warrior', icon: 'WAR.png' },
    [Job.DarkKnight]: { name: 'Dark Knight', icon: 'DRK.png' },
    [Job.Gunbreaker]: { name: 'Gunbreaker', icon: 'GNB.png' },
    [Job.WhiteMage]: { name: 'White Mage', icon: 'WHM.png' },
    [Job.Scholar]: { name: 'Scholar', icon: 'SCH.png' },
    [Job.Astrologian]: { name: 'Astrologian', icon: 'AST.png' },
    [Job.Sage]: { name: 'Sage', icon: 'SGE.png' },
    [Job.Monk]: { name: 'Monk', icon: 'MNK.png' },
    [Job.Dragoon]: { name: 'Dragoon', icon: 'DRG.png' },
    [Job.Ninja]: { name: 'Ninja', icon: 'NIN.png' },
    [Job.Reaper]: { name: 'Reaper', icon: 'RPR.png' },
    [Job.Samurai]: { name: 'Samurai', icon: 'SAM.png' },
    [Job.Bard]: { name: 'Bard', icon: 'BRD.png' },
    [Job.Machinist]: { name: 'Machinist', icon: 'MCH.png' },
    [Job.Dancer]: { name: 'Dancer', icon: 'DNC.png' },
    [Job.BlackMage]: { name: 'Black Mage', icon: 'BLM.png' },
    [Job.Summoner]: { name: 'Summoner', icon: 'SMN.png' },
    [Job.RedMage]: { name: 'Red Mage', icon: 'RDM.png' },
};

export function getJob(job: Job): JobProps {
    const props = JOBS[job];
    if (props === undefined) {
        throw new Error('Unknown job');
    }

    return props;
}

export function getJobIconUrl(icon: string): string {
    return `./actor/${icon}`;
}
