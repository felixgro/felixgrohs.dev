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