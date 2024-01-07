/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { PropsWithChildren } from 'react';
import { copyObjects } from './copy';
import {
    Arena,
    ArenaShape,
    DEFAULT_GROUP,
    Grid,
    Group,
    Scene,
    SceneObject,
    SceneObjectWithoutId,
    SceneStep,
    Tether,
    isTether
} from './scene';
import { createUndoContext } from './undo/undoContext';
import { asArray, clamp } from './util';

export interface SetArenaAction {
    type: 'arena';
    value: Arena;
}

export interface SetArenaShapeAction {
    type: 'arenaShape';
    value: ArenaShape;
}

export interface SetArenaWidthAction {
    type: 'arenaWidth';
    value: number;
}

export interface SetArenaHeightAction {
    type: 'arenaHeight';
    value: number;
}

export interface SetArenaPaddingAction {
    type: 'arenaPadding';
    value: number;
}

export interface SetArenaGridAction {
    type: 'arenaGrid';
    value: Grid;
}

export interface SetArenaBackgroundAction {
    type: 'arenaBackground';
    value: string | undefined;
}

export interface SetArenaBackgroundOpacityAction {
    type: 'arenaBackgroundOpacity';
    value: number;
}

export type ArenaAction =
    | SetArenaAction
    | SetArenaShapeAction
    | SetArenaWidthAction
    | SetArenaHeightAction
    | SetArenaPaddingAction
    | SetArenaGridAction
    | SetArenaBackgroundAction
    | SetArenaBackgroundOpacityAction;

export interface ObjectUpdateAction {
    type: 'update';
    value: SceneObject | readonly SceneObject[];
}

export interface ObjectAddAction {
    type: 'add';
    object: SceneObjectWithoutId | readonly SceneObjectWithoutId[];
}

export interface ObjectRemoveAction {
    type: 'remove';
    ids: number | readonly number[];
}

export interface ObjectMoveAction {
    type: 'move';
    from: number;
    to: number;
}

export interface GroupMoveAction {
    type: 'moveUp' | 'moveDown' | 'moveToTop' | 'moveToBottom';
    ids: number | readonly number[];
}

export type ObjectAction =
    | ObjectAddAction
    | ObjectRemoveAction
    | ObjectMoveAction
    | GroupMoveAction
    | ObjectUpdateAction;

export interface SetStepAction {
    type: 'setStep';
    index: number;
}

export interface RenameStepAction {
    type: 'renameStep';
    index: number;
    name: string;
}

export interface IncrementStepAction {
    type: 'nextStep' | 'previousStep';
}

export interface AddStepAction {
    type: 'addStep';
    after?: number;
}

export interface RemoveStepAction {
    type: 'removeStep';
    index: number;
}
export interface RenameGroupAction {
    type: 'renameGroup';
    index: number;
    name: string;
}

export interface SetGroupAction {
    type: 'setGroup';
    index: number;
}

export interface AddGroupAction {
    type: 'addGroup';
    name?: string;
}

export interface RemoveGroupAction {
    type: 'removeGroup';
    index: number;
}

export interface IncrementGroupAction {
    type: 'nextGroup' | 'previousGroup';
}

export type StepAction = SetStepAction | IncrementStepAction | AddStepAction | RemoveStepAction | RenameStepAction;
export interface SetSourceAction {
    type: 'setSource';
    source: FileSource | undefined;
}

export type GroupAction = IncrementGroupAction | RenameGroupAction | SetGroupAction | AddGroupAction | RemoveGroupAction;

export type SceneAction = ArenaAction | ObjectAction | StepAction | SetSourceAction | GroupAction;

export interface LocalFileSource {
    type: 'local';
    name: string;
}

export type FileSource = LocalFileSource;

export interface EditorState {
    groups: Group[];
    currentGroup: number; // Index of the current group
    currentStep: number;
    source?: FileSource;
    dispatch?: React.Dispatch<SceneAction>;
}

function getCurrentStep(state: EditorState): SceneStep {
    const currentGroup = state.groups[state.currentGroup];
    if (!currentGroup) {
        throw new Error(`Invalid group index ${state.currentGroup}`);
    }

    const currentScene = currentGroup.scene;
    if (!currentScene) {
        throw new Error(`Invalid scene in group ${state.currentGroup}`);
    }

    const step = currentScene.steps[state.currentStep];
    if (!step) {
        throw new Error(`Invalid step index ${state.currentStep} in scene ${currentScene}`);
    }
    
    return step;
}


const HISTORY_SIZE = 1000;

const { UndoProvider, Context, usePresent, useUndoRedo, useReset } = createUndoContext(sceneReducer, HISTORY_SIZE);

