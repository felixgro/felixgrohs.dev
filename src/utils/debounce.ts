type DebouncedFunction = (...args: any[]) => void;

interface DebounceOptions {
    leading?: Boolean;
    trailing?: Boolean;
}

const DefaultOptions: DebounceOptions = {
    leading: true,
    trailing: false
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
export default (fn: DebouncedFunction, timeout: number, options?: DebounceOptions): DebouncedFunction => {
    const config = Object.assign({}, DefaultOptions, options);
    let timeoutId: number | null;

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