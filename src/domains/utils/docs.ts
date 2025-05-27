export interface RandomOptions {
    /** Include numbers. Default: `true` */
    includeNumbers?: boolean;
    /** Include letters. Default: `true` */
    includeLetters?: boolean;
    /** Include symbols: ``!";#$%&'()*+,-./:;<=>?@[]^_`{|}~``. Default: `true` */
    includeSymbols?: boolean;
    /** Include lowercase characters. Default: `true` */
    includeLowerCaseChars?: boolean;
    /** Include uppercase characters. Default: `true` */
    includeUpperCaseChars?: boolean;
    /** Don't begin with a number or symbol. Default: `true` */
    beginWithLetter?: boolean;
    /** Don't use characters like i, l, 1, L, o, 0, O, etc. Default: `true` */
    noSimilarChars?: boolean;
    /** Don't use the same character more than once. Default: `false` */
    noDuplicateChars?: boolean;
    /** Don't use sequential characters, e.g. `abc`, `789`. Default: `true` */
    noSequentialChars?: boolean;
}