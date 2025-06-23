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
});