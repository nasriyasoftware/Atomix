import atomix from "../../src/atomix";

describe("'dataTypes' module", () => {
    const dataTypes = atomix.dataTypes;
    it("should be defined", () => {
        expect(dataTypes).toBeDefined();
    });

    describe("the 'numbers' utils", () => {
        const number = dataTypes.number;

        it('should be defined', () => {
            expect(number).toBeDefined();
        });
    })

    describe("the 'objects' utils", () => {
        const object = dataTypes.object;
        it('should be defined', () => {
            expect(object).toBeDefined();
        });

        it('should freeze an object correctly', () => {
            {
                const obj = { a: 1, b: 2, c: 3 };
                const frozen = object.freeze(obj);
                expect(frozen).toEqual(obj);
                expect(Object.isFrozen(frozen)).toBe(true);
            }

            {
                const arr = [1, 2, 3];
                const frozen = object.freeze(arr);
                expect(frozen).toEqual(arr);
                expect(Object.isFrozen(frozen)).toBe(true);
            }
        })

        it('should deep freeze an object correctly', () => {
            const obj = { a: 1, b: { c: 2 } };
            const frozen = object.deepFreeze(obj);
            expect(frozen).toEqual(obj);
            expect(Object.isFrozen(frozen)).toBe(true);
            expect(Object.isFrozen(frozen.b)).toBe(true);
        })

        it('should stringify an object correctly', () => {
            const obj = { a: 1, b: { c: 2 } };
            const json = object.stringify(obj);
            expect(json).toEqual(JSON.stringify(obj));
        })

        it('should parse a JSON string into an object correctly', () => {
            const json = JSON.stringify({ a: 1, b: { c: 2 } });
            const obj = object.parse(json as any);
            expect(obj).toEqual({ a: 1, b: { c: 2 } });
        })

        it('should clone objects correctly', () => {
            const obj = { a: 1, b: { c: 2 } };
            const cloned = object.clone(obj);
            expect(cloned).toEqual(obj);
        })

        it('should (smart) clone objects correctly', () => {
            const date = new Date();
            const fn = () => 'hello';
            const nested = { b: 2 };
            const obj: any = {
                a: 1,
                b: nested,
                c: [1, 2, 3],
                d: date,
                e: fn,
                f: new RegExp('abc', 'gi'),
                g: new Map([['key', { deep: true }]]),
                h: new Set(['a', 'b']),
                i: null,
            };
            obj.self = obj; // circular reference

            const clone = object.smartClone(obj);

            // Primitive equality
            expect(clone.a).toBe(1);
            expect(clone.i).toBeNull();

            // Deep equality
            expect(clone.b).not.toBe(obj.b);
            expect(clone.b).toEqual({ b: 2 });

            expect(clone.c).not.toBe(obj.c);
            expect(clone.c).toEqual([1, 2, 3]);

            expect(clone.d).not.toBe(obj.d);
            expect(clone.d.getTime()).toBe(obj.d.getTime());

            expect(clone.f).not.toBe(obj.f);
            expect(clone.f.source).toBe(obj.f.source);
            expect(clone.f.flags).toBe(obj.f.flags);

            expect(clone.g).not.toBe(obj.g);
            expect(clone.g.get('key')).toEqual({ deep: true });

            expect(clone.h).not.toBe(obj.h);
            expect([...clone.h]).toEqual(['a', 'b']);

            // Function reference preserved
            expect(clone.e).toBe(fn);

            // Circular reference preserved
            expect(clone.self).toBe(clone);

            const fn2 = () => 'hello';
            const obj2 = { greet: fn2 };

            const cloned = object.smartClone(obj2);

            // Same reference
            expect(cloned.greet).toBe(fn2);

            // Still works
            expect(cloned.greet()).toBe('hello');
        })
    })

    describe("the 'arrays' utils", () => {
        const array = dataTypes.array;

        it('should return the first item of an array', () => {
            expect(array.head([1, 2, 3])).toBe(1);
            expect(array.head([])).toBeUndefined();
        })

        it('should return the last item of an array', () => {
            expect(array.last([1, 2, 3])).toBe(3);
            expect(array.last([])).toBeUndefined();
        })

        it('should remove all falsy values from an array', () => {
            expect(array.compact([1, 2, 3, 0, false, undefined, null, ''])).toEqual([1, 2, 3]);
            expect(array.compact([])).toEqual([]);
        })

        it('should remove duplicates from an array', () => {
            expect(array.unique([1, 2, 3, 1, 2, 3])).toEqual([1, 2, 3]);
        })

        it('should split an array into chunks correctly', () => {
            const arr1 = [1, 2, 3, 4, 5];
            const arr2 = [6, 7, 8, 9, 10];
            const arr3 = [11, 12, 13, 14, 15];
            const test = [...arr1, ...arr2, ...arr3];

            const chunk = array.chunk(test, 5);
            expect(chunk).toEqual([arr1, arr2, arr3]);
        })

        it('should devide an array into chinks based on the given key function', () => {
            {
                const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                const group = array.groupBy(arr, (item) => item % 3);
                expect(group).toEqual({ 0: [3, 6, 9], 1: [1, 4, 7, 10], 2: [2, 5, 8] });
            }

            {
                const arr = [
                    { type: 'File', name: 'File1' },
                    { type: 'File', name: 'File2' },
                    { type: 'File', name: 'File3' },
                    { type: 'Folder', name: 'Folder1' },
                    { type: 'Folder', name: 'Folder2' },
                    { type: 'Folder', name: 'Folder3' }
                ];

                const group = array.groupBy(arr, (item) => item.type);
                expect(group).toEqual({
                    File: [{ type: 'File', name: 'File1' }, { type: 'File', name: 'File2' }, { type: 'File', name: 'File3' }],
                    Folder: [{ type: 'Folder', name: 'Folder1' }, { type: 'Folder', name: 'Folder2' }, { type: 'Folder', name: 'Folder3' }]
                });
            }

        })

        it('should flatten an array correctly', () => {
            const arr = [1, 2, [3, 4], 5, 6, [7, 8], 9, 10];
            const flat = array.flatten(arr);
            expect(flat).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        })

        it('should (deep) flatten an array correctly', () => {
            const arr = [1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]]]];
            const flat = array.deepFlatten(arr);
            expect(flat).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        })

        it('should return the diference between two arrays', () => {
            const arr1 = [1, 2, 3, 4, 5];
            const arr2 = [3, 4, 5, 6, 7];
            const diff = array.difference(arr1, arr2);
            expect(diff).toEqual([1, 2, 6, 7]);
        })

        it('should return the intersection between two arrays (common elements)', () => {
            const arr1 = [1, 2, 3, 4, 5];
            const arr2 = [3, 4, 5, 6, 7];
            const intersection = array.intersect(arr1, arr2);
            expect(intersection).toEqual([3, 4, 5]);
        })

        it('should toggle (add/remove) a value in an array correctly', () => {
            const originalValue = [1, 2, 3, 4, 5];

            {
                // Test without mutating the original array                    
                const arr = [...originalValue];

                const toggle = array.toggleValue(arr, 3);
                expect(toggle).toEqual([1, 2, 4, 5]);
                expect(arr).toEqual(originalValue);

                const toggle2 = array.toggleValue(toggle, 3);
                expect(toggle2).toEqual([1, 2, 4, 5, 3]);
            }

            {
                // Test with mutating the original array                    
                const arr = [...originalValue];

                array.toggleValue(arr, 3, { mutable: true });
                expect(arr).toEqual([1, 2, 4, 5]);

                array.toggleValue(arr, 3, { mutable: true });
                expect(arr).toEqual([1, 2, 4, 5, 3]);
            }

        })

        it('should asyncronously map an array correctly', async () => {
            const arr = [1, 2, 3, 4, 5];
            const mapped = await array.mapAsync(arr, async (item) => item * 2);
            expect(mapped).toEqual([2, 4, 6, 8, 10]);
        })

        it('should create an array of numbers from a given range', () => {
            const range = array.range(1, 10);
            expect(range).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        })

        it('should transpose a matrix of arrays correctly', () => {
            const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const transposed = array.transpose(matrix);
            expect(transposed).toEqual([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
        })

        it('should shuffle an array correctly', () => {
            const arr = [1, 2, 3, 4, 5];
            const shuffled = array.shuffle(arr);

            const arrSet = new Set(arr);
            const shuffledSet = new Set(shuffled);
            expect(arrSet.size).toBe(shuffledSet.size);
            expect(arrSet).toEqual(shuffledSet);
        })
    })

    describe("the 'records' utils", () => {
        const record = dataTypes.record;
        it('should be defined', () => {
            expect(record).toBeDefined();
        });

        it('should check if a record has a property of its own', () => {
            const obj = { a: 1, b: 2, c: 3 };
            // @ts-ignore
            Object.prototype.test_property = 'test_property';

            expect(Object.prototype.hasOwnProperty.call(obj, 'a')).toBe(true);
            expect(Object.prototype.hasOwnProperty.call(obj, 'b')).toBe(true);
            expect(Object.prototype.hasOwnProperty.call(obj, 'c')).toBe(true);
            expect(Object.prototype.hasOwnProperty.call(obj, 'd')).toBe(false);
            expect(Object.prototype.hasOwnProperty.call(obj, 'test_property')).toBe(false);

            // @ts-ignore
            delete Object.prototype.test_property;

            {
                class Test {
                    a = 1;
                    b = 2;
                    c = 3;
                }

                const obj = new Test();
                // @ts-ignore
                Test.prototype.test_property = 'test_property';
                // @ts-ignore
                expect(obj.test_property).toBe('test_property');
                expect(Object.prototype.hasOwnProperty.call(obj, 'a')).toBe(true);
                expect(Object.prototype.hasOwnProperty.call(obj, 'b')).toBe(true);
                expect(Object.prototype.hasOwnProperty.call(obj, 'c')).toBe(true);
                expect(Object.prototype.hasOwnProperty.call(obj, 'd')).toBe(false);
                expect(Object.prototype.hasOwnProperty.call(obj, 'test_property')).toBe(false);
                // @ts-ignore
                delete Test.prototype.test_property;
            }
        })

        it('should convert an object to a map correctly', () => {
            const obj = { a: 1, b: 2, c: 3 };
            const map = record.toMap(obj);
            expect(map.get('a')).toBe(1);
            expect(map.get('b')).toBe(2);
            expect(map.get('c')).toBe(3);
        })
    })

    describe("the 'regex' module", () => {
        const regex = dataTypes.regex;
        it("should be defined", () => {
            expect(regex).toBeDefined();
        });

        it('should know whether a string is a Glob-like or not', () => {
            expect(regex.guard.isGlobLike('foo')).toBe(false);
            expect(regex.guard.isGlobLike('foo*')).toBe(true);
            expect(regex.guard.isGlobLike('foo?')).toBe(true);
        })

        it('should convert literal strings to exact RegExp matches', () => {
            expect(regex.globToRegExp('foo').test('foo')).toBe(true);
            expect(regex.globToRegExp('foo').test('foobar')).toBe(false);
        });

        it('should support "*" to match any characters except slashes', () => {
            const re = regex.globToRegExp('foo*bar');
            expect(re.test('foobar')).toBe(true);
            expect(re.test('foobazbar')).toBe(true);
            expect(re.test('foo/bar')).toBe(false); // slash shouldn't match *
        });

        it('should support "**" to match any path segments including slashes', () => {
            const re = regex.globToRegExp('**/*.js');
            expect(re.test('file.js')).toBe(true);
            expect(re.test('lib/utils/file.js')).toBe(true);
            expect(re.test('lib/utils/file.jsx')).toBe(false);
        });

        it('should support "?" to match any single character (except slash)', () => {
            const re = regex.globToRegExp('file?.js');
            expect(re.test('file1.js')).toBe(true);
            expect(re.test('fileX.js')).toBe(true);
            expect(re.test('file.js')).toBe(false);
            expect(re.test('file/1.js')).toBe(false);
        });

        it('should escape special regex characters not used in globs', () => {
            const re = regex.globToRegExp('file(1).js');
            expect(re.test('file(1).js')).toBe(true);
            expect(re.test('file1.js')).toBe(false);
        });

        it('should match only from beginning to end of string', () => {
            const re = regex.globToRegExp('foo');
            expect(re.test('foo')).toBe(true);
            expect(re.test('xfoo')).toBe(false);
            expect(re.test('foox')).toBe(false);
        });

        it('should match nested directories with "**"', () => {
            const re = regex.globToRegExp('src/**/*.ts');
            expect(re.test('src/index.ts')).toBe(true);
            expect(re.test('src/lib/utils.ts')).toBe(true);
            expect(re.test('dist/index.ts')).toBe(false);
        });

        it('should handle mixed glob patterns', () => {
            const re = regex.globToRegExp('lib/*/test?.[jt]s');
            expect(re.test('lib/core/test1.js')).toBe(true);
            expect(re.test('lib/core/test2.ts')).toBe(true);
            expect(re.test('lib/core/test22.ts')).toBe(false);
            expect(re.test('lib/core/sub/test1.js')).toBe(false);
        });

        it('should handle empty pattern as match-nothing', () => {
            const re = regex.globToRegExp('');
            expect(re.test('')).toBe(true);       // matches empty string
            expect(re.test('something')).toBe(false);
        });

        it('should support escaping wildcard characters with backslash', () => {
            const re = regex.globToRegExp('foo\\*bar');
            expect(re.test('foo*bar')).toBe(true);     // literal *
            expect(re.test('fooxbar')).toBe(false);
        });
    })

    describe("the 'strings' module", () => {
        const strings = dataTypes.string;
        it("should be defined", () => {
            expect(strings).toBeDefined();
        });

        it('should tell whether the value is a string or not', () => {
            expect(strings.guard.isString('foo')).toBe(true);
            expect(strings.guard.isString(1)).toBe(false);
        })

        it('should tell whether the string is empty or not', () => {
            expect(strings.guard.isEmpty('')).toBe(true);
            expect(strings.guard.isEmpty('foo')).toBe(false);
        })

        it('should tell whether the value is a valid string or not', () => {
            // valid strings are non-empty strings
            expect(strings.guard.isValidString('')).toBe(false);
            expect(strings.guard.isValidString('  ')).toBe(false);
            expect(strings.guard.isValidString('foo')).toBe(true);
        })

        it('should tell whether the string is alpha or not', () => {
            expect(strings.guard.isAlpha('foo')).toBe(true);
            expect(strings.guard.isAlpha('1')).toBe(false);
        })

        it('should tell whether the string is alpha-numeric or not', () => {
            expect(strings.guard.isAlphaNumeric('foo')).toBe(true);
            expect(strings.guard.isAlphaNumeric('1')).toBe(true);
            expect(strings.guard.isAlphaNumeric('foo1')).toBe(true);
            expect(strings.guard.isAlphaNumeric('foo-1')).toBe(false);
            expect(strings.guard.isAlphaNumeric('')).toBe(false);
            expect(strings.guard.isAlphaNumeric('  ')).toBe(false);
            expect(strings.guard.isAlphaNumeric('ahamd nas')).toBe(false);
        })

        describe('strings.guard.isUUID', () => {
            const validUUIDs = {
                v1: [
                    '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // canonical v1
                    'f47ac10b-58cc-11e3-9d8e-0a7f8a9a1d5b',
                ],
                v4: [
                    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
                    '9b2c4dfd-37e9-4b7d-b7b7-50b5e5ff48e1',
                ],
                v5: [
                    '987fbc97-4bed-55ca-9c8f-6f1a5a3b6c16',
                    '21f7f8de-8051-5b89-8680-0195ef798b6a',
                ],
            };

            const invalidUUIDs = [
                '', // empty
                'not-a-uuid',
                '12345678-1234-1234-1234-1234567890ab', // version 1-5 mismatch
                'g47ac10b-58cc-4372-a567-0e02b2c3d479', // invalid hex char
                'f47ac10b58cc4372a5670e02b2c3d479',     // missing dashes
                '6ba7b810-9dad-21d1-80b4-00c04fd430c8', // invalid v1 (2 instead of 1 in version)
            ];

            // Valid tests for each version explicitly
            for (const version of ['v1', 'v4', 'v5'] as const) {
                describe(`version: ${version}`, () => {
                    it.each(validUUIDs[version])('returns true for valid UUID %s', (uuid) => {
                        expect(strings.guard.isUUID(uuid, version)).toBe(true);
                    });

                    it.each(invalidUUIDs)('returns false for invalid UUID %s', (uuid) => {
                        expect(strings.guard.isUUID(uuid, version)).toBe(false);
                    });
                });
            }

            // Default version (v4) test
            describe('default version (v4)', () => {
                it.each(validUUIDs.v4)('returns true for valid v4 UUID %s', (uuid) => {
                    expect(strings.guard.isUUID(uuid)).toBe(true);
                });

                it.each([...validUUIDs.v1, ...validUUIDs.v5, ...invalidUUIDs])(
                    'returns false for non-v4 or invalid UUID %s',
                    (uuid) => {
                        expect(strings.guard.isUUID(uuid)).toBe(false);
                    }
                );
            });

            // Invalid version param
            it('throws SyntaxError for invalid version', () => {
                expect(() => strings.guard.isUUID('some-uuid-string', 'v2' as any)).toThrow(
                    SyntaxError
                );
            });

            // Non-string input returns false
            it.each([null, undefined, 123, {}, [], true])(
                'returns false for non-string input: %p',
                (value) => {
                    expect(strings.guard.isUUID(value)).toBe(false);
                }
            );
        });
    })
});