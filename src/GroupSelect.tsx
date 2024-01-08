import {
    classNamesFunction,
    IButtonStyles,
    IconButton,
    IStyle,
    IStyleFunction,
    Stack,
    Theme,
    useTheme
} from '@fluentui/react';
import { DragDropContext, Draggable, Droppable, DropResult, } from '@hello-pangea/dnd';
import React, { CSSProperties, useMemo, useState } from 'react';
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
const getGroupButtonStyles = (theme: Theme): CSSProperties => {
    return {
            fontSize: '0.85rem',
            lineHeight: 2,
            padding: '0 4px',
            minWidth: 24,
            minHeight: 32,
            cursor: 'pointer',
            margin: 0,
            transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid',
            borderColor: theme.palette.neutralTertiaryAlt,
            backgroundColor: theme.palette.neutralLighter,
            color: theme.palette.neutralDark,
        }
};
const getGroupButtonStyleHovered = (theme: Theme): CSSProperties => {
    return {
            borderColor: theme.palette.neutralTertiary,
            backgroundColor: theme.palette.neutralLighterAlt,
        }
};
const getGroupButtonStyleChecked = (theme: Theme): CSSProperties => {
    return {
            borderColor: theme.palette.blueLight,
            backgroundColor: theme.palette.themeLighter,
        }
};
const getGroupButtonStyleCheckedHovered = (theme: Theme): CSSProperties => {
    return {
            backgroundColor: theme.palette.themeLight,
        }
};


interface GroupButtonProps {
    index: number;
}

const GroupButton: React.FC<GroupButtonProps> = ({ index }) => {
    const { groups, currentGroup, dispatch } = useEditorState(); // Adjusted to use groups
    const [isEditing, setIsEditing] = useState(false);
    const currentName = groups[index]?.name ?? `Group ${index + 1}`;
    const [newName, setNewName] = useState(currentName);

    const [isHovered, setIsHovered] = useState(false);
    if (dispatch === undefined) throw new Error('dispatch is undefined');

    const handleDoubleClick = () => setIsEditing(true);

    const handleBlur = () => {
        setIsEditing(false);
        dispatch({ type: 'renameGroup', index, name: newName }); // Dispatch to rename group
    };

    const checked = index === currentGroup;

    const theme = useTheme();
    const buttonStyle = useMemo(() => getGroupButtonStyles(theme), [theme]);
    const buttonStyleHovered = useMemo(() => getGroupButtonStyleHovered(theme), [theme]);
    const buttonStyleChecked = useMemo(() => getGroupButtonStyleChecked(theme), [theme]);
    const buttonStyleCheckedHovered = useMemo(() => getGroupButtonStyleCheckedHovered(theme), [theme]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleBlur();
    };
    const rootCheckedStyle = checked ? buttonStyleChecked : {};
    const rootCheckedHoveredStyle = isHovered ? (checked ? buttonStyleCheckedHovered : buttonStyleHovered) : {};

    const combinedStyle = {
        ...buttonStyle,
        ...rootCheckedStyle,
        ...rootCheckedHoveredStyle,
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
        <div
            style={combinedStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title={`Group ${currentName}`}
            onClick={() => dispatch({ type: 'setGroup', index })} // Dispatch to set current group
            onDoubleClick={handleDoubleClick}>
            {currentName}</div>
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
    dragging: IStyle;
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

            div: {
                listStyle: 'none',
                marginLeft: BUTTON_SPACING / 2,
                marginRight: BUTTON_SPACING / 2,
            } as IStyle,
        } as IStyle,
    };
};


const getListStyle = (isDraggingOver: boolean) => ({
    display: 'flex',
    overflow: 'auto',
  });

export const GroupSelect: React.FC = () => {
    const { groups, dispatch } = useEditorState();
    if(dispatch === undefined) throw new Error('dispatch is undefined');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const scenes = useMemo(() => groups.map((_, i) => i), [groups.length]);

    const theme = useTheme();
    const classNames = getClassNames(getGroupSelectStyles, theme);
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const from = result.source.index;
        const to = result.destination.index;

        dispatch({ type: 'moveGroups', from, to });
    };
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Stack horizontal tokens={{ childrenGap: BUTTON_SPACING }} className={classNames.root}>
                <Droppable droppableId="droppable-groups" direction="horizontal">
                    {(provided, snapshot) => (
                        <div {...provided.droppableProps} 
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                        
                            {groups.map((group, index) => (
                                <Draggable key={`item-${index}`} draggableId={`item-${index}`} index={index}>
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef} 
                                            {...provided.draggableProps} 
                                            {...provided.dragHandleProps}>
                                            <GroupButton index={index}/>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                <Stack horizontal tokens={{ childrenGap: BUTTON_SPACING }}>
                    <AddGroupButton />
                    <RemoveGroupButton />
                </Stack>
            </Stack>
        </DragDropContext>
    );
};
