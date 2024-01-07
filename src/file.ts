import { Base64 } from 'js-base64';
import { deflate, inflate } from 'pako';

import { FileSource, LocalFileSource } from './SceneProvider';
import { openFileLocal, saveFileLocal } from './file/localFile';
import { upgradeGroups } from './file/upgrade';
import { Group, Scene } from './scene';

export async function saveFile(groups: Readonly<Group[]>, source: FileSource): Promise<void> {
    switch (source.type) {
        case 'local':
            await saveFileLocal(groups, source.name);
    }
}

export async function openFile(source: FileSource): Promise<Group[]> {
    const scene = await openFileUnvalidated(source);
    return upgradeGroups(scene);
}

async function openFileUnvalidated(source: LocalFileSource) {
    switch (source.type) {
        case 'local':
            return await openFileLocal(source.name);
    }
}

export function sceneToText(groups: Readonly<Group[]>): string {
    const compressed = deflate(sceneToJson(groups));

    return Base64.fromUint8Array(compressed, true);
}

export function textToScene(data: string): Group[] {
    const decompressed = inflate(Base64.toUint8Array(data));

    return jsonToScene(new TextDecoder().decode(decompressed));
}

export function sceneToJson(groups: Readonly<Group[]>): string {
    return JSON.stringify(groups, undefined, 2);
}

export function jsonToScene(json: string): Group[] {
    const groups = upgradeGroups(JSON.parse(json));

    validateScene(groups);
    return groups;
}

function validateScene(obj: unknown): asserts obj is Scene {
    if (typeof obj !== 'object') {
        throw new Error('Expected an object');
    }

    // TODO: try to check that this is valid data
}
