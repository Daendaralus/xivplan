import {
    ConstrainMode,
    DefaultButton,
    DetailsList,
    DetailsListLayoutMode,
    DialogFooter,
    IColumn,
    IconButton,
    IDetailsListStyles,
    IModalProps,
    IStyle,
    IStyleFunctionOrObject,
    mergeStyleSets,
    Pivot,
    PivotItem,
    PrimaryButton,
    Selection,
    SelectionMode,
    Spinner,
    TextField,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useConst, useForceUpdate } from '@fluentui/react-hooks';
import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { BaseDialog, IBaseDialogStyles } from '../BaseDialog';
import { openFile, saveFile, textToScene } from '../file';
import { Group } from '../scene';
import { FileSource, useEditorState, useLoadGroup, useLoadScene } from '../SceneProvider';
import { useIsDirty, useSetSavedState } from '../useIsDirty';
import { confirmDeleteFile, confirmOverwriteFile, confirmUnsavedChanges } from './confirm';
import { deleteFileLocal, FileEntry, listLocalFiles } from './localFile';
import { parseSceneLink } from './share';

const classNames = mergeStyleSets({
    tab: {
        minHeight: 200,
        display: 'grid',
        gridTemplateRows: '1fr auto',
        gridTemplateAreas: `
            "content"
            "footer"
        `,
    } as IStyle,
    form: {
        gridArea: 'content',
        marginTop: 20,
    } as IStyle,
    footer: {
        gridArea: 'footer',
    } as IStyle,

    listButton: {
        margin: '-7px 0 -7px',
    } as IStyle,
});

export const OpenDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="Open File" {...props} dialogStyles={dialogStyles}>
            <Pivot>
                <PivotItem headerText="Browser Storage" className={classNames.tab}>
                    <OpenLocalFile onDismiss={props.onDismiss} />
                </PivotItem>
                {/* <PivotItem headerText="GitHub Gist" className={classNames.tab}>
                    <p>TODO</p>
                </PivotItem> */}
                <PivotItem headerText="Import Plan Link" className={classNames.tab}>
                    <ImportFromString onDismiss={props.onDismiss} />
                </PivotItem>
            </Pivot>
        </BaseDialog>
    );
};

export const SaveAsDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="Save As" {...props} dialogStyles={dialogStyles}>
            <Pivot>
                <PivotItem headerText="Browser Storage" className={classNames.tab}>
                    <SaveLocalFile onDismiss={props.onDismiss} />
                </PivotItem>
                {/* <PivotItem headerText="GitHub Gist" className={classNames.tab}>
                    <p>TODO</p>
                </PivotItem> */}
            </Pivot>
        </BaseDialog>
    );
};

const dialogStyles: IStyleFunctionOrObject<Theme, IBaseDialogStyles> = {
    body: {
        minWidth: 500,
    },
};

interface SourceTabProps {
    onDismiss?: () => void;
}

const getOpenFileColumns = (theme: Theme, reloadFiles: () => void) =>
    [
        {
            key: 'name',
            name: 'Name',
            fieldName: 'name',
            minWidth: 200,
        },
        {
            key: 'modified',
            name: 'Date modified',
            fieldName: 'lastModified',
            minWidth: 200,
            onRender: (item: FileEntry) => item.lastEdited?.toLocaleString(),
        },
        {
            key: 'delete',
            name: '',
            minWidth: 32,
            onRender: (item: FileEntry) => (
                <IconButton
                    className={classNames.listButton}
                    iconProps={{ iconName: 'Delete' }}
                    onClick={async () => {
                        if (await confirmDeleteFile(item.name, theme)) {
                            await deleteFileLocal(item.name);
                            reloadFiles();
                        }
                    }}
                />
            ),
        },
    ] as IColumn[];

const listStyles: Partial<IDetailsListStyles> = {
    root: {
        overflowX: 'auto',
        width: '100%',
        '& [role=grid]': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            maxHeight: '50vh',
        } as IStyle,
    },
    headerWrapper: {
        flex: '0 0 auto',
    },
    contentWrapper: {
        flex: '1 1 auto',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
};

const OpenLocalFile: React.FC<SourceTabProps> = ({ onDismiss }) => {
    const loadGroup = useLoadGroup();
    const setSavedState = useSetSavedState();
    const isDirty = useIsDirty();
    const theme = useTheme();

    const [files, setFiles] = useState<FileEntry[] | undefined>(undefined); 
    const [error, setError] = useState<Error | null>(null);
    const [isPending, setIsPending] = useState(true); // Start with true to indicate loading
    const [reloadFlag, setReloadFlag] = useState(0); // Replaces 'counter'
    
    const reloadFiles = () => setReloadFlag(prev => prev + 1); // Replaces 'inc: reloadFiles'
    
    useEffect(() => {
        setIsPending(true);
        listLocalFiles()
            .then(fetchedFiles => {
                setFiles(fetchedFiles);
                setError(null); // Clear any previous error
                setIsPending(false);
            })
            .catch(err => {
                setError(err);
                setFiles(undefined); // Clear any previous files
                setIsPending(false);
            });
    }, [reloadFlag]); // Dependency on 'reloadFlag' to trigger re-loading
    
    const columns = useMemo(() => getOpenFileColumns(theme, reloadFiles), [theme, reloadFiles]);

    const forceUpdate = useForceUpdate();
    const selection = useConst(() => new Selection({ onSelectionChanged: forceUpdate }));

    const openCallback = useCallback(async () => {
        if (isDirty) {
            if (!(await confirmUnsavedChanges(theme))) {
                return;
            }
        }

        const index = selection.getSelectedIndices()[0] ?? 0;
        const name = files?.[index]?.name;
        if (!name) {
            return;
        }

        const source: FileSource = { type: 'local', name };
        const groups = await openFile(source);

        loadGroup(groups, source);
        setSavedState(groups);
        onDismiss?.();
    }, [selection, files, isDirty, theme, loadGroup, setSavedState, onDismiss]);

    if (isPending) {
        return <Spinner />;
    }
    if (error) {
        return <p>{error.message}</p>;
    }
    if (!files) {
        return null;
    }

    return (
        <>
            <DetailsList
                columns={columns}
                items={files??[]}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                constrainMode={ConstrainMode.unconstrained}
                selectionMode={SelectionMode.single}
                selection={selection}
                styles={listStyles}
                compact
            />
            <DialogFooter className={classNames.footer}>
                <PrimaryButton text="Open" disabled={selection.count === 0} onClick={openCallback} />
                <DefaultButton text="Cancel" onClick={onDismiss} />
            </DialogFooter>
        </>
    );
};

