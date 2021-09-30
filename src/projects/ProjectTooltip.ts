import type { Project } from './ProjectFactory';
import type { FocusTrapControls } from '../utils/dom';
import type { SwipeController } from '../utils/gestures';
import type { SwappableText, SwappableAnimationConfig } from '../utils/motion';

import { getProject } from './ProjectFactory';
import { startScrolling, getNeighbor } from './ProjectScroller';
import { trapFocus, newTabAnchor, setVisibility, onClickOutsideOf, appendChildren } from '../utils/dom';
import { swipeable } from '../utils/gestures';
import { swappable } from '../utils/motion';
import { on } from '../utils/events';

const ANIM_DURATION = 200,
    ANIM_DISTANCE = 20;

let scrollContainer: HTMLDivElement,
    scrollBcr: DOMRect,
    tooltip: HTMLDivElement,
    stack: HTMLUListElement,
    source: HTMLAnchorElement,
    preview: HTMLAnchorElement,
    focusTrap: FocusTrapControls,
    swipeCntrl: SwipeController,
    isOpen = false;

let title: SwappableText,
    description: SwappableText;


export const initProjectTooltip = () => {
    createProjectTooltip();

    focusTrap = trapFocus(tooltip);
    scrollContainer = document.querySelector('.projects-container')!;
    swipeCntrl = swipeable(scrollContainer, {
        right: gotoPrevious,
        left: gotoNext
    });

    on('post-resize', () => {
        scrollBcr = scrollContainer.getBoundingClientRect();
        tooltip.style.bottom = `${scrollBcr.height * 2}px`;
    }, { immediately: true });

    on('key-Right', gotoNext);
    on('key-Left', gotoPrevious);
    on('key-Escape', closeTooltip);
}


/**
 * Display a project within the tooltip.
 */
export const displayProject = (a: HTMLAnchorElement) => {
    const project = getProject(a.innerText);
    if (!project) return;

    if (isOpen) {
        switchTo(project);
    } else {
        assignProjectToTooltip(project);
        openTooltip();
    }
};


/**
 * Positionate & open tooltip if it's currently closed.
 */
export const openTooltip = () => {
    if (isOpen) return;
    isOpen = true;

    tooltip.style.display = 'block';
    tooltip.setAttribute('aria-hidden', 'false');

    tooltip.animate([
        {
            opacity: 0,
            transform: 'scaleY(0) translateX(-50%)'
        },
        {
            opacity: 1,
            transform: 'scaleY(1) translateX(-50%)'
        }
    ], {
        duration: ANIM_DURATION,
        fill: 'forwards',
    }).addEventListener('finish', () => {
        swipeCntrl.addListener();
        focusTrap.trap();
    });
}


/**
 * Close tooltip, and start animated scrolling afterwards.
 */
export const closeTooltip = () => {
    if (!isOpen) return;
    isOpen = false;

    tooltip.animate([
        {
            opacity: 1,
            transform: 'scaleY(1) translateX(-50%)'
        },
        {
            opacity: 0,
            transform: 'scaleY(0) translateX(-50%)'
        }
    ], {
        duration: ANIM_DURATION,
        fill: 'forwards',
    }).addEventListener('finish', () => {
        setVisibility(false, tooltip);
        swipeCntrl.removeListener();
        focusTrap.untrap();
    });

    startScrolling();
}


/**
 * Jump to next project.
 */
export const gotoNext = () => {
    if (!isOpen) return;

    const next = getNeighbor('right');
    if (next) next.click();
}


/**
 * Jump to previous project.
 */
export const gotoPrevious = () => {
    if (!isOpen) return;

    const prev = getNeighbor('left');
    if (prev) prev.click();
}


/**
 * Update tooltip's data to match a newly selected project.
 */
const assignProjectToTooltip = (project: Project, animate = false, direction: 'up' | 'down' = 'up') => {
    onClickOutsideOf([tooltip, scrollContainer], closeTooltip);
    source.href = project.repo;
    preview.href = project.url;

    const animationConfig: SwappableAnimationConfig = {
        distance: ANIM_DISTANCE,
        duration: ANIM_DURATION,
        direction,
    };

    title.swap(project.title, animate, animationConfig);
    description.swap(project.description, animate, animationConfig);
}

/**
 * Smoothly animate height to fit new project within tooltip.
 */
const switchTo = (project: Project) => {
    // get current height as animation start value..
    const prevHeight = tooltip.clientHeight;

    // get animation direction based on height difference
    // between prev and next project description..
    const diff = description.heightDiff(project.description),
        direction = diff <= 0 ? 'down' : 'up';

    // animate new project content..
    assignProjectToTooltip(project, true, direction);

    // get new height as animation height value and reset
    // the tooltip height to it's initial value..
    const newHeight = tooltip.getBoundingClientRect().height;

    // animate smoothly from previous height to new one..
    tooltip.animate([{
        height: `${prevHeight}px`
    }, {
        height: `${newHeight}px`
    }], {
        duration: ANIM_DURATION,
        easing: 'ease-out'
    });
}


/**
 * Create tooltip markup and it assign to the dom.
 */
export const createProjectTooltip = () => {
    // creates tooltip element and hides it visually and from screen readers..
    tooltip = document.createElement('div');
    tooltip.className = 'project-tooltip';
    setVisibility(false, tooltip);

    // creates tooltip header for title and project stack..
    const header = document.createElement('header');
    title = swappable('h3');
    title.parent.className = 'headings';
    stack = document.createElement('ul');
    appendChildren(header, title.parent, stack);
    tooltip.appendChild(header);

    // creates project description..
    description = swappable('p');
    description.parent.className = 'details';
    tooltip.appendChild(description.parent);

    // creates tooltip footer for action buttons and project urls..
    const footer = document.createElement('footer');
    const actions = document.createElement('form');
    const nav = document.createElement('nav');
    source = nav.appendChild(newTabAnchor('Source'));
    source.className = 'source';
    preview = nav.appendChild(newTabAnchor('Preview'));
    preview.className = 'preview';
    appendChildren(footer, actions, nav);
    tooltip.appendChild(footer);

    // creates small triangle pointing down..
    const triangle = document.createElement('div');
    triangle.className = 'triangle-down';
    tooltip.appendChild(triangle);

    // appends tooltip within app container..
    document.querySelector('#app')!.appendChild(tooltip);
}