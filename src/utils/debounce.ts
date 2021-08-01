type DebouncedFunction = (...args: any[]) => void;

interface DebounceOptions {
    leading?: Boolean;
    trailing?: Boolean;
}

const DefaultOptions: DebounceOptions = {
    leading: true,
    trailing: false
}

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