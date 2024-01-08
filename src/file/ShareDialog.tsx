import {
    DialogFooter,
    IModalProps,
    IStyle,
    IStyleFunctionOrObject,
    Label,
    PrimaryButton,
    Spinner,
    TextField,
    Theme,
    mergeStyleSets,
} from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import React, { useEffect, useRef, useState } from 'react';
import { BaseDialog, IBaseDialogStyles } from '../BaseDialog';
import { useEditorState } from '../SceneProvider';
import { getShareLink } from './share';

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
    footer: {
        gridArea: 'footer',
    } as IStyle,
});

const copyIconProps = { iconName: 'Copy' };

export const ShareDialog: React.FC<IModalProps> = (props) => {
    return (
        <BaseDialog headerText="Share" {...props} dialogStyles={dialogStyles}>
            <ShareText />
        </BaseDialog>
    );
};

const dialogStyles: IStyleFunctionOrObject<Theme, IBaseDialogStyles> = {
    body: {
        minWidth: 500,
        maxWidth: '70ch',
    },
};

const labelStyles = mergeStyleSets({
    message: { transition: 'none', opacity: 1 } as IStyle,
    hidden: { transition: 'opacity 0.5s ease-in-out', opacity: 0 } as IStyle,
});

const ShareText: React.FC = () => {
    const { groups } = useEditorState();
    const [copyMessageVisible, setMessageVisibility] = useBoolean(false);
    const timerRef = useRef<number>();
    const [url, setUrl] = useState<string | undefined>(undefined);
    const [isUrlLoading, setIsUrlLoading] = useState(true);
    
    // if(isUrlLoading){
        useEffect(() => {
            const urlPromise = getShareLink(groups);
            setIsUrlLoading(true);
            urlPromise.then(fetchedUrl => {
                setUrl(fetchedUrl);
                setIsUrlLoading(false);
            });
        }, []); // Empty dependency array to run once on mount
    // }

    const doCopyToClipboard = () => {
        if(isUrlLoading || url === undefined) return;
        navigator.clipboard.writeText(url);
        setMessageVisibility.setTrue();
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(setMessageVisibility.setFalse, 2000);
    };
    const labelClasses = `${labelStyles.message} ${copyMessageVisible ? '' : labelStyles.hidden}`;

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);
    if (isUrlLoading) {
        return <Spinner />;
    }
    if (url === undefined) {
        return null
    }

    return (
        <>
            <div>
                <p>Link to this plan:</p>
                <TextField multiline readOnly rows={7} value={url} />
                <p>
                    If the link is too long for your browser to open, paste the text into{' '}
                    <strong>Open &gt; Import Plan Link</strong> instead.
                </p>
            </div>

            <DialogFooter className={classNames.footer}>
                <Label className={labelClasses}>Successfully Copied</Label>
                <PrimaryButton iconProps={copyIconProps} text="Copy to clipboard" onClick={doCopyToClipboard} />
            </DialogFooter>
        </>
    );
};
