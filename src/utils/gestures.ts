import { supportsPassive } from './browser';

interface Position {
	x: number;
	y: number;
}

interface SwipeCallbacks {
	left?(e: TouchEvent): void;
	right?(e: TouchEvent): void;
	up?(e: TouchEvent): void;
	down?(e: TouchEvent): void;
}

interface SwipeController {
	addListener(): SwipeController;
	removeListener(): SwipeController;
}

export const swipeable = (el: HTMLElement, callbacks: SwipeCallbacks): SwipeController => {
	let startPos: Position | null = null;

	const handleTouchStart = (e: TouchEvent) => {
		startPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}

	const handleTouchMove = (e: TouchEvent) => {
		if (!startPos) return;
		const diff: Position = {
			x: startPos.x - e.touches[0].clientX,
			y: startPos.y - e.touches[0].clientY
		};

		if (Math.abs(diff.x) > Math.abs(diff.y)) {
			(diff.x > 0) ? callbacks.left?.(e) : callbacks.right?.(e);
		} else {
			(diff.y > 0) ? callbacks.up?.(e) : callbacks.down?.(e);
		}

		startPos = null;
	}

	return {
		addListener() {
			el.addEventListener('touchstart', handleTouchStart);
			el.addEventListener('touchmove', handleTouchMove);
			return this;
		},
		removeListener() {
			el.removeEventListener('touchstart', handleTouchStart);
			el.removeEventListener('touchmove', handleTouchMove);
			return this;
		}
	};
}

export const toggleClientScrolling = (el: HTMLElement, withKeys = false) => {
	const keyCodes = { ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1 };
	const wheelEvent = 'onwheel' in el ? 'wheel' : 'mousewheel';
	const hasPassive = supportsPassive();

	const preventDefault = (e: Event) => e.preventDefault();
	const preventDefaultKeys = (e: KeyboardEvent) => e.code in keyCodes && e.preventDefault();

	return {
		disable: () => {
			el.addEventListener('DOMMouseScroll', preventDefault, false);
			el.addEventListener(wheelEvent, preventDefault, hasPassive ? { passive: false } : false);
			el.addEventListener('touchmove', preventDefault, hasPassive ? { passive: false } : false);

			if (withKeys) window.addEventListener('keydown', preventDefaultKeys, hasPassive ? { passive: false } : false);
			return this;
		},
		enable: () => {
			el.removeEventListener('DOMMouseScroll', preventDefault, false);
			el.removeEventListener(wheelEvent, preventDefault);
			el.removeEventListener('touchmove', preventDefault);

			if (withKeys) window.removeEventListener('keydown', preventDefaultKeys);
			return this;
		}
	}
};