import type { Project } from './ProjectFactory';
import type { StackList } from './StackList';
import type { FocusTrapControls, ClickOutsideEventControls } from '../utils/dom';
import type { SwipeController } from '../utils/gestures';
import type { SwappableText, AnimationConfig } from '../utils/motion';

import { getProject } from './ProjectFactory';
import { startScrolling, getNeighbor } from './ProjectScroller';
import { trapFocus, newTabAnchor, setVisibility, onClickOutsideOf } from '../utils/dom';
import { createStackList } from './StackList';
import { swappable } from '../utils/motion';
import { swipe } from '../utils/gestures';
import { on } from '../utils/events';


const ANIM_DURATION = 200,
    ANIM_DISTANCE = 20;


let scrollContainer: HTMLDivElement,
    scrollBcr: DOMRect,
    tooltip: HTMLDivElement,
    title: SwappableText,
    stackList: StackList,
    description: SwappableText,
    source: HTMLAnchorElement,
    preview: HTMLAnchorElement,
    focusTrap: FocusTrapControls,
    swipeCntrl: SwipeController,
    clickOutsideHandler: ClickOutsideEventControls,
    isOpen = false;


export const initProjectTooltip = () => {
    createProjectTooltip();

    scrollContainer = document.querySelector('.projects-container')!;
    clickOutsideHandler = onClickOutsideOf([tooltip, scrollContainer], closeTooltip);
    focusTrap = trapFocus(tooltip, '#projectTitle');
    swipeCntrl = swipe(scrollContainer, {
        right: gotoPrevious,
        left: gotoNext
    });


    on('post-resize', () => {
        closeTooltip();
        scrollBcr = scrollContainer.getBoundingClientRect();
        tooltip.style.bottom = `${scrollBcr.height * 2}px`;
    }, { immediately: true });


    // TODO: Inform screenreaders of keyboard shortcuts
    // https://www.w3schools.com/tags/att_global_accesskey.asp
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/ariaKeyShortcuts
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
        clickOutsideHandler.listen();
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
        clickOutsideHandler.unlisten();
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
    source.href = project.repo;
    preview.href = project.url;

    const animationConfig: AnimationConfig = {
        distance: ANIM_DISTANCE,
        duration: ANIM_DURATION,
        direction,
    };

    title.swap(project.title, animate, animationConfig);
    description.swap(project.description, animate, animationConfig);
    stackList.setStack(project.stack, animate, animationConfig);
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
    // creates tooltip element and hides it from screen readers..
    tooltip = document.querySelector('.project-tooltip')!;

    // creates tooltip header for title and project stack..
    const titleElement = document.querySelector<HTMLHeadingElement>('#projectTitle')!;
    const descriptionElement = document.querySelector<HTMLParagraphElement>('#projectDescription')!;
    const stackListElement = document.querySelector<HTMLParagraphElement>('.stacklist')!;

    title = swappable(titleElement);
    description = swappable(descriptionElement);
    stackList = createStackList(stackListElement);

    // creates tooltip footer for action buttons and project urls..
    const footer = document.createElement('footer');
    const actions = document.createElement('form');

    const prevBtn = document.querySelector<HTMLButtonElement>('.tooltip-action-previous')!,
        nextBtn = document.querySelector<HTMLButtonElement>('.tooltip-action-next')!,
        escpBtn = document.querySelector<HTMLButtonElement>('.tooltip-action-escape')!;

    // TODO: EXCLUDE
    const eventListener = (e: Event) => {
        e.preventDefault();

        // TODO: change button to svg and get title by a different attribute
        switch ((e.target as HTMLElement).innerText) {
            case 'next': return gotoNext();
            case 'prev': return gotoPrevious();
            case 'escp': return closeTooltip();
        }
    }

    [escpBtn, prevBtn, nextBtn].forEach(btn => btn.addEventListener('click', eventListener));
    // END EXCLUDE

    const nav = document.createElement('nav');
    source = nav.appendChild(newTabAnchor('Source'));
    source.className = 'source';
    preview = nav.appendChild(newTabAnchor('Preview'));
    preview.className = 'preview';
    // appendChildren(footer, actions, nav);

    // creates small triangle pointing down..
    const triangle = document.createElement('div');
    triangle.className = 'triangle-down';

    // append everything within tooltip..
    // appendChildren(tooltip, header, description.parent, footer, triangle);
}