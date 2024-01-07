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
import { useScene } from './SceneProvider';

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

interface StepButtonProps {
    index: number;
}

const StepButton: React.FC<StepButtonProps> = ({ index }) => {
    const { scene, stepIndex, dispatch } = useScene();
    const [isEditing, setIsEditing] = useState(false);
    const currentName =  scene.steps[index]?.name ?? `${index + 1}`;
    const [newName, setNewName] = useState(currentName);
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
    const buttonStyles = useMemo(() => getButtonStyles(theme), [theme]);
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
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
            title={`Step ${currentName}`}
            checked={checked}
            onClick={() => dispatch({ type: 'setStep', index })}
            onDoubleClick={handleDoubleClick}
            styles={buttonStyles}
        />
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

            li: {
                listStyle: 'none',
                margin: BUTTON_SPACING / 2,
            } as IStyle,
        } as IStyle,
    };
};

export const StepSelect: React.FC = () => {
    const { scene } = useScene();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const steps = useMemo(() => scene.steps.map((_, i) => i), [scene.steps.length]);

    const theme = useTheme();
    const classNames = getClassNames(getStepSelectStyles, theme);

    return (
        <Stack horizontal tokens={{ childrenGap: BUTTON_SPACING }} className={classNames.root}>
            <ul>
                {steps.map((i) => (
                    <li key={i}>
                        <StepButton index={i} />
                    </li>
                ))}
            </ul>
            <Stack horizontal tokens={{ childrenGap: BUTTON_SPACING }}>
                <AddStepButton />
                <RemoveStepButton />
            </Stack>
        </Stack>
    );
};
