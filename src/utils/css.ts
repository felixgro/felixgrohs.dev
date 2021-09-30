import type * as CSS from 'csstype';

/**
 * Add given styles to provided Element.
 */
export const addStylesTo = (el: HTMLElement, styles: CSS.Properties): void => {
    if (!el?.style) throw new Error('Cannot find element to apply styles.');
    Object.assign(el.style, styles);
}

/**
 * Check if provided string can be interpreted
 * as an hex color in css.
 */
export const isHEX = (color: string): boolean => {
    return /^#(\S{8}|\S{6}|\S{3})$/.test(color);
}

/**
 * Check if provided string can be interpreted
 * as an hsl color in css.
 */
export const isHSL = (color: string): boolean => {
    return /^hsl\(\d{1,3},\s?(0|\d{1,3}%),\s?(0|\d{1,3}%)\)$/.test(color);
}

/**
 * Check if provided string can be interpreted
 * as an rgb color in css.
 */
export const isRGB = (color: string): boolean => {
    return /^rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)$/.test(color);
}

/**
 * Convert hex string to rgb.
 */
export const hexToRGB = (hexString: string): string => {
    if (!isHEX(hexString))
        throw new Error(`Cannot convert hex value '${hexString}'`);

    let hex = hexString.slice(1);
    let alpha = hex.length === 8;

    if (hex.length === 3)
        hex = [...hex].map(x => x + x).join('');

    const hexNum = parseInt(hex, 16);

    return 'rgb' + (alpha ? 'a' : '') + '(' +
        (hexNum >>> (alpha ? 24 : 16)) + "," +
        ((hexNum & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)) + "," +
        ((hexNum & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)) +
        (alpha ? `,${hexNum & 0x000000ff}` : '') + ")";
}

/**
 * Generates a css linear-gradient which fades from
 * provided rgb color to transparent in defined direction.
 * This is used to prevent safari from interprating an transparent gradient as black!
 */
export const gradientToTransparent = (rgb: string, dir: string): string => {
    if (!isRGB(rgb)) throw new Error(`Cannot interpret rgb value '${rgb}'`);

    const transparentRGB = rgb.split('').map(c => {
        switch (c) {
            case 'b': return 'ba';
            case ')': return ',0)';
            default: return c;
        }
    }).join('');

    return `linear-gradient(${dir}, ${rgb}, ${transparentRGB})`;
}