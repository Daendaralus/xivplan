import localforage from 'localforage';
import { Group } from '../scene';

interface FileMetadata {
    timestamp: string;
}

const files = localforage.createInstance({
    name: 'XIVPlan Files',
    storeName: 'files',
});

const metadata = localforage.createInstance({
    name: 'XIVPlan File Metadata',
    storeName: 'meta',
});

export async function saveFileLocal(groups: Readonly<Group[]>, name: string): Promise<void> {
    const meta: FileMetadata = {
        timestamp: new Date().toISOString(),
    };

    await files.setItem(name, groups);
    await metadata.setItem(name, meta);
}

export async function openFileLocal(name: string): Promise<Group[]> {
    const groups = await files.getItem<Group[]>(name);
    if (!groups) {
        throw new Error(`Failed to open file "${name}"`);
    }
    return groups;
}

export async function deleteFileLocal(name: string): Promise<void> {
    await files.removeItem(name);
}

export interface FileEntry {
    name: string;
    lastEdited?: Date;
}

/**
 * @returns A list of files in browser storage, sorted with the most recently
 * modified files first.
 */
export async function listLocalFiles(): Promise<FileEntry[]> {
    const entries: FileEntry[] = [];
    const keys = await files.keys();

    for (const key of keys) {
        const meta = await metadata.getItem<FileMetadata>(key);
        entries.push({
            name: key,
            lastEdited: meta?.timestamp ? new Date(meta.timestamp) : undefined,
        });
    }

    entries.sort((a, b) => (b.lastEdited?.getTime() ?? 0) - (a.lastEdited?.getTime() ?? 0));

    return entries;
}