export interface SceneProviderProps extends PropsWithChildren {
    initialGroup?: Group[];
}

export const SceneProvider: React.FC<SceneProviderProps> = ({ initialGroup, children }) => {
    const initialState: EditorState = {
        groups: initialGroup ?? [DEFAULT_GROUP],
        currentGroup: 0,
        currentStep: 0,
    };

    return <UndoProvider initialState={initialState}>{children}</UndoProvider>;
};


export const SceneContext = Context;

export interface SceneContext {
    scene: Scene;
    step: SceneStep;
    stepIndex: number;
    source?: FileSource;
    dispatch: React.Dispatch<SceneAction>;
}

export function useEditorState(): EditorState {
    const [present, dispatch] = usePresent();
    return { ...present, dispatch };
}

export function useScene(): SceneContext {
    const [present, dispatch] = usePresent();

    const currentGroup = present.groups[present.currentGroup];
    if (!currentGroup) {
        throw new Error(`Invalid group index ${present.currentGroup}`);
    }

    const currentScene = currentGroup.scene;
    if (!currentScene) {
        throw new Error(`Invalid scene in group ${present.currentGroup}`);
    }

    return {
        scene: currentScene,
        step: getCurrentStep(present),
        stepIndex: present.currentStep,
        source: present.source,
        dispatch,
    };
}


export function useCurrentStep(): SceneStep {
    const [present] = usePresent();
    return getCurrentStep(present);
}

export const useSceneUndoRedo = useUndoRedo;

export function useLoadGroup(): (groups: Group[], source?: FileSource) => void {
    const reset = useReset();
    return (groups: Group[], source?: FileSource) => {
        reset({ 
            groups: groups, 
            currentGroup: 0,
            currentStep: 0,
            source 
        });
    };
}

export function useLoadScene(): (scene: Scene, source?: FileSource) => void {
    const reset = useReset();
    return (scene: Scene, source?: FileSource) => {
        const newGroup: Group = {
            name: 'Loaded Group', // You might want a way to set this name
            scene: scene
        };
        reset({ 
            groups: [newGroup], 
            currentGroup: 0,
            currentStep: 0,
            source 
        });
    };
}


export function getObjectById(scene: Scene, id: number): SceneObject | undefined {
    for (const step of scene.steps) {
        const object = step.objects.find((o) => o.id === id);
        if (object) {
            return object;
        }
    }

    return undefined;
}

function getTetherIndex(objects: readonly SceneObject[], tether: Tether): number {
    // Tethers should be created below their targets.
    let startIdx = objects.findIndex((x) => x.id === tether.startId);
    let endIdx = objects.findIndex((x) => x.id === tether.endId);

    if (startIdx < 0) {
        startIdx = objects.length;
    }
    if (endIdx < 0) {
        endIdx = objects.length;
    }
    return Math.min(startIdx, endIdx);
}

function assignObjectIds(
    scene: Readonly<Scene>,
    objects: readonly SceneObjectWithoutId[],
): { objects: SceneObject[]; nextId: number } {
    let nextId = scene.nextId;

    const newObjects = objects
        .map((obj) => {
            if (obj.id !== undefined) {
                return obj as SceneObject;
            }
            return { ...obj, id: nextId++ };
        })
        .filter((obj) => {
            if (objects.some((existing) => existing.id === obj.id)) {
                console.error(`Cannot create new object with already-used ID ${obj.id}`);
                return false;
            }
            return true;
        });

    return {
        objects: newObjects,
        nextId,
    };
}

function setStep(state: Readonly<EditorState>, index: number): EditorState {
    const currentGroup = state.groups[state.currentGroup];
    if (!currentGroup) {
        throw new Error(`Invalid group index ${state.currentGroup}`);
    }

    const currentScene = currentGroup.scene;
    if (!currentScene) {
        throw new Error(`Invalid scene in group ${state.currentGroup}`);
    }

    if (index === state.currentStep) {
        return state;
    }

    return {
        ...state,
        currentStep: clamp(index, 0, currentScene.steps.length - 1),
    };
}

function renameGroup(state: Readonly<EditorState>, index: number, newName: string): EditorState {
    const newGroups = state.groups.map((group, idx) => {
        if (idx === index) {
            return { ...group, name: newName };
        }
        return group;
    });

    return { ...state, groups: newGroups };
}

function setGroup(state: Readonly<EditorState>, index: number): EditorState {
    if (index < 0 || index >= state.groups.length) {
        throw new Error(`Invalid group index ${index}`);
    }

    return { ...state, currentGroup: index, currentStep: 0 };
}