async function decodeGroups(text: string): Promise<Group[] | undefined> {
    try {
        return parseSceneLink(new URL(text));
    } catch (ex) {
        if (!(ex instanceof TypeError)) {
            console.error('Invalid plan data', ex);
            return undefined;
        }
    }

    // Not a URL. Try as plain data.
    try {
        return textToScene(decodeURIComponent(text));
    } catch (ex) {
        console.error('Invalid plan data', ex);
    }

    return undefined;
}

// function decodeScene(text: string): Scene | undefined {
//     try {
//         return parseSceneLink(new URL(text));
//     } catch (ex) {
//         if (!(ex instanceof TypeError)) {
//             console.error('Invalid plan data', ex);
//             return undefined;
//         }
//     }

//     // Not a URL. Try as plain data.
//     try {
//         return textToScene(decodeURIComponent(text));
//     } catch (ex) {
//         console.error('Invalid plan data', ex);
//     }

//     return undefined;
// }

const ImportFromString: React.FC<SourceTabProps> = ({ onDismiss }) => {
    const loadScene = useLoadScene();
    const loadGroup = useLoadGroup();
    const setSavedState = useSetSavedState();
    const isDirty = useIsDirty();
    const theme = useTheme();
    const [data, setData] = useState<string | undefined>('');
    const [error, setError] = useState<string | undefined>('');
    const [paste, setPaste] = useState<string | undefined>(undefined);
    const [isPasteLoading, setIsPasteLoading] = useState(true);

    const importCallback = useCallback(async () => {
        if (!data) {
            return;
        }

        if (isDirty) {
            if (!(await confirmUnsavedChanges(theme))) {
                return;
            }
        }

        
        const groups = await decodeGroups(data);
        if (!groups) {
            setError('Invalid link');
            return;
        }

        // const scene = decodeScene(data);
        // if (!scene) {
        //     setError('Invalid link');
        //     return;
        // }

        loadGroup(groups, undefined);
        setSavedState(groups);
        onDismiss?.();
    }, [data, isDirty, theme, loadScene, setSavedState, onDismiss]);

    const onChange = useCallback(
        (ev: FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
            setData(value);
            setError(undefined);
        },
        [setError, setData],
    );

    const onKeyDown = useCallback(
        (ev: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                importCallback();
            }
        },
        [importCallback],
    );

    return (
        <>
            <TextField
                label="Enter plan link"
                multiline
                rows={7}
                onChange={onChange}
                onKeyDown={onKeyDown}
                errorMessage={error}
            />
            <DialogFooter className={classNames.footer}>
                <PrimaryButton text="Import" disabled={!data} onClick={importCallback} />
                <DefaultButton text="Cancel" onClick={onDismiss} />
            </DialogFooter>
        </>
    );
};

function getInitialName(source: FileSource | undefined) {
    return source?.type === 'local' ? source.name : undefined;
}

const SaveLocalFile: React.FC<SourceTabProps> = ({ onDismiss }) => {
    const setSavedState = useSetSavedState();
    const { groups, source, dispatch } = useEditorState();
    if (dispatch === undefined) throw new Error('dispatch is undefined');
    const [name, setName] = useState(getInitialName(source));
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [isFilesLoading, setIsFilesLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        setIsFilesLoading(true);
        listLocalFiles().then(fetchedFiles => {
            setFiles(fetchedFiles);
            setIsFilesLoading(false);
        });
    }, []); // Empty dependency array to run once on mount

    const alreadyExists = useMemo(() => files.some((f) => f.name === name), [files, name]);
    const canSave = !!name && !isFilesLoading;

    const saveCallback = async () => {
        if (!canSave) {
            return;
        }

        if (alreadyExists && !(await confirmOverwriteFile(theme))) {
            return;
        }

        const source: FileSource = { type: 'local', name };
        await saveFile(groups, source);

        dispatch({ type: 'setSource', source });
        setSavedState(groups);
        onDismiss?.();
    };

    return (
        <>
            <div className={classNames.form}>
                <TextField
                    label="File name"
                    value={name}
                    onChange={(e, v) => setName(v)}
                    errorMessage={alreadyExists ? 'A file with this name already exists.' : undefined}
                />
            </div>

            <DialogFooter className={classNames.footer}>
                <PrimaryButton text="Save" disabled={!canSave} onClick={saveCallback} />
                <DefaultButton text="Cancel" onClick={onDismiss} />
            </DialogFooter>
        </>
    );
};
