/**
 * Removes default focus after click event occured.
 * 
 * @param e - Click/Tap event object
 * @param fn - Event callback
 */
export default (e: Event, fn: (...args: any[]) => any) => {
    if (!e.target) return;

    let target = e.target as HTMLElement;

    if (target.tagName === 'svg') target = target.parentElement!;
    e.preventDefault();
    target.blur();

    fn.call({}, e);
}