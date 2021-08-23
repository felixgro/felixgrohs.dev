export default (e: Event, fn: CallableFunction) => {
    if (!e.target) return;

    let target = e.target as HTMLElement;

    if (target.tagName === 'svg') target = target.parentElement!;
    e.preventDefault();
    target.blur();

    fn(e);
}