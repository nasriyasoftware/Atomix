export type AccessPermissions = 'Read' | 'Write' | 'Execute';
export type PathAccessPermissions = AccessPermissions | AccessPermissions[];

export interface AccessOptions {
    throwError?: boolean;
    permissions?: PathAccessPermissions;
}

export interface WatcherConfigs {
    /** The absolute path to the file or folder. */
    path: string;
    /** The interval in milliseconds at which the file or folder is checked for changes. Default: `200`. */
    debounceInterval?: number;
    handlers: WatcherEvents;
}

export type WatcherOptions = Omit<WatcherConfigs, 'path'>;

export interface WatcherEvents {
    /** The function to call when changes occur. */
    onModify: () => void;
    /** Called when the file/folder is renamed, deleted, or otherwise becomes inaccessible. */
    onDisconnect: () => void;
}