function addGroup(state: Readonly<EditorState>, newGroupName?: string): EditorState {
    const newGroup: Group = {
        name: newGroupName,
        ...DEFAULT_GROUP
    };

    return {
        ...state,
        groups: [...state.groups, newGroup]
    };
}

function removeGroup(state: Readonly<EditorState>, index: number): EditorState {
    if (index < 0 || index >= state.groups.length) {
        throw new Error(`Invalid group index ${index}`);
    }

    const newGroups = state.groups.filter((_, idx) => idx !== index);

    return {
        ...state,
        groups: newGroups,
        // Reset current group to the first one if the current group is the one being removed
        currentGroup: state.currentGroup === index ? 0 : state.currentGroup
    };
}

function updateGroup(state: Readonly<EditorState>, index: number, updatedGroupData: Partial<Group>): EditorState {
    if (index < 0 || index >= state.groups.length) {
        throw new Error(`Invalid group index ${index}`);
    }

    const newGroups = state.groups.map((group, idx) => {
        if (idx === index) {
            return { ...group, ...updatedGroupData };
        }
        return group;
    });

    return { ...state, groups: newGroups };
}

function updateCurrentGroup(state: Readonly<EditorState>, updatedGroupData: Partial<Group>): EditorState {
    const currentGroupIndex = state.currentGroup;

    const newGroups = state.groups.map((group, idx) => {
        if (idx === currentGroupIndex) {
            return { ...group, ...updatedGroupData };
        }
        return group;
    });

    return { ...state, groups: newGroups };
}


function renameStep(state: Readonly<EditorState>, index: number, name: string): EditorState {
    const currentGroup = state.groups[state.currentGroup];
    if (!currentGroup) {
        throw new Error(`Invalid group index ${state.currentGroup}`);
    }

    const currentScene = currentGroup.scene;
    if (!currentScene) {
        throw new Error(`Invalid scene in group ${state.currentGroup}`);
    }

    const steps = [...currentScene.steps];
    const objects = [...(steps[index]?.objects ?? [])];
    const newStep = { ...steps[index], name, objects };
    steps[index] = newStep;

    const newScene = { ...currentGroup.scene, steps };

    const newGroups = [...state.groups];
    newGroups[state.currentGroup] = { ...currentGroup, scene: newScene };

    return {
        ...state,
        groups: newGroups,
    };
}


function addStep(state: Readonly<EditorState>, after: number): EditorState {
    const currentGroup = state.groups[state.currentGroup];
    if (!currentGroup) {
        throw new Error(`Invalid group index ${state.currentGroup}`);
    }

    const currentScene = currentGroup.scene;
    if (!currentScene) {
        throw new Error(`Invalid scene in group ${state.currentGroup}`);
    }

    const currentStep = getCurrentStep(state);
    const copy = copyObjects(currentScene, currentStep.objects);
    const { objects, nextId } = assignObjectIds(currentScene, copy);
    const name = currentStep.name;
    const newStep: SceneStep = { objects, name };

    const steps = currentScene.steps.slice();
    steps.splice(after + 1, 0, newStep);

    const newScene = { ...currentScene, nextId, steps };
    const newGroups = [...state.groups];
    newGroups[state.currentGroup] = { ...currentGroup, scene: newScene };

    return {
        ...state,
        groups: newGroups,
        currentStep: after + 1,
    };
}


function removeStep(state: Readonly<EditorState>, index: number): EditorState {
    const currentGroup = state.groups[state.currentGroup];
    if (!currentGroup) {
        throw new Error(`Invalid group index ${state.currentGroup}`);
    }

    const currentScene = currentGroup.scene;
    if (!currentScene) {
        throw new Error(`Invalid scene in group ${state.currentGroup}`);
    }

    const newSteps = currentScene.steps.slice();
    newSteps.splice(index, 1);

    if (newSteps.length === 0) {
        newSteps.push({ objects: [] });
    }

    let currentStep = state.currentStep;
    if (index === currentStep) {
        currentStep--;
    }
    currentStep = clamp(currentStep, 0, newSteps.length - 1);

    const newScene = { ...currentScene, steps: newSteps };

    const newGroups = [...state.groups];
    newGroups[state.currentGroup] = { ...currentGroup, scene: newScene };

    return {
        ...state,
        groups: newGroups,
        currentStep,
    };
}


function updateStep(scene: Readonly<Scene>, index: number, step: SceneStep): Scene {
    const result: Scene = {
        nextId: scene.nextId,
        arena: scene.arena,
        steps: [...scene.steps],
    };
    result.steps[index] = step;
    return result;
}

