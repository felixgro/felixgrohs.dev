type DefaultFunction = (...args: any[]) => any;

/**
 * Creates a function which caches it's return values based on
 * all arguments provided by the memoized function as key.
 * 
 * @param fn: function for memoization
 */
export const memoize = <MF extends DefaultFunction>(fn: MF): MF => {
    const cache = new Map<string, ReturnType<MF>>();

    return ((...args) => {
        const key = JSON.stringify(args);
        const res = cache.get(key) || fn.call({}, ...args);
        if (!cache.has(key)) cache.set(key, res);
        return res;
    }) as MF;
}


/**
 * Argument function is triggered after first call of returned function and waits given timeout
 * before triggering the argument function again.
 * trailing option (false): Controls whether argument function gets triggered after event sequence ends.
 * leading option (true): Controls whether argument function gets triggered at firs iteration of event sequence.
 * 
 * @param fn - Function to debounce
 * @param timeout - Delay in ms between function calls
 * @param options - set trailing and/or leading option
 * @returns debounced function
 */
export const debounce = (fn: DefaultFunction, timeout: number, options?: {
    leading?: Boolean;
    trailing?: Boolean;
}): DefaultFunction => {
    let timeoutId: number | null;
    const config = Object.assign({}, {
        leading: true,
        trailing: false
    }, options);

    return function (this: any, ...args) {
        let isInvoked = false;

        if (!timeoutId && config.leading) {
            fn.call(this, ...args);
            isInvoked = true;
        }

        if (timeoutId) window.clearTimeout(timeoutId);

        timeoutId = window.setTimeout(() => {
            if (config.trailing && !isInvoked) {
                fn.call(this, ...args);
            }

            timeoutId = null;
        }, timeout);
    }
}