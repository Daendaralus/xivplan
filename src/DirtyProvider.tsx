import { DefaultButton, Dialog, DialogFooter, DialogType, IDialogContentProps, PrimaryButton } from '@fluentui/react';
import { Action } from 'history';
import React, { Dispatch, PropsWithChildren, createContext, useCallback, useState } from 'react';
import { Location, useNavigate } from 'react-router-dom';
import { useBeforeUnload } from 'react-use';
import { useEditorState } from './SceneProvider';
import { Group } from './scene';

export const DirtyContext = createContext(false);
export const SavedStateContext = createContext<Dispatch<Group[]>>(() => undefined);

export const DirtyProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { groups } = useEditorState();
    const [savedState, setSavedState] = useState<Group[]>(groups);
    const isDirty = groups !== savedState;

    return (
        <SavedStateContext.Provider value={setSavedState}>
            <DirtyContext.Provider value={isDirty}>
                {children}

                <NavLockPrompt locked={isDirty} />
            </DirtyContext.Provider>
        </SavedStateContext.Provider>
    );
};

const NAV_LOCK_MESSAGE = 'Are you sure you want to leave? Your unsaved changes will be lost.';

const dialogContent: IDialogContentProps = {
    type: DialogType.normal,
    title: 'Unsaved changes',
    subText: NAV_LOCK_MESSAGE,
};

interface NavLockProps {
    locked: boolean;
}

interface NextLocation {
    location: Location;
    action: Action;
}

const NavLockPrompt: React.FC<NavLockProps> = ({ locked }) => {
    useBeforeUnload(locked, NAV_LOCK_MESSAGE);

    const navigate = useNavigate();
    // const currentLocation = useLocation();

    const [showDialog, setShowDialog] = useState(false);
    const [nextLocation, setNextLocation] = useState<NextLocation>();

    // TODO: https://github.com/remix-run/react-router/issues/8139
    // const onPrompt = useCallback(
    //     (location: Location, action: Action) => {
    //         if (location.pathname === currentLocation.pathname) {
    //             return true;
    //         }

    //         setNextLocation({ location, action });
    //         setShowDialog(true);
    //         return false;
    //     },
    //     [setNextLocation, showDialog],
    // );

    const onCancelNavigate = useCallback(() => {
        setNextLocation(undefined);
        setShowDialog(false);
    }, [setNextLocation, setShowDialog]);

    const onConfirmNavigate = useCallback(() => {
        setShowDialog(false);

        if (!nextLocation) {
            return;
        }

        switch (nextLocation.action) {
            case Action.Pop:
                navigate(-1);
                break;

            case Action.Push:
                navigate(nextLocation.location);
                break;

            case Action.Replace:
                navigate(nextLocation.location, { replace: true });
                break;
        }
    }, [nextLocation, setShowDialog, navigate]);

    return (
        <>
            {/* <Prompt when={locked && !nextLocation} message={onPrompt} /> */}
            <Dialog
                hidden={!showDialog}
                dialogContentProps={dialogContent}
                modalProps={{ isBlocking: true }}
                onDismiss={onCancelNavigate}
            >
                <DialogFooter>
                    <PrimaryButton text="Leave page" onClick={onConfirmNavigate} />
                    <DefaultButton text="Stay on page" onClick={onCancelNavigate} />
                </DialogFooter>
            </Dialog>
        </>
    );
};
