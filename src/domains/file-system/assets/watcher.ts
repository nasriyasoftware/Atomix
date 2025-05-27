import fs from 'fs';
import path from 'path';
import recordsUtils from '../../data-types/record/records-utils';
import numbersUtils from '../../data-types/number/numbers-utils';
import stringsUtils from '../../data-types/string/strings-utils';
import { WatcherConfigs } from '../docs';

class Watcher {
    #_watching = false;
    readonly #_data = {
        path: '',
        fileName: undefined as string | undefined,
        watcher: {} as fs.FSWatcher,
        type: 'File' as 'File' | 'Directory',
    }

    readonly #_configs = {
        timeout: {} as NodeJS.Timeout,
        interval: 200,
        callback: (event: fs.WatchEventType) => { },
        handler: (event: fs.WatchEventType) => { },
    }

    readonly #_events = {
        onModify: () => { },
        onDisconnect: () => { },
    }

    constructor(configs: WatcherConfigs) {
        const hasOwnProperty = recordsUtils.hasOwnProperty;

        if (hasOwnProperty(configs, 'path')) {
            if (!stringsUtils.guard.isString(configs.path)) { throw new TypeError('The provided path must be a string.') }
            if (!fs.existsSync(configs.path)) { throw new Error('The provided path does not exist.') }

            const stats = fs.statSync(configs.path);
            this.#_data.type = stats.isDirectory() ? 'Directory' : 'File';
            this.#_data.path = path.resolve(configs.path)

            if (this.#_data.type === 'File') {
                this.#_data.fileName = path.basename(configs.path);
            }
        } else {
            throw new SyntaxError(`The provided configs must have a 'path' property.`)
        }

        if (hasOwnProperty(configs, 'handlers')) {
            if (!recordsUtils.guard.isRecord(configs.handlers)) { throw new TypeError(`The provided handlers must be a record, instead got ${typeof configs.handlers}.`) }
            if (recordsUtils.guard.isEmpty(configs.handlers)) { throw new Error(`The provided handlers must not be empty.`) }

            if (hasOwnProperty(configs.handlers, 'onModify')) {
                if (typeof configs.handlers.onModify !== 'function') { throw new TypeError('The provided onModify must be a function.') }
                this.#_events.onModify = configs.handlers.onModify;
            } else {
                throw new SyntaxError(`The provided configs must have a 'onModify' property.`)
            }

            if (recordsUtils.hasOwnProperty(configs.handlers, 'onDisconnect')) {
                if (typeof configs.handlers.onDisconnect !== 'function') { throw new TypeError('The provided onDisconnect must be a function.') }
                this.#_events.onDisconnect = configs.handlers.onDisconnect;
            } else {
                throw new SyntaxError(`The provided configs must have a 'onDisconnect' property.`)
            }
        } else {
            throw new SyntaxError(`The provided configs must have a 'handlers' property.`)
        }

        if (hasOwnProperty(configs, 'debounceInterval')) {
            if (!numbersUtils.guard.isNumber(configs.debounceInterval)) { throw new TypeError('The provided debounce interval must be a number.') }
            if (!numbersUtils.guard.isInteger(configs.debounceInterval)) { throw new TypeError('The provided debounce interval must be an integer.') }
            if (configs.debounceInterval < 0) { throw new Error('The provided debounce interval must be greater than or equal to 0.') }
            this.#_configs.interval = configs.debounceInterval;
        }

        this.#_configs.handler = (event: fs.WatchEventType) => {
            clearTimeout(this.#_configs.timeout);
            this.#_configs.timeout = setTimeout(() => {
                this.#_configs.callback(event);
            }, this.#_configs.interval);
        }
    }


    /**
     * Starts watching the specified file for changes.
     * 
     * @description
     * This method sets up a file system watcher on the file path provided in the
     * configuration. It triggers the `onModify` callback when the file is modified,
     * and the `onDisconnect` callback if the file is renamed or deleted.
     * 
     * @throws Error if there is an issue with setting up the watcher.
     * 
     * @returns {void}
     */

    watch(): void {
        if (this.#_watching) { return; }
        const handler: fs.WatchListener<string> = (event, filename) => {
            if (event === 'rename' && !fs.existsSync(this.#_data.path)) {
                this.#_events.onDisconnect();
                return;
            }

            this.#_events.onModify();
        }

        this.#_data.watcher = fs.watch(this.#_data.path, handler);
        

        this.#_data.watcher.on('error', (err) => {
            console.error(`[watch error] ${this.#_data.path}:`, err);
        })

        this.#_watching = true;
    }


    stop(): void {
        if (this.#_watching) {
            this.#_data.watcher.close();
            this.#_watching = false;
        }
    }

    /**
     * Retrieves whether or not the file is currently being watched for changes.
     * @returns {boolean} Whether or not the file is currently being watched for changes.
     */
    get isWatching(): boolean { return this.#_watching }
}

export default Watcher;