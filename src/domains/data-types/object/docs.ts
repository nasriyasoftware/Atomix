type JSONValue<T> = T extends string | number | null | boolean
    ? T
    : T extends { toJSON(): infer R } ? R
    : T extends undefined | ((...args: any[]) => any) ? never
    : T extends object ? JSONObject<T>
    : never;

export type JSONObject<T> = {
    [Key in keyof T as [JSONValue<T[Key]>] extends [never] ? never : Key]: JSONValue<T[Key]>
};

export type Stringified<ObjectType> = string & { source: ObjectType };