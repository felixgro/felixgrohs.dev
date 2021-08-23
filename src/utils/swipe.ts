type EventCallback = (e: TouchEvent) => void;

export default (swipeArea: HTMLElement) => new Swipe(swipeArea);

export class Swipe {
    private el: HTMLElement;

    private xDown: number | null = null;
    private yDown: number | null = null;

    private left: EventCallback = () => { };
    private right: EventCallback = () => { };
    private up: EventCallback = () => { };
    private down: EventCallback = () => { };

    constructor(el: HTMLElement) {
        this.el = el;

        this.el.ontouchstart = (e: TouchEvent) => {
            this.xDown = e.touches[0].clientX;
            this.yDown = e.touches[0].clientY;
        }
    }

    onLeft(callback: EventCallback) {
        this.left = callback;
        return this;
    }

    onRight(callback: EventCallback) {
        this.right = callback;

        return this;
    }

    onUp(callback: EventCallback) {
        this.up = callback;
        return this;
    }

    onDown(callback: EventCallback) {
        this.down = callback;
        return this;
    }

    handleTouchMove(e: TouchEvent) {
        if (!this.xDown || !this.yDown) return;

        const xDiff = this.xDown - e.touches[0].clientX;
        const yDiff = this.yDown - e.touches[0].clientY;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            (xDiff > 0) ? this.left(e) : this.right(e);
        } else {
            (yDiff > 0) ? this.up(e) : this.down(e)
        }

        this.xDown = null;
        this.yDown = null;
    }

    run() {
        this.el.ontouchmove = (e: TouchEvent) => {
            e.preventDefault();
            this.handleTouchMove(e);
        }
    }

    destroy() {
        this.el.ontouchmove = (e: TouchEvent) => e.preventDefault();
        this.el.ontouchstart = (e: TouchEvent) => e.preventDefault();
    }
}