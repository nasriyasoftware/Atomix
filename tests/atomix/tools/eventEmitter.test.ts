import EventEmitter from '../../../src/tools/events/EventEmitter'; // adjust the path if needed

describe('EventEmitter', () => {
    let emitter: EventEmitter;

    beforeEach(() => {
        emitter = new EventEmitter();
        emitter.maxHandlers = 100; // disable limit during most tests
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should register and call a normal handler', async () => {
        const fn = jest.fn();
        emitter.on('test', fn);
        await emitter.emit('test', 42, 'hello');
        expect(fn).toHaveBeenCalledWith(42, 'hello');
    });

    it('should call before -> normal -> after in order', async () => {
        const order: string[] = [];
        emitter.on('evt', () => order.push('main'));
        emitter.on('evt', () => order.push('after'), { type: 'afterAll' });
        emitter.on('evt', () => order.push('before'), { type: 'beforeAll' });
        await emitter.emit('evt');
        expect(order).toEqual(['before', 'main', 'after']);
    });

    it('should call once-handlers only once', async () => {
        const fn = jest.fn();
        emitter.on('onceEvent', fn, { once: true });
        await emitter.emit('onceEvent');
        await emitter.emit('onceEvent');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should await async handlers', async () => {
        jest.useRealTimers();
        const callOrder: string[] = [];

        emitter.on('async', async () => {
            await new Promise(res => setTimeout(res, 20));
            callOrder.push('A');
        });

        emitter.on('async', () => callOrder.push('B'));
        
        await emitter.emit('async');
        await new Promise(res => setTimeout(res, 100));
        expect(callOrder).toEqual(['A', 'B']);
    });

    it('should trigger "*" wildcard handlers', async () => {
        const wildcard = jest.fn();
        emitter.on('*', wildcard);
        emitter.on('specific', () => { });
        await emitter.emit('specific', 'data');
        expect(wildcard).toHaveBeenCalledWith('data');
    });

    it('should correctly remove a specific handler', async () => {
        const fn = jest.fn();
        emitter.on('rm', fn);
        emitter.remove.handler('rm', fn);
        await emitter.emit('rm');
        expect(fn).not.toHaveBeenCalled();
    });

    it('should remove all handlers for an event', async () => {
        const a = jest.fn(), b = jest.fn();
        emitter.on('clean', a);
        emitter.on('clean', b, { once: true });
        emitter.remove.allHandlers('clean');
        await emitter.emit('clean');
        expect(a).not.toHaveBeenCalled();
        expect(b).not.toHaveBeenCalled();
    });

    it('should call onMaxHandlers custom handler when limit exceeded', () => {
        const local = new EventEmitter();
        local.maxHandlers = 1;

        const spy = jest.fn();
        local.onMaxHandlers(spy);

        local.on('foo', () => { });
        local.on('foo', () => { }); // should exceed maxHandlers limit

        // At this point, debounce delays the call, so spy hasn't been called yet
        expect(spy).not.toHaveBeenCalled();

        // Fast-forward timers by debounce delay (100ms or whatever you set)
        jest.advanceTimersByTime(200);

        // Now the debounced handler should have been called
        expect(spy).toHaveBeenCalledWith('foo');
    });

    it('should throw an error if onMaxHandlers is set to Error instance', () => {
        const local = new EventEmitter();
        local.maxHandlers = 1;

        // Custom max handler that throws an error when invoked
        const errMsg = 'Too many handlers';
        local.onMaxHandlers(new Error(errMsg));

        local.on('foo', () => { });

        // Adding the second handler triggers the max handler (which throws)
        expect(() => local.on('foo', () => { })).toThrow(`[WARN] ${errMsg}`);

        // No need to await because throw is synchronous inside debounce wrapper
    });

    it('should accurately report event names excluding "*"', () => {
        emitter.on('alpha', () => { });
        emitter.on('*', () => { });
        emitter.on('beta', () => { });
        expect(emitter.eventNames.sort()).toEqual(['alpha', 'beta']);
    });

    it('should accurately count all handlers', () => {
        const fn = () => { };
        emitter.on('x', fn);
        emitter.on('x', fn, { once: true });
        emitter.on('x', fn, { type: 'beforeAll' });
        emitter.on('x', fn, { type: 'afterAll' });
        expect(emitter.handlersCount).toBe(4);
    });

    it('should throw for invalid inputs', () => {
        expect(() => emitter.on('', () => { })).toThrow();
        expect(() => emitter.on('x', null as any)).toThrow();
        expect(() => emitter.on('x', () => { }, { type: 'weird' } as any)).toThrow();
    });
});