function updateCurrentStep(state: Readonly<EditorState>, step: SceneStep): EditorState {
    const currentGroup = state.groups[state.currentGroup];
    if (!currentGroup) {
        throw new Error(`Invalid group index ${state.currentGroup}`);
    }

    const currentScene = currentGroup.scene;
    if (!currentScene) {
        throw new Error(`Invalid scene in group ${state.currentGroup}`);
    }

    const updatedScene = updateStep(currentScene, state.currentStep, step);

    const newGroups = [...state.groups];
    newGroups[state.currentGroup] = { ...currentGroup, scene: updatedScene };

    return {
        ...state,
        groups: newGroups,
    };
}


function addObjects(
    state: Readonly<EditorState>,
    objects: SceneObjectWithoutId | readonly SceneObjectWithoutId[],
): EditorState {
    const currentGroup = state.groups[state.currentGroup];
    if (!currentGroup) {
        throw new Error(`Invalid group index ${state.currentGroup}`);
    }

    const currentScene = currentGroup.scene;
    if (!currentScene) {
        throw new Error(`Invalid scene in group ${state.currentGroup}`);
    }

    const currentStep = getCurrentStep(state);
    const { objects: addedObjects, nextId } = assignObjectIds(currentScene, asArray(objects));
    const newObjects = [...currentStep.objects];

    for (const object of addedObjects) {
        if (isTether(object)) {
            newObjects.splice(getTetherIndex(newObjects, object), 0, object);
        } else {
            newObjects.push(object);
        }
    }

    const updatedScene = updateStep(currentScene, state.currentStep, { objects: newObjects, name: currentStep.name });

    const newScene = { ...updatedScene, nextId };

    const newGroups = [...state.groups];
    newGroups[state.currentGroup] = { ...currentGroup, scene: newScene };

    return {
        ...state,
        groups: newGroups,
    };
}


function removeObjects(state: Readonly<EditorState>, ids: readonly number[]): EditorState {
    const currentStep = getCurrentStep(state);

    const objects = currentStep.objects.filter((object) => {
        if (ids.includes(object.id)) {
            return false;
        }

        if (isTether(object)) {
            // Delete any tether that is tethered to a deleted object.
            return !ids.includes(object.startId) && !ids.includes(object.endId);
        }

        return true;
    });

    return updateCurrentStep(state, { objects, name: currentStep.name });
}

function moveObject(state: Readonly<EditorState>, from: number, to: number): EditorState {
    if (from === to) {
        return state;
    }

    const currentStep = getCurrentStep(state);

    const objects = currentStep.objects.slice();
    const items = objects.splice(from, 1);
    objects.splice(to, 0, ...items);

    return updateCurrentStep(state, { objects, name: currentStep.name });
}

function mapSelected(step: Readonly<SceneStep>, ids: readonly number[]) {
    return step.objects.map((object) => ({ object, selected: ids.includes(object.id) }));
}

function unmapSelected(objects: { object: SceneObject; selected: boolean }[]): SceneStep {
    return {
        objects: objects.map((o) => o.object),
    };
}

function moveGroupUp(state: Readonly<EditorState>, ids: readonly number[]): EditorState {
    const currentStep = getCurrentStep(state);
    const objects = mapSelected(currentStep, ids);

    for (let i = objects.length - 1; i > 0; i--) {
        const current = objects[i];
        const next = objects[i - 1];

        if (current && next && !current.selected && next.selected) {
            objects[i] = next;
            objects[i - 1] = current;
        }
    }
    const newObjects = unmapSelected(objects).objects;
    return updateCurrentStep(state, {objects: newObjects, name: currentStep.name});
}

function moveGroupDown(state: Readonly<EditorState>, ids: readonly number[]): EditorState {
    const currentStep = getCurrentStep(state);
    const objects = mapSelected(currentStep, ids);

    for (let i = 0; i < objects.length - 1; i++) {
        const current = objects[i];
        const next = objects[i + 1];

        if (current && next && !current.selected && next.selected) {
            objects[i] = next;
            objects[i + 1] = current;
        }
    }
    const newObjects = unmapSelected(objects).objects;
    return updateCurrentStep(state, {objects: newObjects, name: currentStep.name});
}

function moveGroupToTop(state: Readonly<EditorState>, ids: readonly number[]): EditorState {
    const currentStep = getCurrentStep(state);
    const objects = mapSelected(currentStep, ids);

    objects.sort((a, b) => {
        return (a.selected ? 1 : 0) - (b.selected ? 1 : 0);
    });
    const newObjects = unmapSelected(objects).objects;
    return updateCurrentStep(state, {objects: newObjects, name: currentStep.name});
}

