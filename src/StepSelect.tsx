import {
    IButtonStyles,
    IStyle,
    IStyleFunction,
    IconButton,
    Stack,
    Theme,
    classNamesFunction,
    useTheme
} from '@fluentui/react';
import { DragDropContext, Draggable, DropResult, Droppable, } from '@hello-pangea/dnd';
import React, { CSSProperties, useMemo, useState } from 'react';
import { useScene } from './SceneProvider';

const getButtonStyles: IStyleFunction<Theme, IButtonStyles> = (theme) => {
    return {
        root: {
            padding: 0,
            minWidth: 32,
            textAlign: 'center'
        },
        rootChecked: {
            borderColor: theme.palette.themeDark,
            backgroundColor: theme.palette.themeLighter
        },
        rootCheckedHovered: {
            backgroundColor: theme.palette.themeLight,
        },
    };
};

const getStepButtonStyles = (theme: Theme): CSSProperties => {
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
const getStepButtonStyleHovered = (theme: Theme): CSSProperties => {
    return {
            borderColor: theme.palette.neutralTertiary,
            backgroundColor: theme.palette.neutralLighterAlt,
        }
};
const getStepButtonStyleChecked = (theme: Theme): CSSProperties => {
    return {
            borderColor: theme.palette.blueLight,
            backgroundColor: theme.palette.themeLighter,
        }
};
const getStepButtonStyleCheckedHovered = (theme: Theme): CSSProperties => {
    return {
            backgroundColor: theme.palette.themeLight,
        }
};


interface StepButtonProps {
    index: number;
}



const StepButton: React.FC<StepButtonProps> = ({ index }) => {
    const { scene, stepIndex, dispatch } = useScene();
    const [isEditing, setIsEditing] = useState(false);
    const currentName =  scene.steps[index]?.name ?? `${index + 1}`;
    const [newName, setNewName] = useState(currentName);

    const [isHovered, setIsHovered] = useState(false);
    //console.log('curname', scene.steps[index]?.name)
    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        dispatch({ type: 'renameStep', index, name: newName });
    };
    const checked = index === stepIndex;

    const theme = useTheme();
    const buttonStyle = useMemo(() => getStepButtonStyles(theme), [theme]);
    const buttonStyleHovered = useMemo(() => getStepButtonStyleHovered(theme), [theme]);
    const buttonStyleChecked = useMemo(() => getStepButtonStyleChecked(theme), [theme]);
    const buttonStyleCheckedHovered = useMemo(() => getStepButtonStyleCheckedHovered(theme), [theme]);
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
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
    ) :(
        <div
        // text={currentName}            
        style={combinedStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={`Step ${currentName}`}
        onClick={() => dispatch({ type: 'setStep', index })}
        onDoubleClick={handleDoubleClick}
        >{currentName}</div>
      );
};


const AddStepButton: React.FC = () => {
    const { dispatch } = useScene();

    const theme = useTheme();
    const buttonStyles = useMemo(() => getButtonStyles(theme), [theme]);

    return (
        <IconButton
            title="Add new step"
            iconProps={{ iconName: 'Add' }}
            onClick={() => dispatch({ type: 'addStep' })}
            styles={buttonStyles}
        />
    );
};

const RemoveStepButton: React.FC = () => {
    const { scene, stepIndex, dispatch } = useScene();

    const theme = useTheme();
    const buttonStyles = useMemo(() => getButtonStyles(theme), [theme]);

    return (
        <IconButton
            title="Delete current step"
            iconProps={{ iconName: 'Delete' }}
            disabled={scene.steps.length < 2}
            onClick={() => dispatch({ type: 'removeStep', index: stepIndex })}
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

const getStepSelectStyles: IStyleFunction<Theme, IStepSelectStyles> = (theme) => {
    return {
        root: {
            gridArea: 'steps',
            backgroundColor: theme.palette.neutralLighterAlt,
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
    flexFlow: 'row wrap',
  });

export const StepSelect: React.FC = () => {
    const { scene, dispatch } = useScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const steps = useMemo(() => scene.steps.map((_, i) => i), [scene.steps.length]);

    const theme = useTheme();
    const classNames = getClassNames(getStepSelectStyles, theme);
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const from = result.source.index;
        const to = result.destination.index;

        dispatch({ type: 'moveSteps', from, to });
    };
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Stack horizontal tokens={{ childrenGap: BUTTON_SPACING }} className={classNames.root}>
                <Droppable droppableId="droppable-steps" direction="horizontal">
                    {(provided, snapshot) => (
                            <div {...provided.droppableProps} 
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}>
                            
                                {steps.map((index) => (
                                    <Draggable key={`item-${index}`} draggableId={`item-${index}`} index={index}>
                                    {provided => (
                                        <div ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}>

                                            <StepButton index={index} />
                                        </div>
                                    )}
                                    </Draggable>   
                                ))}
                                {provided.placeholder}
                            </div>
                    )}
                </Droppable>
                <Stack horizontal tokens={{ childrenGap: BUTTON_SPACING }}>
                    <AddStepButton />
                    <RemoveStepButton />
                </Stack>
            </Stack>
        </DragDropContext>
    );
};
