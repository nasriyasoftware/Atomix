import recordsUtils from "../../data-types/record/records-utils";
import stringsUtils from "../../data-types/string/strings-utils";
import { AccessOptions, AccessPermissions } from "../docs";
import fs from 'fs';

export function getAccessMode(permission: AccessPermissions): number {
    switch (permission) {
        case 'Read': return fs.constants.R_OK;
        case 'Write': return fs.constants.W_OK;
        case 'Execute': return fs.constants.X_OK;
    }
}

export function getAccessOptions(options?: AccessOptions): { throwError: boolean, mode: number } {
    const result = {
        throwError: false,
        mode: fs.constants.F_OK,
    }

    if (options !== undefined) {
        if (!recordsUtils.guard.isRecord(options)) { throw new Error(`The "options" parameter (when provided) should be a record, instead got ${typeof options}`) }

        if (recordsUtils.hasOwnProperty(options, "throwError")) {
            if (typeof options.throwError !== "boolean") { throw new TypeError(`The "throwError" property should be a boolean, instead got ${typeof options.throwError}`); }
            result.throwError = options.throwError;
        }

        if (recordsUtils.hasOwnProperty(options, "permissions")) {
            const accepted: AccessPermissions[] = ['Read', 'Write', 'Execute'];
            const valid: AccessPermissions[] = [];

            if (stringsUtils.guard.isString(options.permissions)) {
                if (!accepted.includes(options.permissions)) { throw new Error(`The "permissions" property should be one of the following: ${accepted.join(', ')}, instead got ${options.permissions}`) }
                valid.push(options.permissions);
            }

            if (Array.isArray(options.permissions)) {
                for (const permission of options.permissions) {
                    if (!accepted.includes(permission)) { throw new Error(`The "permissions" property should be one of the following: ${accepted.join(', ')}, instead got ${permission}`) }
                    valid.push(permission);
                }
            }

            for (const permission of valid) {
                result.mode = result.mode | getAccessMode(permission);
            }
        }
    }

    return result;
}