import {
    Dropdown,
    FocusZone,
    FocusZoneDirection,
    IDropdownOption,
    IStyle,
    List,
    mergeStyleSets,
    Pivot,
    PivotItem,
    ProgressIndicator,
    SearchBox,
} from '@fluentui/react';
import React, { useCallback, useState } from 'react';
import { useAsync, useDebounce, useLocalStorage } from 'react-use';
import {
    StatusAttack1,
    StatusAttack2,
    StatusAttack3,
    StatusAttack4,
    StatusAttack5,
    StatusAttack6,
    StatusAttack7,
    StatusAttack8,
    StatusBind1,
    StatusBind2,
    StatusBind3,
    StatusBlueCircleTarget,
    StatusCircle,
    StatusCounter1,
    StatusCounter2,
    StatusCounter3,
    StatusCounter4,
    StatusCounter5,
    StatusCounter6,
    StatusCounter7,
    StatusCounter8,
    StatusCross,
    StatusCrosshairs,
    StatusDice1,
    StatusDice2,
    StatusDice3,
    StatusEdenBlue,
    StatusEdenOrange,
    StatusEdenYellow,
    StatusGreenCircleTarget,
    StatusGreenTarget,
    StatusIgnore1,
    StatusIgnore2,
    StatusRedTarget,
    StatusSquare,
    StatusTriangle,
    StatusUltimateCircle,
    StatusUltimateCross,
    StatusUltimateSquare,
    StatusUltimateTriangle,
} from '../prefabs/Status';
import { StatusIcon } from '../prefabs/StatusIcon';
import { PANEL_PADDING } from './PanelStyles';
import { ObjectGroup, Section } from './Section';

const classNames = mergeStyleSets({
    panel: {
        padding: PANEL_PADDING,
    } as IStyle,
    search: {
        marginTop: PANEL_PADDING,
        marginLeft: PANEL_PADDING,
        marginRight: PANEL_PADDING,
    } as IStyle,
    language: {
        marginTop: PANEL_PADDING,
        marginLeft: PANEL_PADDING,
        marginRight: PANEL_PADDING,
    } as IStyle,
    list: {
        marginTop: PANEL_PADDING,
        paddingLeft: PANEL_PADDING,
        paddingRight: PANEL_PADDING,
        // TODO: is there a way to make this less terrible?
        maxHeight: 'calc(100vh - 44px - 44px - 48px - 61px - 8px - 8px)',
        overflow: 'auto',
    } as IStyle,
    listItem: {
        width: 32,
        height: 32,
        float: 'left',
        margin: 5,
    } as IStyle
});

interface Pagination {
    Page: number;
    PageNext: number | null;
    PagePrev: number | null;
    PageTotal: number;
    Results: number;
    ResultsPerPage: number;
    ResultsTotal: number;
}

interface StatusItem {
    ID: number;
    IconHD?: string;
    Icon: string;
    Name: string;
}

interface Page {
    Pagination: Pagination;
    Results: StatusItem[];
}

type Language = 'en' | 'ja' | 'de' | 'fr';

export const StatusPanel: React.FC = () => {
    const [filter, setFilter] = useState('');

    return (
        <Pivot>
            <PivotItem headerText="Markers">
                <SpecialStatus />
            </PivotItem>
            <PivotItem headerText="Status effects">
                <StatusSearch filter={filter} onFilterChanged={setFilter} />
            </PivotItem>
        </Pivot>
    );
};

const DEBOUNCE_TIME = 300;

const onRenderCell = (item?: StatusItem): JSX.Element | null => {
    if (!item) {
        return null;
    }
    return (
        <div className={classNames.listItem}>
            <StatusIcon  name={item.Name} icon={`https://xivapi.com${item.Icon}`} maxDim={[32, 32]} />
        </div>
    );
};

function extractIconNumber(iconPath: string): number | undefined {
    if (!iconPath) {
        return undefined;
    }
    const match = /(\d+)\.png$/.exec(iconPath);
    if (match && match[1]) {
        return parseInt(match[1]);
    } else {
        return undefined;
    }
}

function checkResourceExists(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

async function addMissingIcons(items: StatusItem[]): Promise<StatusItem[]> {
    // Sort items by icon number
    items.sort((a, b) => (extractIconNumber(a.Icon)??0) - (extractIconNumber(b.Icon)??0));

    let allItems: StatusItem[] = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemNext = items[i+1];
        if (item == undefined) continue;
        allItems.push(item);
        // if (itemNext == undefined) continue;
        const currentIconNumber = extractIconNumber(item.Icon);
        if (currentIconNumber === undefined) continue;
        const nextIconNumber = i < items.length - 1 ? extractIconNumber(itemNext?.Icon??""): currentIconNumber+7

        if (currentIconNumber !== undefined && nextIconNumber !== undefined && nextIconNumber - currentIconNumber > 1 && nextIconNumber - currentIconNumber < 8) {
            for (let num = currentIconNumber + 1; num < nextIconNumber; num++) {
                const missingIconPath = item.Icon.replace(new RegExp(`${currentIconNumber}\\.png$`), `${num}.png`);
                let missingIconHRPath = item.Icon.replace(new RegExp(`${currentIconNumber}\\.png$`), `${num}_hr1.png`);
                if (!await checkResourceExists(`https://xivapi.com${missingIconPath}`)) {
                    console.log(`skipping missing icon https://xivapi.com${missingIconPath}`)
                    continue
                }
                if (!await checkResourceExists(`https://xivapi.com${missingIconHRPath}`)) {
                    missingIconHRPath = ""
                }
                console.log(`adding missing icon ${missingIconPath}`)
                allItems.push({ ...item, Icon: missingIconPath, IconHD: missingIconHRPath});
            }
        }
    }

    return allItems;
}

