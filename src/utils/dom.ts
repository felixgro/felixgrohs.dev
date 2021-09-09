export const hasParent = (parent: Element, element: Element): boolean => {
    const currParent = element.parentElement;
    if (currParent === parent) return true;

    return currParent !== null ? hasParent(parent, currParent) : false;
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