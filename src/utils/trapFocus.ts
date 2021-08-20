import hasParent from './hasParent';

export default (el: Element): FocusTrap => new FocusTrap(el).trap();

const defaultFocusables = [
	"input",
	"select",
	"textarea",
	"a[href]",
	"button",
	"audio[controls]",
	"video[controls]",
	'[contenteditable]:not([contenteditable="false"])'
];

export class FocusTrap {
	public container: Element;
	public focusables: string[];
	public focusElements: Element[] = [];
	public outsiders: Element[] = [];

	constructor(container: Element, focusables?: string[]) {
		this.container = container;

		if (!focusables) focusables = defaultFocusables;
		this.focusables = focusables;

		for (const focusQuery of this.focusables) {
			this.focusElements.push(...Array.from(document.querySelectorAll(focusQuery)));
		}
	}

	trap(): FocusTrap {
		this.outsiders = [];

		for (const element of this.focusElements) {
			if (hasParent(this.container, element)) {
				console.log(element);
				continue;
			}

			this.outsiders.push(element)
			element.setAttribute('tabindex', '-1');
		}

		return this;
	}

	untrap(): FocusTrap {
		for (const element of this.outsiders) element.removeAttribute('tabindex');
		return this;
	}
}