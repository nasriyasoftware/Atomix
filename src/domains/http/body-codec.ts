import valueIs from "../../valueIs";

class BodyCodec {
    readonly #_helpers = {
        serialize: <T extends Serializable>(value: T) => {
            if (value === null) return { type: 'null' };
            if (value === undefined) return { type: 'undefined' };

            const type = (() => {
                const type = typeof value;
                if (type === 'object') {
                    if (valueIs.record(value)) { return 'record' }
                    if (valueIs.array(value)) { return 'array' }
                    if ((value as any) instanceof Set) { return 'set' }
                    if ((value as any) instanceof Map) { return 'map' }
                    if ((value as any) instanceof Date) { return 'date' }
                }

                return type;
            })();

            if (type === 'string' || type === 'number' || type === 'boolean') {
                return { value, type };
            }

            if (type === 'function') {
                throw new TypeError('Functions cannot be encoded for transport');
            }

            if (type === 'record' || type === 'array') {
                try {
                    this.#_helpers.stringify(value as object); // just to detect circular
                    return { value, type };
                } catch {
                    throw new TypeError('Object is not serializable (circular reference)');
                }
            }

            if (type === 'date') {
                return { value: (value as Date).toISOString(), type };
            }

            if (type === 'set') {
                const array = Array.from(value as Set<any>);
                this.#_helpers.stringify(array); // just to detect circular
                return { value: array, type };
            }

            if (type === 'map') {
                const array = Array.from((value as Map<any, any>).entries());
                this.#_helpers.stringify(array); // just to detect circular
                return { value: array, type };
            }

            throw new TypeError(`Unsupported value type: ${type}`);
        },
        deserialize: <T extends EncodedPayload>(payload: T): Serialization[T['type']]['type'] => {
            switch (payload.type) {
                case 'map': {
                    return new Map(payload.value);
                }

                case 'set': {
                    return new Set(payload.value);
                }

                case 'date': {
                    return new Date(payload.value);
                }

                case 'null': {
                    return null;
                }

                case 'undefined': {
                    return undefined;
                }

                default: {
                    return payload.value;
                }
            }
        },
        stringify: (value: Record<string, any>, seen = new WeakSet()) => {
            return JSON.stringify(value, (key, val) => {
                if (typeof val === 'object' && val !== null) {
                    if (seen.has(val)) throw new Error('Circular');
                    seen.add(val);
                }
                return val;
            })
        }
    }

    /**
     * Encodes the given value into a Buffer, which can be sent over the wire.
     *
     * The value is first serialized into a JSON-serializable payload, and then
     * that payload is stringified into a JSON string. The resulting string is
     * then encoded into a Buffer using the UTF8 encoding.
     *
     * @param value - The value to encode.
     * @returns The encoded Buffer.
     * @throws TypeError if the value cannot be serialized.
     * @since v1.0.2
     */
    encode<T extends Serializable>(value: T) {
        const payload = this.#_helpers.serialize(value);
        const stringified = this.#_helpers.stringify(payload);
        return Buffer.from(stringified);
    }

    /**
     * Decodes the given Buffer into its original value. The buffer is expected to
     * contain a stringified JSON representation of an encoded payload.
     *
     * @param buffer - The buffer containing the encoded data.
     * @returns The original value, deserialized from the encoded payload.
     * @throws SyntaxError if the buffer content is not valid JSON.
     * @since v1.0.2
     */
    decode(buffer: Buffer) {
        const stringified = buffer.toString();
        const payload = JSON.parse(stringified) as EncodedPayload;
        return this.#_helpers.deserialize(payload);
    }
}

export interface Serialization {
    string: { type: string; label: 'string'; };
    number: { type: number; label: 'number'; };
    boolean: { type: boolean; label: 'boolean'; };
    null: { type: null; label: 'null'; };
    undefined: { type: undefined; label: 'undefined'; };
    record: { type: Record<string, any>; label: 'record'; }
    array: { type: Array<any>; label: 'array'; }
    set: { type: Set<any>; label: 'set'; }
    map: { type: Map<any, any>; label: 'map'; }
    date: { type: Date; label: 'date'; }
}

export type Serializable = Serialization[keyof Serialization]['type'];
export type EncodedPayload = {
    [K in keyof Serialization]: {
        type: Serialization[K]['label'];
        value: Serialization[K]['type'];
    }
}[keyof Serialization];

const bodyCodec = new BodyCodec();
export default bodyCodec;