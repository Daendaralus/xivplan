import { sceneToText, textToScene } from '../file';
import { Group } from '../scene';
import { createPaste, retrievePaste } from './pasteMystShare';

export async function getShareLink(groups: Group[]): Promise<string> {
    const data = sceneToText(groups);
    console.log("trying to create paste");
    const id = await createPaste(data);
    console.log("created paste: " + id);
    return `${location.protocol}//${location.host}${location.pathname}#/plan/${id}`;
}

const PLAN_PREFIX = '#/plan/';

function getPlanData(hash: string, searchParams?: URLSearchParams): string | undefined {
    // Current share links are formatted as /#/plan/<data>
    if (hash.startsWith(PLAN_PREFIX)) {
        return decodeURIComponent(hash.substring(PLAN_PREFIX.length));
    }

    // Previously, links were formatted as /?path=<data>
    const data = searchParams?.get('plan');
    if (data) {
        return data;
    }

    return undefined;
}

export async function parseSceneLink(url: URL): Promise<Group[] | undefined>;
export async function parseSceneLink(hash: string, searchParams: URLSearchParams): Promise<Group[] | undefined>;
export async function parseSceneLink(hash: string | URL, searchParams?: URLSearchParams): Promise<Group[] | undefined> {
    if (hash instanceof URL) {
        return parseSceneLink(hash.hash, hash.searchParams);
    }

    const data = getPlanData(hash, searchParams);
    if (data) {
        return textToScene(await retrievePaste(data));
    }

    return undefined;
}
