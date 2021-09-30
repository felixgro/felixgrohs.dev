/**
 * Check if client's browser supports passive event listeners.
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