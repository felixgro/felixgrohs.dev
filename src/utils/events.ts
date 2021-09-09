import { debounce } from '../utils/functions';

type Callback = (...args: any[]) => void;

export const events: { [title: string]: Callback[] } = {};

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

export const hasEvent = (event: string): boolean => event in events;


window.onload = (e: Event) => fire('load', e);
window.onresize = (e: Event) => fire('resize', e);

document.onkeydown = debounce((e: KeyboardEvent) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        fire('key-Left', e);
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        fire('key-Right', e);
    } else {
        fire(`key-${e.code}`, e);
    }
});
