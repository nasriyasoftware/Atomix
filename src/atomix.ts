import arraysUtils from './domains/data-types/array/arrays-utils';
import numbersUtils from './domains/data-types/number/numbers-utils';
import objectsUtils from './domains/data-types/object/objects-utils';
import recordsUtils from './domains/data-types/record/records-utils';
import regexUtils from './domains/data-types/regex/regex-utils';
import stringsUtils from './domains/data-types/string/strings-utils';
import fileSystem from './domains/file-system/file-system';
import httpUtils from './domains/http/http-utils';
import networks from './domains/network/network-utils';
import pathUtils from './domains/path/path';
import runtime from './domains/runtime/runtime';
import commonUtils from './domains/utils/utils';
import valueIs from './valueIs';

export { mimeData } from './domains/http/mimes/mime-data';
export type {
    Mime, FileExtension,
    RRType,
    TracerouteHop, PortCheckOptions,
    IPGeolocation,
    JSONObject, Stringified,
    NonEmptyArray,
    AccessPermissions, PathAccessPermissions, AccessOptions,
    DiscoverHostsOptions,
    DeepReadonly,
    Objects,
    Prettify,
    StringPaddingOptions,
    Serializable
} from './docs/docs';

class Atomix {
    /**
     * A collection of guard functions to check if a value is of a specific type.
     * @since v1.0.0
     */
    readonly valueIs = valueIs;

    /**
     * A module containing utility functions for working with
     * JavaScript data types
     * @since v1.0.0
     */
    readonly dataTypes = {
        string: stringsUtils,
        number: numbersUtils,
        object: objectsUtils,
        record: recordsUtils,
        array: arraysUtils,
        regex: regexUtils,
    }

    /**
     * A module containing utility functions for working with
     * file paths.
     * @since v1.0.0
     */
    readonly path = pathUtils;

    /**
     * A module containing utility functions for working with
     * the file system.
     * @since v1.0.0
     */
    readonly fs = fileSystem;

    /**
     * A module containing utility functions for working with
     * HTTP requests and responses.
     * @since v1.0.0
     */
    readonly http = httpUtils;

    /**
     * A module containing utility functions for working with
     * the network.
     * @since v1.0.0
     */
    readonly networks = networks;

    /**
     * A module containing utility functions for working with
     * the runtime environment.
     * @since v1.0.0
     */
    readonly runtime = runtime;

    /**
     * A module containing general and common utility functions
     * @since v1.0.0
     */
    readonly utils = commonUtils;
}

/**
 * @runtimeCompatibility
 * Built and tested on Node.js v22.16.x and later.
 * Compatibility with earlier Node versions is not guaranteed.
 */
const atomix = new Atomix;
export default atomix;