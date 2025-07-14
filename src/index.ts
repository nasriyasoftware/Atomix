import atomix from './atomix';
export default atomix;

// Main index: `@nasriya/atomix`
export { mimeData } from './domains/http/mimes/mime-data';
export { currencies } from './data/currencies';
export type {
    Mime, FileExtension,
    RRType,
    TracerouteHop, PortCheckOptions,
    IPGeolocation,
    JSONObject, Stringified,
    NonEmptyArray,
    AccessPermissions, PathAccessPermissions, AccessOptions,
    DiscoverHostsOptions,
    Objects, DeepReadonly, Prettify, Brand, LooseToStrict,
    StringPaddingOptions,
    Serializable,
    RandomOptions,
    BaseQueueTask,
    EventHandler, AddHandlerOptions,
    InputSanitizationOptions, FieldRuleMap, SanitizedResult, SanitizationViolation,
} from './docs/docs';