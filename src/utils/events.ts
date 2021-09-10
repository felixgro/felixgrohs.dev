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

export const registerDefaultEvents = () => {
    window.addEventListener('load', (e: Event) => fire('load', e));
    window.addEventListener('resize', (e: UIEvent) => fire('resize', e));

    const timeout = 500; // debounce timeout for pre & post resize events
    window.addEventListener('resize', debounce((e: UIEvent) => fire('pre-resize', e), { leading: true, trailing: false, timeout }));
    window.addEventListener('resize', debounce((e: UIEvent) => fire('post-resize', e), { leading: false, trailing: true, timeout }));

    document.addEventListener('keydown', debounce((e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            fire('key-Left', e);
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            fire('key-Right', e);
        } else {
            fire(`key-${e.code}`, e);
        }
    }));
}