import { classNamesFunction, IStyle, Theme, useTheme } from '@fluentui/react';
import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { DirtyProvider } from './DirtyProvider';
import { EditModeProvider } from './EditModeProvider';
import { parseSceneLink } from './file/share';
import { GroupSelect } from './GroupSelect';
import { RegularHotkeyHandler } from './HotkeyHandler';
import { MainCommandBar } from './MainCommandBar';
import { DetailsPanel } from './panel/DetailsPanel';
import { MainPanel } from './panel/MainPanel';
import { PanelDragProvider } from './PanelDragProvider';
import { SceneRenderer } from './render/SceneRenderer';
import { Group } from './scene';
import { SceneProvider, useScene } from './SceneProvider';
import { SelectionProvider } from './SelectionProvider';
import { StepSelect } from './StepSelect';
import { useIsDirty } from './useIsDirty';

interface IContentStyles {
    stage: IStyle;
}
const getClassNames = classNamesFunction<Theme, IContentStyles>();

export const MainPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { hash } = useLocation();
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [initialScene, setInitialScene] = useState<Group[] | undefined>(undefined);
    // const initialLoad = useMemo(async () => {
    //     try {
    //         return await parseSceneLink(hash, searchParams);
    //     } catch (ex) {
    //         console.error('Invalid plan data from URL', ex);
    //     }
    // }, [hash, searchParams]);

    useEffect(() => {
        parseSceneLink(hash, searchParams)
            .then(scene => {
                setInitialScene(scene);
                setIsInitialLoading(false);
            });
    }, [hash, searchParams]); // Dependency on 'reloadFlag' to trigger re-loading

    if(isInitialLoading) {
        return null;
    }
    return (
        <SceneProvider initialGroup={initialScene}>
            <DirtyProvider>
                <EditModeProvider>
                    <SelectionProvider>
                        <PanelDragProvider>
                            <MainPageContent />
                        </PanelDragProvider>
                    </SelectionProvider>
                </EditModeProvider>
            </DirtyProvider>
        </SceneProvider>
    );
};

const MainPageContent: React.FC = () => {
    usePageTitle();
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            stage: {
                gridArea: 'content',
                overflow: 'auto',
                backgroundColor: theme.palette.neutralLighter,
                minWidth: 400,
            },
        };
    }, theme);

    return (
        <>
            <RegularHotkeyHandler />
            <MainCommandBar />

            <MainPanel />
            <GroupSelect />
            <StepSelect />

            <div className={classNames.stage}>
                <SceneRenderer />
            </div>

            <DetailsPanel />
        </>
    );
};

const DEFAULT_TITLE = 'FFXIV Raid Planner';

function usePageTitle() {
    const { source } = useScene();
    const isDirty = useIsDirty();

    useEffect(() => {
        const name = source?.name ?? DEFAULT_TITLE;
        const flag = isDirty ? ' ●' : '';
        document.title = `${name}${flag}`;
    }, [source, isDirty]);
}
