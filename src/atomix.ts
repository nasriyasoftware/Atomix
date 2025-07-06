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
import tools from './tools/tools';
import commonUtils from './domains/utils/utils';
import valueIs from './valueIs';

class Atomix {
    /**
     * Type guard functions for validating and narrowing values at runtime.
     * Useful for safely checking primitives, instances, and complex structures.
     * @since v1.0.0
     */
    readonly valueIs = valueIs;

    /**
     * Utilities for working with core JavaScript data types, organized by type.
     * Includes helpers for strings, numbers, arrays, objects, records, and regex.
     * @since v1.0.0
     */
    readonly dataTypes = objectsUtils.freeze({
        string: stringsUtils,
        number: numbersUtils,
        object: objectsUtils,
        record: recordsUtils,
        array: arraysUtils,
        regex: regexUtils,
    })

    /**
     * Path utilities for working with and manipulating file system paths.
     * Compatible with cross-platform path operations.
     * @since v1.0.0
     */
    readonly path = pathUtils;

    /**
     * File system utilities for reading, writing, and checking files/directories.
     * Supports both sync and async operations.
     * @since v1.0.0
     */
    readonly fs = fileSystem;

    /**
     * HTTP-related utilities for encoding, decoding, and managing request/response bodies.
     * Includes support for body codecs and common header handling.
     * @since v1.0.0
     */
    readonly http = httpUtils;

    /**
     * Network utilities for interacting with local/remote addresses, DNS, ports, and tracing.
     * Useful for diagnostics and runtime-aware networking.
     * @since v1.0.0
     */
    readonly networks = networks;

    /**
     * Environment utilities for determining runtime characteristics,
     * such as platform, OS, environment variables, and process metadata.
     * @since v1.0.0
     */
    readonly runtime = runtime;

    /**
     * General-purpose utility functions and safe wrappers around common JS operations.
     * Includes cloning, comparison, type-safe conversions, and more.
     * @since v1.0.0
     */
    readonly utils = commonUtils;

    /**
     * A collection of higher-level tools such as task queues and background managers.
     * Built for coordination, orchestration, and async workflows.
     * @since v1.0.2
     */
    readonly tools = tools;
}

/**
 * @runtimeCompatibility
 * Built and tested on Node.js v22.16.x and later.
 * Compatibility with earlier Node versions is not guaranteed.
 */
const atomix = new Atomix;
export default atomix;