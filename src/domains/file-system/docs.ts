export type AccessPermissions = 'Read' | 'Write' | 'Execute';
export type PathAccessPermissions = AccessPermissions | AccessPermissions[];

export interface AccessOptions {
    throwError?: boolean;
    permissions?: PathAccessPermissions;
}