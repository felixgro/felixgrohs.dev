import { createContainer } from './ProjectFactory';
import { initProjectTooltip, displayProject } from './ProjectTooltip';
import { toggleClientScrolling } from '../utils/gestures';
import { catchFocusIn, addGradientCoverTo, scrollHorizontal } from '../utils/dom';
import { on } from '../utils/events';


const scrollSpeed = .9,
	distanceFactor = 1.7, // distance multiplicator for appending/prepending on client interaction
	marginFactor = 1.5, // gets multiplied with innerWidth for margin
	marginMin = 800;


type ScrollState = 'scrolling' | 'centering' | 'idling';


let parentContainer: HTMLDivElement,
	currentProject: HTMLAnchorElement | null,
	scrollContainer: HTMLDivElement,
	scrollFrame: DOMRect,
	firstContainer: HTMLDivElement,
	lastContainer: HTMLDivElement,
	subContainers: NodeListOf<Element>,
	animationFrameId: number,
	scrollState: ScrollState = 'idling',
	margin: number, // min scroll distance in each direction
	scrolledDistance = 0, // tracks total distance on client interaction
	currentScroll = 0; // current scroll position


/**
 * Initialize by filling parent container with all configured projects, assign variables and start auto scrolling.
 */
export const initProjectScroller = () => {
	parentContainer = document.querySelector('.projects-container')!;

	// create scroll container..
	scrollContainer = document.createElement('div');
	scrollContainer.setAttribute('class', 'projects no-scrollbar no-select');
	scrollContainer.setAttribute('aria-hidden', 'true');
	parentContainer.appendChild(scrollContainer);

	// add gradient cover..
	const gradientColor = getComputedStyle(document.querySelector('#app')!).backgroundColor;
	addGradientCoverTo(parentContainer, gradientColor);

	// listen for these events..
	on('post-resize', () => {
		scrollFrame = scrollContainer.getBoundingClientRect();
		margin = innerWidth * marginFactor;
		if (margin < marginMin) margin = marginMin;
	}, { immediately: true });

	on('visible', () => {
		if (!currentProject) startScrolling();
	});

	on('invisible', () => {
		stopScrolling();
	});

	// listen for tab-moved focus on scroll container..
	catchFocusIn(parentContainer, 'Selection of Projects', (e: Event) => {
		e.preventDefault();
		subContainers = document.querySelectorAll('.sub-container');
		(subContainers[Math.floor((subContainers.length - 1) / 2)].children[0] as HTMLAnchorElement).click();
	});

	// disable all kind of default scroll behaviours and create tooltip for project preview..
	toggleClientScrolling(scrollContainer, true).disable();
	initProjectTooltip();

	// fill parent with projects and start scrolling!
	generateProjects();
	startScrolling();
}


/**
 * Start animated scrolling if it's not running.
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
 * Stop animated scrolling if it's running.
 */
export const stopScrolling = () => {
	if (scrollState === 'centering' || scrollState === 'idling') return;
	scrollState = 'idling';

	cancelAnimationFrame(animationFrameId);
}


/**
 * Get either left or right neighbor of currently selected project.
 */
export const getNeighbor = (dir: 'left' | 'right'): HTMLAnchorElement | void => {
	if (!currentProject) return;
	const subSection = currentProject.parentElement!;

	let neighbor: Element;

	if (dir === 'left') {
		neighbor = (subSection.firstElementChild !== currentProject! ?
			currentProject.previousElementSibling! :
			subSection.previousElementSibling!.lastElementChild!);
	} else {
		neighbor = subSection.lastElementChild !== currentProject! ?
			currentProject!.nextElementSibling! :
			subSection.nextElementSibling!.firstElementChild!;
	}

	return neighbor as HTMLAnchorElement;
}


/**
 * Eventlistener for click event in each subcontainer.
 */
const onContainerClick = (e: Event) => {
	const target = e.target as HTMLAnchorElement;

	if (target.classList.contains('project-anchor') && target !== currentProject)
		centerProject(target);
}


/**
* Move first subcontainer at end of scroll container.
*/
const appendContainer = (): void => {
	lastContainer = shiftContainer();
	scrollContainer.appendChild(lastContainer);
}


/**
 * Move last container at the beginning of scroll container.
 */
const prependContainer = (): void => {
	firstContainer = popContainer();
	scrollContainer.prepend(firstContainer);
	currentScroll += firstContainer.clientWidth;
	scrollContainer.scrollLeft = currentScroll;
}


/**
 * Remove & return first container from parent without affecting current scroll position.
 */
const shiftContainer = (): HTMLDivElement => {
	const prevContainer = firstContainer;
	firstContainer.remove();
	firstContainer = scrollContainer.firstElementChild as HTMLDivElement;
	currentScroll -= firstContainer.clientWidth;
	scrollContainer.scrollLeft = currentScroll;
	return prevContainer;
}


/**
 * Remove & return last container from parent.
 */
const popContainer = (): HTMLDivElement => {
	const prevContainer = lastContainer;
	lastContainer.remove();
	lastContainer = scrollContainer.lastElementChild as HTMLDivElement;
	return prevContainer;
}


/**
 * Main Loop for animated scrolling.
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
 * Fill all available space (including specified margin) within parent with subcontainers and
 * subsequently center the scroll position horizontally to enable seamless client scrolling in both directions.
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
 * Smoothly animate scroll in scroll container to center the given project.
 */
const centerProject = (projectElement: HTMLAnchorElement) => {
	if (scrollState === 'centering') return;
	stopScrolling();
	scrollState = 'centering';

	if (currentProject) currentProject.classList.remove('active');
	currentProject = projectElement;
	currentProject.classList.add('active');

	const bcr = projectElement.getBoundingClientRect(),
		containerWidth = firstContainer.clientWidth,
		rawDiff = (bcr.width / 2 + bcr.left) - (scrollFrame.width / 2 + scrollFrame.left);

	scrollHorizontal(scrollContainer, {
		from: currentScroll,
		to: rawDiff,
		speed: scrollSpeed
	}).then(() => {
		currentScroll += rawDiff;
		scrolledDistance += rawDiff;

		// swap containers to create an illusion of 'infinite' scrolling..
		for (let i = Math.abs(scrolledDistance) * distanceFactor; i > containerWidth; i -= containerWidth) {
			if (scrolledDistance > 0) {
				appendContainer();
				scrolledDistance -= containerWidth;
			} else {
				prependContainer();
				scrolledDistance += containerWidth;
			}
		}

		displayProject(projectElement);
		scrollState = 'idling';
	});
};