function moveGroupToBottom(state: Readonly<EditorState>, ids: readonly number[]): EditorState {
    const currentStep = getCurrentStep(state);
    const objects = mapSelected(currentStep, ids);

    objects.sort((a, b) => {
        return (b.selected ? 1 : 0) - (a.selected ? 1 : 0);
    });
    const newObjects = unmapSelected(objects).objects;
    return updateCurrentStep(state, {objects: newObjects, name: currentStep.name});
}

function updateObjects(state: Readonly<EditorState>, values: readonly SceneObject[]): EditorState {
    const currentStep = getCurrentStep(state);
    const objects = currentStep.objects.slice();

    for (const update of asArray(values)) {
        const index = objects.findIndex((o) => o.id === update.id);
        if (index >= 0) {
            objects[index] = update;
        }
    }

    return updateCurrentStep(state, { objects, name: currentStep.name });
}

function updateArena(state: Readonly<EditorState>, arena: Arena): EditorState {
    const currentGroup = state.groups[state.currentGroup];
    if (!currentGroup) {
        throw new Error(`Invalid group index ${state.currentGroup}`);
    }

    const currentScene = currentGroup.scene;
    if (!currentScene) {
        throw new Error(`Invalid scene in group ${state.currentGroup}`);
    }

    const updatedScene = { ...currentScene, arena };

    const newGroups = [...state.groups];
    newGroups[state.currentGroup] = { ...currentGroup, scene: updatedScene };

    return {
        ...state,
        groups: newGroups,
    };
}


function sceneReducer(state: Readonly<EditorState>, action: SceneAction): EditorState {
    const currentGroup = state.groups[state.currentGroup];
    if (!currentGroup) {
        throw new Error(`Invalid group index ${state.currentGroup}`);
    }
    
    const currentScene = currentGroup.scene;
    if (!currentScene) {
        throw new Error(`Invalid scene`);
    }

    switch (action.type) {
        case 'setSource':
            return { ...state, source: action.source };

        case 'renameGroup':
            return renameGroup(state, action.index, action.name);

        case 'setGroup':
            return setGroup(state, action.index);

        case 'addGroup':
            return addGroup(state, action.name);

        case 'removeGroup':
            return removeGroup(state, action.index);

        case 'nextGroup':
            if (state.currentGroup === state.groups.length - 1) {
                return state;
            }
        
            return setStep(state, state.currentGroup + 1);

        case 'previousGroup':
            if (state.currentStep === 0) {
                return state;
            }
            return setStep(state, state.currentGroup - 1);

        case 'setStep':
            return setStep(state, action.index);

        case 'nextStep':
            if (state.currentStep === currentScene.steps.length - 1) {
                return state;
            }
        
            return setStep(state, state.currentStep + 1);

        case 'previousStep':
            if (state.currentStep === 0) {
                return state;
            }
            return setStep(state, state.currentStep - 1);

        case 'addStep':
            return addStep(state, action.after ?? state.currentStep);

        case 'renameStep':
            return renameStep(state, action.index, action.name);

        case 'removeStep':
            return removeStep(state, action.index);

        case 'arena':
            return updateArena(state, action.value);

        case 'arenaShape':
            return updateArena(state, { ...currentScene.arena, shape: action.value });
            
        case 'arenaWidth':
            return updateArena(state, { ...currentScene.arena, width: action.value });

        case 'arenaHeight':
            return updateArena(state, { ...currentScene.arena, height: action.value });

        case 'arenaPadding':
            return updateArena(state, { ...currentScene.arena, padding: action.value });

        case 'arenaGrid':
            return updateArena(state, { ...currentScene.arena, grid: action.value });

        case 'arenaBackground':
            return updateArena(state, { ...currentScene.arena, backgroundImage: action.value });

        case 'arenaBackgroundOpacity':
            return updateArena(state, { ...currentScene.arena, backgroundOpacity: action.value });

        case 'add':
            return addObjects(state, action.object);

        case 'remove':
            return removeObjects(state, asArray(action.ids));

        case 'move':
            return moveObject(state, action.from, action.to);

        case 'moveUp':
            return moveGroupUp(state, asArray(action.ids));

        case 'moveDown':
            return moveGroupDown(state, asArray(action.ids));

        case 'moveToTop':
            return moveGroupToTop(state, asArray(action.ids));

        case 'moveToBottom':
            return moveGroupToBottom(state, asArray(action.ids));

        case 'update':
            return updateObjects(state, asArray(action.value));
    }

    return state;
}
