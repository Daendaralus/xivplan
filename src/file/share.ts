import { sceneToText, textToScene } from '../file';
import { Group } from '../scene';

export function getShareLink(groups: Group[]): string {
    const data = sceneToText(groups);
    return `${location.protocol}//${location.host}${location.pathname}#/plan/${data}`;
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

export function parseSceneLink(url: URL): Group[] | undefined;
export function parseSceneLink(hash: string, searchParams: URLSearchParams): Group[] | undefined;
export function parseSceneLink(hash: string | URL, searchParams?: URLSearchParams): Group[] | undefined {
    if (hash instanceof URL) {
        return parseSceneLink(hash.hash, hash.searchParams);
    }

    const data = getPlanData(hash, searchParams);
    if (data) {
        return textToScene(data);
    }

    return undefined;
}