const fetchStatuses = async (search: string, signal: AbortSignal, language: Language = 'en'): Promise<StatusItem[]> => {
    const items: StatusItem[] = [];

    let pageIndex: number | null = 0;
    const searchSize: number = 20;
    do {
        const body = {
            "indexes": "status",
            "columns": "ID,Name,Icon,IconHD",
            "body": {
              "query": {
                "bool": {
                  "must": [
                    {
                      "wildcard": {
                        "NameCombined_en": `*${search}*`
                      }
                    }
                  ]
                }
              },
                "from": pageIndex*searchSize,
            "size": searchSize,
              "sort": [{"ID":"asc"}]
            }
          }
        const response = await fetch(`https://xivapi.com/search`,{method:'POST', body: JSON.stringify(body), signal});
        const page = (await response.json()) as Page;
        items.push(...page.Results);
        if (page.Pagination.ResultsTotal>pageIndex*searchSize) {
            pageIndex = pageIndex+1;
        }
        else {
            pageIndex = null;
        }
        pageIndex = page.Pagination.PageNext;
    } while (pageIndex !== null);

    // Add missing icons
    const itemsWithMissingIcons = await addMissingIcons(items);

    // Replace item icons with HD versions if available
    for (const item of itemsWithMissingIcons) {
        let icon = item.IconHD??item.Icon;
        if (item.IconHD===""){
            icon = item.Icon;
        }
        item.Icon = icon;
    }
    console.log(itemsWithMissingIcons);
    return itemsWithMissingIcons;
};

const LANGUAGE_OPTIONS: IDropdownOption[] = [
    { key: 'ja', text: '日本語' },
    { key: 'en', text: 'English' },
    { key: 'fr', text: 'Français' },
    { key: 'de', text: 'Deutch' },
];

interface StatusSearchProps {
    filter: string;
    onFilterChanged: React.Dispatch<string>;
}

const StatusSearch: React.FC<StatusSearchProps> = ({ filter, onFilterChanged }) => {
    const [controller, setController] = useState<AbortController>();
    const [debouncedFilter, setDebouncedFilter] = useState('');
    const [language, setLanguage] = useLocalStorage<Language>('language', 'en');

    const setFilter = useCallback(
        (text?: string) => {
            controller?.abort();
            onFilterChanged(text ?? '');
        },
        [controller, onFilterChanged],
    );

    useDebounce(() => setDebouncedFilter(filter), DEBOUNCE_TIME, [filter]);

    const items = useAsync(async () => {
        if (!debouncedFilter) {
            return [];
        }

        const controller = new AbortController();
        setController(controller);

        try {
            return fetchStatuses(debouncedFilter, controller.signal, language);
        } catch (ex) {
            console.warn(ex);
            return [];
        }
    }, [debouncedFilter]);
    const a = (
        <FocusZone direction={FocusZoneDirection.vertical}>
            <Dropdown
                label="Language"
                className={classNames.language}
                options={LANGUAGE_OPTIONS}
                selectedKey={language}
                onChange={(ev, option) => option && setLanguage(option.key as Language)}
            />
            <SearchBox
                className={classNames.search}
                placeholder="Status name"
                value={filter}
                onChange={(ev, text) => setFilter(text)}
            />

            <div className={classNames.list}>
                <List items={items.value??[]} onRenderCell={onRenderCell} />

                {items.loading && <ProgressIndicator />}
                {!items.loading && filter && items.value?.length === 0 && <p>No results.</p>}
            </div>
        </FocusZone>
    );
    return a
};

const SpecialStatus: React.FC = () => {
    return (
        <div className={classNames.panel}>
            <Section title="General">
                <ObjectGroup>
                    <StatusAttack1 />
                    <StatusAttack2 />
                    <StatusAttack3 />
                    <StatusAttack4 />
                    <StatusAttack5 />
                    <StatusAttack6 />
                    <StatusAttack7 />
                    <StatusAttack8 />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusIgnore1 />
                    <StatusIgnore2 />
                    <StatusBind1 />
                    <StatusBind2 />
                    <StatusBind3 />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusTriangle />
                    <StatusCircle />
                    <StatusCross />
                    <StatusSquare />
                </ObjectGroup>
            </Section>
            <Section title="Counters">
                <ObjectGroup>
                    <StatusCounter1 />
                    <StatusCounter2 />
                    <StatusCounter3 />
                    <StatusCounter4 />
                    <StatusCounter5 />
                    <StatusCounter6 />
                    <StatusCounter7 />
                    <StatusCounter8 />
                </ObjectGroup>
            </Section>
            <Section title="Target indicators">
                <ObjectGroup>
                    <StatusBlueCircleTarget />
                    <StatusGreenCircleTarget />
                    <StatusCrosshairs />
                    <StatusRedTarget />
                    <StatusGreenTarget />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusUltimateTriangle />
                    <StatusUltimateCircle />
                    <StatusUltimateCross />
                    <StatusUltimateSquare />
                </ObjectGroup>
                <ObjectGroup>
                    <StatusEdenYellow />
                    <StatusEdenOrange />
                    <StatusEdenBlue />
                </ObjectGroup>
            </Section>
            <Section title="Status effects">
                <ObjectGroup>
                    <StatusDice1 />
                    <StatusDice2 />
                    <StatusDice3 />
                </ObjectGroup>
            </Section>
        </div>
    );
};
