import {
    classNamesFunction,
    DefaultButton,
    IButtonStyles,
    IconButton,
    IStyle,
    IStyleFunction,
    Stack,
    Theme,
    useTheme,
} from '@fluentui/react';
import React, { useMemo, useState } from 'react';
import { useEditorState } from './SceneProvider';

const getButtonStyles: IStyleFunction<Theme, IButtonStyles> = (theme) => {
    return {
        root: {
            padding: 0,
            minWidth: 32,
            borderColor: theme.palette.neutralTertiaryAlt,
        },
        rootChecked: {
            borderColor: theme.palette.themeDark,
            backgroundColor: theme.palette.themeLighter,
        },
        rootCheckedHovered: {
            backgroundColor: theme.palette.themeLight,
        },
    };
};

interface GroupButtonProps {
    index: number;
}

const GroupButton: React.FC<GroupButtonProps> = ({ index }) => {
    const { groups, currentGroup, dispatch } = useEditorState(); // Adjusted to use groups
    const [isEditing, setIsEditing] = useState(false);
    const currentName = groups[index]?.name ?? `Group ${index + 1}`;
    const [newName, setNewName] = useState(currentName);

    if (dispatch === undefined) throw new Error('dispatch is undefined');

    const handleDoubleClick = () => setIsEditing(true);

    const handleBlur = () => {
        setIsEditing(false);
        dispatch({ type: 'renameGroup', index, name: newName }); // Dispatch to rename group
    };

    const checked = index === currentGroup;

    const theme = useTheme();
    const buttonStyles = useMemo(() => getButtonStyles(theme), [theme]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleBlur();
    };

    return isEditing ? (
        <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            autoFocus
        />
    ) : (
        <DefaultButton
            text={currentName}
            title={`Group ${currentName}`}
            checked={checked}
            onClick={() => dispatch({ type: 'setGroup', index })} // Dispatch to set current group
            onDoubleClick={handleDoubleClick}
            styles={buttonStyles}
        />
    );
};


const AddGroupButton: React.FC = () => {
    const { dispatch } = useEditorState();

    if (dispatch === undefined) throw new Error('dispatch is undefined');
    const theme = useTheme();
    const buttonStyles = useMemo(() => getButtonStyles(theme), [theme]);

    return (
        <IconButton
            title="Add new Group"
            iconProps={{ iconName: 'Add' }}
            onClick={() => dispatch({ type: 'addGroup' })}
            styles={buttonStyles}
        />
    );
};

const RemoveGroupButton: React.FC = () => {
    const { groups, currentGroup, dispatch } = useEditorState();

    if (dispatch === undefined) throw new Error('dispatch is undefined');
    const theme = useTheme();
    const buttonStyles = useMemo(() => getButtonStyles(theme), [theme]);

    return (
        <IconButton
            title="Delete current step"
            iconProps={{ iconName: 'Delete' }}
            disabled={groups.length < 2}
            onClick={() => dispatch({ type: 'removeGroup', index: currentGroup })}
            styles={buttonStyles}
        />
    );
};

const BUTTON_SPACING = 4;

interface IStepSelectStyles {
    root: IStyle;
}

const getClassNames = classNamesFunction<Theme, IStepSelectStyles>();

const getGroupSelectStyles: IStyleFunction<Theme, IStepSelectStyles> = (theme) => {
    return {
        root: {
            gridArea: 'groups',
            backgroundColor: theme.palette.neutralLighter,
            padding: 4,

            ul: {
                display: 'flex',
                flexFlow: 'row wrap',

                margin: 0,
                padding: 0,
            } as IStyle,

            li: {
                listStyle: 'none',
                margin: BUTTON_SPACING / 2,
            } as IStyle,
        } as IStyle,
    };
};

export const GroupSelect: React.FC = () => {
    const { groups } = useEditorState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const scenes = useMemo(() => groups.map((_, i) => i), [groups.length]);

    const theme = useTheme();
    const classNames = getClassNames(getGroupSelectStyles, theme);

    return (
        <Stack horizontal tokens={{ childrenGap: BUTTON_SPACING }} className={classNames.root}>
            <ul>
                {scenes.map((i) => (
                    <li key={i}>
                        <GroupButton index={i} />
                    </li>
                ))}
            </ul>
            <Stack horizontal tokens={{ childrenGap: BUTTON_SPACING }}>
                <AddGroupButton />
                <RemoveGroupButton />
            </Stack>
        </Stack>
    );
};
