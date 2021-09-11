import { createContainer } from './ProjectFactory';
import { displayProject } from './ProjectTooltip';
import { toggleClientScrolling } from '../utils/gestures';
import { catchFocusIn, addGradientCoverTo, scrollHorizontal } from '../utils/dom';
import { on } from '../utils/events';

const scrollSpeed = .9;

type ScrollState = 'scrolling' | 'centering' | 'idling';

let parentContainer: HTMLDivElement,
	currentProject: HTMLAnchorElement | null,
	scrollContainer: HTMLDivElement,
	scrollFrame: DOMRect,
	firstContainer: HTMLDivElement,
	lastContainer: HTMLDivElement,
	subContainers: NodeListOf<Element>,
	scrollState: ScrollState = 'idling',
	animationFrameId: number,
	margin: number,
	currentScroll = 0;

/**
 * Initialize by filling parent container with all configured projects, assign variables and start auto scrolling.
 */
export const initProjectScroller = () => {
	parentContainer = document.querySelector('.projects-container')!;

	// create scroll parent container
	scrollContainer = document.createElement('div');
	scrollContainer.setAttribute('class', 'projects no-scrollbar');
	scrollContainer.setAttribute('aria-hidden', 'true');
	parentContainer.appendChild(scrollContainer);

	// add gradient cover
	const gradientColor = getComputedStyle(document.querySelector('#app')!).backgroundColor;
	addGradientCoverTo(parentContainer, gradientColor);

	on('post-resize', () => {
		scrollFrame = scrollContainer.getBoundingClientRect();
		margin = innerWidth * 1.5;
	}, { immediately: true });

	on('visible', () => {
		if (!currentProject) startScrolling();
	});

	on('invisible', () => {
		stopScrolling();
	});

	catchFocusIn(parentContainer, (e: Event) => {
		e.preventDefault();
		subContainers = document.querySelectorAll('.sub-container');
		(subContainers[Math.floor((subContainers.length - 1) / 2)].children[0] as HTMLAnchorElement).click();
	});

	toggleClientScrolling(scrollContainer, true).disable();
	generateProjects();
	startScrolling();
}


/**
 * Starts auto scrolling.
 */
export const startScrolling = () => {
	if (scrollState === 'scrolling' || scrollState === 'centering') return;
	scrollState = 'scrolling';

	if (currentProject) {
		currentProject.classList.remove('active');
		currentProject = null;
	}

	currentScroll = scrollContainer.scrollLeft;
	animationFrameId = requestAnimationFrame(scrollAnimationFrame);
}


/**
 * Stops auto scrolling.
 */
export const stopScrolling = () => {
	if (scrollState === 'centering' || scrollState === 'idling') return;
	scrollState = 'idling';

	cancelAnimationFrame(animationFrameId);
}


const onContainerClick = (e: Event) => {
	const target = e.target as HTMLAnchorElement;

	if (target.classList.contains('project-anchor') && target !== currentProject) centerProject(target);
}


/**
* Moves first container at end of scroll container.
*/
const appendContainer = (): HTMLDivElement => {
	lastContainer = scrollContainer.appendChild(shiftContainer());
	return lastContainer;
}

/**
 * Moves last container at the beginning of scroll container.
 */
const prependContainer = (): HTMLDivElement => {
	firstContainer = scrollContainer.appendChild(popContainer());
	return firstContainer;
}


/**
 * Removes first container from parent.
 */
const shiftContainer = (): HTMLDivElement => {
	const width = firstContainer.clientWidth;
	const prevContainer = firstContainer;
	firstContainer.remove();
	firstContainer = scrollContainer.firstElementChild as HTMLDivElement;

	currentScroll -= width;
	scrollContainer.scrollLeft = currentScroll;

	return prevContainer;
}


/**
 * Removes last container from parent.
 */
const popContainer = (): HTMLDivElement => {
	const prevContainer = lastContainer;
	lastContainer.remove();
	lastContainer = scrollContainer.lastElementChild as HTMLDivElement;
	return prevContainer;
}


/**
 * Animation loop for auto scrolling.
 */
const scrollAnimationFrame = () => {
	if (scrollState !== 'scrolling') return;
	animationFrameId = requestAnimationFrame(scrollAnimationFrame);

	currentScroll += scrollSpeed;
	scrollContainer.scrollLeft = currentScroll;

	const lastBcr = lastContainer.getBoundingClientRect();
	if (lastBcr.x + lastBcr.width < currentScroll + margin * 0.2)
		appendContainer();
}


/**
 * Fills all available space (including specified margin) within parent using sub-containers and
 * subsequently centers the scroll position horizontally to enable seamless scrolling in both directions.
 */
const generateProjects = () => {
	let currentWidth = 0;

	const generateProjectsContainer = (): HTMLDivElement => {
		const projects = createContainer();
		projects.onclick = onContainerClick;
		scrollContainer.appendChild(projects);
		currentWidth += projects.clientWidth;
		return projects;
	};

	firstContainer = generateProjectsContainer();

	do {
		lastContainer = generateProjectsContainer();
	} while (currentWidth < scrollFrame.width + scrollFrame.x + margin);

	currentScroll = (scrollContainer.scrollWidth - scrollFrame.width) / 2;
	scrollContainer.scrollLeft = currentScroll;
}


/**
 * Scrolls smoothly through parent container in order to center
 * specified project.
 */
const centerProject = (projectElement: HTMLAnchorElement) => {
	if (scrollState === 'centering') return;
	stopScrolling();
	scrollState = 'centering';

	const bcr = projectElement.getBoundingClientRect(),
		rawDiff = (bcr.width / 2 + bcr.left) - (scrollFrame.width / 2 + scrollFrame.left),
		conDiff = rawDiff / scrollContainer.firstElementChild!.clientWidth,
		conDiffRounded = conDiff >= 0 ? Math.ceil(conDiff) : Math.floor(conDiff);

	if (currentProject) currentProject.classList.remove('active');
	currentProject = projectElement;
	currentProject.classList.add('active');

	scrollHorizontal(scrollContainer, {
		from: currentScroll,
		to: rawDiff,
		speed: scrollSpeed
	}).then(() => {
		currentScroll += rawDiff;
		displayProject(projectElement);

		// TODO: fix weird lag..
		for (let i = 0; i < Math.abs(conDiffRounded); i++) {
			(conDiffRounded < 0) ? prependContainer() : appendContainer();
		}

		scrollState = 'idling';
	});
};