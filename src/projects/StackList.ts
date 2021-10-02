import type { AnimationConfig } from '../utils/motion';

import { setVisibility, appendChildren, removeChildren, setFlow } from '../utils/dom';
import { addStylesTo } from '../utils/css';

// get all paths of svg icons located in public/icons/tech directory..
const techIconPaths = import.meta.glob('/public/icons/tech/*.svg');

export const createStackList = (): StackList => new StackList();

interface StackIcon {
    title: string;
    img: HTMLImageElement;
}

export class StackList {
    public element: HTMLDivElement;

    private icons: StackIcon[] = [];

    private mainList: HTMLUListElement;
    private subList: HTMLUListElement;

    constructor() {
        this.element = document.createElement('div');
        addStylesTo(this.element, { position: 'relative' });

        this.icons = this.generateStackIcons();

        this.mainList = document.createElement('ul');
        this.subList = document.createElement('ul');
        setFlow('exclude', this.subList);
        addStylesTo(this.subList, { top: 0 });

        appendChildren(this.element, this.mainList, this.subList);

        this.element.setAttribute('aria-label', 'used technologies');

        for (const icon of this.icons) {
            this.mainList.appendChild(icon.img.cloneNode());
        }
    }

    setStack(stack: (keyof typeof techIconPaths)[], shouldAnimate = false, config?: AnimationConfig) {
        if (!shouldAnimate || !config) {
            return this.hardResetWith(stack);
        }

        const imgs = this.getImages(...stack);
        const clonedImgs = imgs.map(img => img.cloneNode());

        appendChildren(this.subList, ...clonedImgs);

        this.mainList.animate([{
            transform: `translateY(0)`,
            opacity: 1,
        }, {
            transform: `translateY(${(config.direction === 'up' ? -1 : 1) * config.distance}px)`,
            opacity: 0
        }], {
            duration: config.duration,
            easing: 'ease-out',
        }).addEventListener('finish', () => {
            this.hardResetWith(imgs);
        });

        this.subList.animate([{
            transform: `translateY(${(config.direction === 'up' ? 1 : -1) * config.distance}px)`,
            opacity: 0,
        }, {
            transform: 'translateY(0)',
            opacity: 1
        }], {
            duration: config.duration,
            easing: 'ease-out',
        }).addEventListener('finish', () => {
            removeChildren(this.subList);
        })
    }

    private hardResetWith(stack: string[] | HTMLImageElement[]) {
        const newIcons = (
            typeof stack[0] === 'string' ? this.getImages(...(stack as string[])) : stack
        ) as HTMLImageElement[];

        removeChildren(this.mainList);
        appendChildren(this.mainList, ...newIcons);
    }

    private getImages = (...stacks: string[]): HTMLImageElement[] => {
        return this.icons.filter((el) => stacks.includes(el.title)).map(i => i.img);
    }

    private generateStackIcons = (): StackIcon[] => {
        const imgs: StackIcon[] = [];

        for (const path in techIconPaths) {
            const img = document.createElement('img');
            // get rel server url by removing public directory from path
            const relPath = path.replace('/public', '.');
            // get tech title using regex
            const title = /([^\/]+)[[^\.]/.exec(relPath)![1];

            img.src = relPath;
            img.alt = `${title} Icon`;
            img.title = `${title}`; // shows title in browser tooltip on hover..

            setVisibility(false, img, false);

            imgs.push({
                img,
                title
            });
        }

        return imgs;
    }
}