import { addStylesTo, gradientToTransparent } from './css';

/**
 * Recursively iterates through all parents of specified element &
 * checks if given parent element matches one of them.
 */
export const hasParent = (parent: Element, element: Element): boolean => {
    const currParent = element.parentElement;
    if (currParent === parent) return true;

    return currParent !== null ? hasParent(parent, currParent) : false;
}

/**
 * 
 */
export const addGradientCoverTo = (element: HTMLElement, color: string) => {
    const coverParent = document.createElement('div');
    addStylesTo(coverParent, {
        position: 'absolute',
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        pointerEvents: 'none',
        zIndex: 100
    });

    for (let i = 0; i < 2; i++) {
        const cover = document.createElement('div');
        coverParent.appendChild(cover);
        addStylesTo(cover, {
            background: gradientToTransparent(color, i === 0 ? 'to right' : 'to left'),
            width: '100px'
        });
    }

    element.prepend(coverParent);
}

/**
 * Checks if client's browser supports passive event listeners.
 */
export const supportsPassive = (): boolean => {
    let supportsPassive = false;

    try {
        window.addEventListener("passive-check", () => { }, Object.defineProperty({}, 'passive', {
            get: function () { supportsPassive = true; }
        }));
        window.removeEventListener("passive-check", () => { });
    } catch (e) { }

    return supportsPassive;
}

/**
 * 
 */
export const catchFocusIn = (parent: HTMLElement, eventCallback: (e: Event) => void): HTMLButtonElement => {
    const catchElement = document.createElement('button');
    addStylesTo(catchElement, {
        position: 'relative',
        overflow: 'hidden',
        opacity: 0,
        height: 0,
        width: 0,
    });

    catchElement.addEventListener('focus', eventCallback, { passive: false });
    parent.appendChild(catchElement);
    return catchElement;
}

/**
 * Animates horizontal scroll by given amount in pixels.
 * This polyfills `element.scrollBy({ left: number, behaviour: 'smooth' })` due to no support in safari.
 */
export const scrollHorizontal = (parent: HTMLElement, config: { from: number, to: number, speed: number }): Promise<never> => {
    return new Promise((resolve) => {
        const xDuration = Math.abs(config.to * 1 / config.speed),
            step = config.to / 100;

        let currTime = 0,
            index = 0;

        const scrollStep = (i: number, step: number, start: number) =>
            parent.scrollLeft = (i * step) + start;

        while (currTime <= xDuration) {
            setTimeout(scrollStep, currTime, index, step, config.from);
            currTime += xDuration / 100;
            index++;
        }

        setTimeout(resolve, currTime);
    });
}

export const blurAndCall = (e: Event, fn: (...args: any[]) => any) => {
    let target = e.target as HTMLElement;
    if (!target) return;

    if (target.tagName === 'svg') target = target.parentElement!;
    e.preventDefault();
    target.blur();
    fn.call({}, e);
}

export const trapFocus = (container: Element): {
    trap(): void,
    untrap(): void
} => {
    const outsiders: Element[] = [];
    const defaultFocusables = [
        "input",
        "select",
        "textarea",
        "a[href]",
        "button",
        '[contenteditable]:not([contenteditable="false"])'
    ];

    for (const focusQuery of defaultFocusables) {
        document.querySelectorAll(focusQuery).forEach(el => {
            if (!hasParent(container, el)) outsiders.push(el);
        })
    }

    return {
        trap: () => outsiders.forEach(el => el.setAttribute('tabindex', '-1')),
        untrap: () => outsiders.forEach(el => el.removeAttribute('tabindex'))
    }
}