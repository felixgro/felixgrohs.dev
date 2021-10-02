import { appendChildren, setVisibility, setFlow } from './dom';

export interface AnimationConfig {
    direction: 'up' | 'down';
    distance: number;
    duration: number;
}

export interface SwappableText {
    parent: HTMLDivElement;
    swap: (txt: string, shouldAnimate?: boolean, config?: AnimationConfig) => void;
    heightDiff: (txt: string) => number;
}

export const swappable = (tag: string): SwappableText => {
    const parent = document.createElement('div'),
        primaryEl = document.createElement(tag),
        secondaryEl = document.createElement(tag);

    // make secondary element invisible for screenreaders
    // and exclude it from layout flow to calculate new height..
    setVisibility(false, secondaryEl, true);
    setFlow('exclude', secondaryEl);

    // append both elements within parent..
    appendChildren(parent, primaryEl, secondaryEl);

    return {
        parent,

        heightDiff: (txt: string): number => {
            secondaryEl.innerText = txt;
            return secondaryEl.clientHeight - primaryEl.clientHeight;
        },

        // Swaps current text out with new one, which can happen immediately or animated.
        swap: (txt: string, shouldAnimate = false, config?: AnimationConfig): void => {
            if (!shouldAnimate || !config) {
                primaryEl.innerText = txt;
                return;
            }

            // exclude previous text element from flow and assign new text and include element in flow..
            setFlow('exclude', primaryEl);
            setFlow('include', secondaryEl);
            secondaryEl.innerText = txt;

            primaryEl.animate([{
                transform: `translateY(0)`,
                opacity: 1,
            }, {
                transform: `translateY(${(config.direction === 'up' ? -1 : 1) * config.distance}px)`,
                opacity: 0
            }], {
                duration: config.duration,
                easing: 'ease-out',
            }).addEventListener('finish', () => {
                // Without { fill: 'forwards' } option this method wont overwrite css rules, which means
                // the element will immediately jump to it's original state when the animation finishes.
                // This exact moment will be used to overwrite the text contents of the primary element,
                // in order to overlay the second element (with same content) in an unnoticeable fashion.
                primaryEl.innerText = txt;
                setFlow('include', primaryEl);
            });

            secondaryEl.animate([{
                transform: `translateY(${(config.direction === 'up' ? 1 : -1) * config.distance}px)`,
                opacity: 0,
            }, {
                transform: 'translateY(0)',
                opacity: 1
            }], {
                duration: config.duration,
                easing: 'ease-out',
            }).addEventListener('finish', () => {
                // Secondary Element should get ignored by page flow after it's done animating
                setFlow('exclude', secondaryEl);
            });
        }
    }
}