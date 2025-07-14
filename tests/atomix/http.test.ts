import atomix from "../../src/atomix";

describe("the 'http' module", () => {
    const http = atomix.http;

    it("should be defined", () => {
        expect(http).toBeDefined();
    });

    it('should convert "btoa" and "atob" values correctly', () => {
        const text = 'Hello World! Nasriya Software';
        const encoded = 'SGVsbG8gV29ybGQhIE5hc3JpeWEgU29mdHdhcmU=';

        expect(http.btoa(text)).toBe(encoded);
        expect(http.atob(encoded)).toBe(text);
    })

    it('should validate emails correctly', () => {
        expect(http.guard.isEmail('KvY2w@example.com')).toBe(true);
        expect(http.guard.isEmail('invalid-email')).toBe(false);
        expect(http.guard.isEmail('')).toBe(false);
        expect(http.guard.isEmail(null)).toBe(false);
        expect(http.guard.isEmail(undefined)).toBe(false);
    })

    it('should detect HTML strings correctly', () => {
        expect(http.guard.isHTML('<p>Hello, world!</p>')).toBe(true);
        expect(http.guard.isHTML('<p>')).toBe(true);
        expect(http.guard.isHTML('Hello, world!')).toBe(false);
        expect(http.guard.isHTML('')).toBe(false);
        expect(http.guard.isHTML(null!)).toBe(false);
        expect(http.guard.isHTML(undefined!)).toBe(false);
        expect(http.guard.isHTML(123 as any)).toBe(false);
        expect(http.guard.isHTML({} as any)).toBe(false);
        expect(http.guard.isHTML([] as any)).toBe(false);
        expect(http.guard.isHTML(new Date() as any)).toBe(false);
        expect(http.guard.isHTML('<a')).toBe(false);
        expect(http.guard.isHTML('<a>')).toBe(true);
        expect(http.guard.isHTML('<a></a>')).toBe(true);
    })

    it('should detect MIME types correctly', () => {
        expect(http.guard.isMimeType('text/plain')).toBe(true);
        expect(http.guard.isMimeType('application/json')).toBe(true);
        expect(http.guard.isMimeType('image/jpeg')).toBe(true);
        expect(http.guard.isMimeType('audio/mpeg')).toBe(true);
        expect(http.guard.isMimeType('video/mp4')).toBe(true);
        expect(http.guard.isMimeType('')).toBe(false);
        expect(http.guard.isMimeType(null!)).toBe(false);
        expect(http.guard.isMimeType(undefined!)).toBe(false);
        expect(http.guard.isMimeType(123 as any)).toBe(false);
        expect(http.guard.isMimeType({} as any)).toBe(false);
        expect(http.guard.isMimeType([] as any)).toBe(false);
        expect(http.guard.isMimeType(new Date() as any)).toBe(false);
    })

    it("should encode and decode values using 'bodyCodec'", () => {
        const samples: unknown[] = [
            'hello',
            42,
            false,
            null,
            undefined,
            [1, 'a', true],
            { key: 'value', num: 99 },
            new Set([1, 2, 3]),
            new Map([
                ['a', 1],
                ['b', 2],
            ]),
        ];

        for (const sample of samples) {
            const encoded = http.bodyCodec.encode(sample as any);
            const decoded = http.bodyCodec.decode(encoded);
            expect(decoded).toEqual(sample);
        }
    });

    it("should throw on encoding a function", () => {
        expect(() => {
            http.bodyCodec.encode(() => { });
        }).toThrow(TypeError);
    });

    it("should throw on encoding circular structures", () => {
        const obj: any = {};
        obj.self = obj;

        expect(() => {
            http.bodyCodec.encode(obj);
        }).toThrow(TypeError);
    });

    describe('http.sanitize (string input)', () => {
        it('should trim and remove HTML by default', () => {
            const result = http.sanitize('  <b>Hello</b>  ');
            expect(result.ok).toBe(false); // because of HTML removal
            expect(result.violations).toHaveLength(1); // Only 'html' is tracked
            expect(result.violations[0].rule).toBe('html');
        });

        it('should allow HTML if allowHTML is true', () => {
            const result = http.sanitize('<b>Hello</b>', { allowHTML: true });
            expect(result.output).toBe('<b>Hello</b>');
            expect(result.ok).toBe(true);
            expect(result.violations).toHaveLength(0);
        });

        it('should remove Unicode characters by default', () => {
            const result = http.sanitize('Hi 👋');
            expect(result.output).toBe('Hi');
            expect(result.ok).toBe(false);
            expect(result.violations[0].rule).toBe('unicode');
        });

        it('should allow Unicode if allowUnicode is true', () => {
            const result = http.sanitize('Hi 👋', { allowUnicode: true });
            expect(result.output).toBe('Hi 👋');
            expect(result.ok).toBe(true);
        });

        it('should apply deny pattern', () => {
            const result = http.sanitize('hello$', { deny: /\$/g });
            expect(result.output).toBe('hello');
            expect(result.ok).toBe(false);
            expect(result.violations[0].rule).toBe('deny');
        });

        it('should apply allow pattern', () => {
            const result = http.sanitize('abc123!@#', { allow: /[a-z]/g });
            expect(result.output).toBe('abc');
            expect(result.ok).toBe(false);
            expect(result.violations[0].rule).toBe('allow');
        });

        it('should enforce max length', () => {
            const result = http.sanitize('abcdefgh', { maxLength: 5 });
            expect(result.output).toBe('abcde');
            expect(result.ok).toBe(false);
            expect(result.violations[0].rule).toBe('length');
        });

        it('should throw if strict mode is enabled and a rule is violated', () => {
            expect(() =>
                http.sanitize('<hi>', { allowHTML: false, strict: true })
            ).toThrow(/Sanitization violation/);
        });
    });

    describe('http.sanitize (record input)', () => {
        it('should sanitize each field individually', () => {
            const input = {
                username: '  <admin>',
                bio: 'Hello 👋',
            };

            const result = http.sanitize(input, {
                username: { allowHTML: false },
                bio: { allowUnicode: false },
            });

            expect(result.ok).toBe(false);
            expect(result.output.username).toBe('');
            expect(result.output.bio).toBe('Hello');
            expect(result.violations.username[0].rule).toBe('html');
            expect(result.violations.bio[0].rule).toBe('unicode');
        });

        it('should handle empty config (defaults)', () => {
            const input = { name: '  <b>John</b> 👋 ' };
            const result = http.sanitize(input);

            expect(result.ok).toBe(false);
            expect(result.output.name).toBe('John');
            expect(result.violations.name.length).toBeGreaterThan(0);
        });

        it('should throw if input is not a string or record', () => {
            expect(() => http.sanitize(123 as any)).toThrow(TypeError);
        });

        it('should return ok=true and no violations when input is clean', () => {
            const input = 'hello';
            const result = http.sanitize(input);
            expect(result.ok).toBe(true);
            expect(result.violations).toHaveLength(0);
        });
    });
});