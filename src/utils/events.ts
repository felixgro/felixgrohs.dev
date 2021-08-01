type Callback = (...args: any[]) => void;

const events: {
    [title: string]: Callback[]
} = {};

window.onload = (e: Event) => fire('load', e);
window.onresize = (e: Event) => fire('resize', e);

export const on = (event: string, fn: Callback) => {
    if (hasEvent(event)) {
        events[event].push(fn);
    } else {
        events[event] = [fn];
    }
}

export const fire = (event: string, ...payload: any[]) => {
    if (!hasEvent(event)) return;

    for (const fn of events[event]) fn.call({}, ...payload);
}

const hasEvent = (event: string): boolean => event in events;