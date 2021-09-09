import { IStyle, mergeStyleSets, Text, useTheme } from '@fluentui/react';
import React from 'react';
import { DrawArrow } from '../prefabs/Arrow';
import { EnemyCircle, EnemyHuge, EnemyLarge, EnemyMedium, EnemySmall } from '../prefabs/Enemies';
import { Waymark1, Waymark2, Waymark3, Waymark4, WaymarkA, WaymarkB, WaymarkC, WaymarkD } from '../prefabs/Markers';
import {
    PartyAny,
    PartyAstrologian,
    PartyBard,
    PartyBlackMage,
    PartyDancer,
    PartyDarkKnight,
    PartyDps,
    PartyDragoon,
    PartyGunbreaker,
    PartyHealer,
    PartyMachinist,
    PartyMagicRanged,
    PartyMelee,
    PartyMonk,
    PartyNinja,
    PartyPaladin,
    PartyPhysicalRanged,
    PartyRanged,
    PartyRedMage,
    PartySamurai,
    PartyScholar,
    PartySummoner,
    PartyTank,
    PartyWarrior,
    PartyWhiteMage,
} from '../prefabs/Party';
import {
    TetherClose,
    TetherDefault,
    TetherFar,
    TetherMinusMinus,
    TetherPlusMinus,
    TetherPlusPlus,
} from '../prefabs/Tethers';
import { ZoneCircle } from '../prefabs/zone/ZoneCircle';
import { ZoneCone } from '../prefabs/zone/ZoneCone';
import { ZoneDonut } from '../prefabs/zone/ZoneDonut';
import { ZoneExaflare } from '../prefabs/zone/ZoneExaflare';
import { ZoneEye } from '../prefabs/zone/ZoneEye';
import { ZoneFalloff } from '../prefabs/zone/ZoneFalloff';
import { ZoneKnockback } from '../prefabs/zone/ZoneKnockback';
import { ZoneLine } from '../prefabs/zone/ZoneLine';
import { ZoneLineKnockAway } from '../prefabs/zone/ZoneLineKnockAway';
import { ZoneLineKnockback } from '../prefabs/zone/ZoneLineKnockback';
import { ZoneLineStack } from '../prefabs/zone/ZoneLineStack';
import { ZoneMeteor } from '../prefabs/zone/ZoneMeteor';
import { ZoneRotateClockwise, ZoneRotateCounterClockwise } from '../prefabs/zone/ZoneRotate';
import { ZoneSquare } from '../prefabs/zone/ZoneSquare';
import { ZoneStack } from '../prefabs/zone/ZoneStack';
import { ZoneStarburst } from '../prefabs/zone/ZoneStarburst';
import { PANEL_PADDING } from './PanelStyles';
import { ObjectGroup, Section } from './Section';

const classNames = mergeStyleSets({
    root: {
        padding: PANEL_PADDING,
    } as IStyle,
    darken: {
        filter: 'brightness(0.85)',
    } as IStyle,
    usage: {
        marginTop: -8,
        marginBottom: 8,
        opacity: 0.7,
    } as IStyle,
});

export const ObjectsPanel: React.FunctionComponent = () => {
    // AOE zone icons don't have much contrast with light theme background.
    // Darken them a bit.
    const theme = useTheme();
    const zonesClass = theme.isInverted ? '' : classNames.darken;

    return (
        <div className={classNames.root}>
            <Section title="Zones">
                <ObjectGroup className={zonesClass}>
                    <ZoneExaflare />
                    <ZoneSquare />
                    <ZoneLine />
                    <ZoneCone />
                    <ZoneDonut />
                    <ZoneCircle />

                    <ZoneLineKnockAway />
                    <ZoneLineKnockback />
                    <ZoneKnockback />
                    <ZoneFalloff />
                    <ZoneLineStack />
                    <ZoneStack />

                    <ZoneStarburst />
                    <ZoneRotateClockwise />
                    <ZoneRotateCounterClockwise />
                    <ZoneMeteor />
                    <ZoneEye />
                </ObjectGroup>
            </Section>

            <Section title="Waymarks">
                <ObjectGroup>
                    <DrawArrow />
                    <WaymarkA />
                    <WaymarkB />
                    <WaymarkC />
                    <WaymarkD />
                </ObjectGroup>
                <ObjectGroup>
                    <Waymark1 />
                    <Waymark2 />
                    <Waymark3 />
                    <Waymark4 />
                </ObjectGroup>
            </Section>
            <Section title="Party">
                <ObjectGroup>
                    <PartyPaladin />
                    <PartyWarrior />
                    <PartyDarkKnight />
                    <PartyGunbreaker />
                    <PartyTank />
                </ObjectGroup>
                <ObjectGroup>
                    <PartyWhiteMage />
                    <PartyScholar />
                    <PartyAstrologian />
                    <PartyHealer />
                </ObjectGroup>
                <ObjectGroup>
                    <PartyAny />
                    <PartyMagicRanged />
                    <PartyPhysicalRanged />
                    <PartyRanged />
                    <PartyMelee />
                    <PartyDps />
                </ObjectGroup>
                <ObjectGroup>
                    <PartyMonk />
                    <PartyDragoon />
                    <PartyNinja />
                    <PartySamurai />
                </ObjectGroup>
                <ObjectGroup>
                    <PartyBard />
                    <PartyMachinist />
                    <PartyDancer />

                    <PartyBlackMage />
                    <PartySummoner />
                    <PartyRedMage />
                </ObjectGroup>
            </Section>
            <Section title="Enemies">
                <ObjectGroup>
                    <EnemyCircle />
                    <EnemySmall />
                    <EnemyMedium />
                    <EnemyLarge />
                    <EnemyHuge />
                </ObjectGroup>
            </Section>
            <Section title="Tethers">
                <Text block variant="small" className={classNames.usage}>
                    Select a tether type, then click two objects to tether them together.
                </Text>
                <ObjectGroup>
                    <TetherPlusMinus />
                    <TetherPlusPlus />
                    <TetherMinusMinus />

                    <TetherClose />
                    <TetherFar />
                    <TetherDefault />
                </ObjectGroup>
            </Section>
        </div>
    );
};