import { addStylesTo, gradientToTransparent } from './css';


/**
 * Recursively iterates through all parents of specified element
 * to check if specified parent matches one of them.
 */
export const hasParent = (parent: Node, element: Node): boolean => {
    const currParent = element.parentElement;
    if (currParent === parent) return true;

    return currParent !== null ? hasParent(parent, currParent) : false;
}


/**
 * Wraps a new parent node around another node which results in a new dom hirachy.
 */
export const wrap = (child: Node, parent: Node): void => {
    child.parentNode?.insertBefore(parent, child);
    parent.appendChild(child);
}


/**
 * Appends multiple children within specified dom node.
 */
export const appendChildren = (element: Node, ...children: Node[]) => {
    for (let i = 0; i < children.length; i++) {
        element.appendChild(children[i]);
    }
}


/**
 * Removes all children from specified parent node.
 */
export const removeChildren = (parent: Node) => {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
}


/**
 * Catches tab-moved focus within specified parent element by injecting an invisible
 * button element in specified parent, which executes the given
 * eventCallback function whenever a click event occurs & returns the injected Button.
 * 
 * Label is necessary to support screen-readers: assistive technologies read out the label
 * as soon as the focus is moved inside the given parent.
 */
export const catchFocusIn = (parent: Node, label: string, eventCallback: (e: Event) => void): HTMLButtonElement => {
    const catchElement = document.createElement('button');
    catchElement.innerText = label;
    addStylesTo(catchElement, {
        position: 'relative',
        overflow: 'hidden',
        opacity: 0,
        height: 0,
        width: 0,
    });

    catchElement.addEventListener('click', eventCallback);
    return parent.appendChild(catchElement);
}


/**
 * Animates horizontal scroll by given amount in pixels.
 * This polyfills `element.scrollBy({ left: number, behaviour: 'smooth' })` due to no support in safari.
 * TODO: Exclude to motion.ts file.
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


/**
 * Add horizontal gradient cover on specified element,
 * which fades away from specified color.
 * TODO: Exclude to css.ts file!
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
 * Traps focus within a specified node, by modifying the tabindex
 * on each individual focusable element in the whole document.
 */
export interface FocusTrapControls {
    trap(): void;
    untrap(): void;
}

export const trapFocus = (container: Node, selector: string): FocusTrapControls => {
    const focusElement = document.querySelector<HTMLElement>(selector);
    if (!focusElement) throw new Error(`Cannot find focus element using selector ${selector}`);

    // all elements that are not related to specified container..
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

    let prevFocusElement: HTMLButtonElement | null = null;

    return {
        trap: () => {
            prevFocusElement = document.activeElement as HTMLButtonElement;
            outsiders.forEach(el => el.setAttribute('tabindex', '-1'));
            focusElement.focus();
        },
        untrap: () => {
            outsiders.forEach(el => el.removeAttribute('tabindex'));
            if (prevFocusElement) prevFocusElement.focus();
        }
    }
}

/**
 * Creates an anchor element which opens within a new tab.
 */
export const newTabAnchor = (label: string, ref = '#'): HTMLAnchorElement => {
    const a = document.createElement('a');
    a.href = ref;
    a.innerText = label;
    a.target = '_blank';
    a.rel = 'noreferrer';
    return a;
}

/**
 * Toggle visibility of specified elements.
 */
export const setVisibility = (visible: boolean, el: HTMLElement, visually = false) => {
    el.setAttribute('aria-hidden', `${!visible}`);

    if (!visually) return;

    addStylesTo(el, {
        opacity: visible ? 1 : 0,
    });
}

/**
 * Excludes or includes specified elements from layout flow.
 */
export const setFlow = (dir: 'include' | 'exclude', ...elements: HTMLElement[]) => {
    for (const element of elements) {
        addStylesTo(element, {
            position: dir === 'exclude' ? 'absolute' : 'relative',
            pointerEvents: dir === 'exclude' ? 'none' : 'auto'
        });
    }
}

export interface ClickOutsideEventControls {
    listen: () => void;
    unlisten: () => void;
}

export const onClickOutsideOf = (elements: Node[], cb: (e: Event) => void): ClickOutsideEventControls => {
    const eventListener = (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target) return;

        let isOutside = true;
        for (let i = 0; i < elements.length; i++) {
            if (hasParent(elements[i], target)) isOutside = false;
        }

        if (isOutside) cb.call({}, e);
    };

    return {
        listen: () => window.addEventListener('click', eventListener),
        unlisten: () => window.removeEventListener('click', eventListener)
    }
}