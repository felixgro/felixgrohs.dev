import { debounce } from '../utils/functions';

type EventCallback = (...args: any[]) => void;

const events: { [title: string]: EventCallback[] } = {};

export const on = (event: string, fn: EventCallback) => {
    hasEvent(event) ?
        events[event].push(fn) :
        events[event] = [fn];
}

export const fire = (event: string, ...payload: any[]) => {
    hasEvent(event) && events[event].forEach(cb => cb.call({}, ...payload));
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
