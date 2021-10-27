import type { StackList } from './StackList';
import type { Project } from './ProjectFactory';
import type { SwipeController } from '../utils/gestures';
import type { SwappableText, AnimationConfig } from '../utils/motion';
import type { FocusTrapControls, ClickOutsideControls } from '../utils/dom';

import { on } from '../utils/events';
import { swipe } from '../utils/gestures';
import { swappable } from '../utils/motion';
import { createStackList } from './StackList';
import { getProject } from './ProjectFactory';
import { debounce } from '../utils/functions';
import { trapFocus, setVisibility, onClickOutside } from '../utils/dom';
import { startScrolling, getNeighbor } from './ProjectScroller';


const DEBOUNCE_TIMEOUT = 240,
    ANIM_DURATION = 200, // Duration of text swap & dialog height animation
    ANIM_DISTANCE = 20; // Distance of vertical text swap animation


let dialog: HTMLElement,
    scrollContainer: HTMLDivElement,
    scrollBcr: DOMRect,
    stackList: StackList,
    title: SwappableText,
    description: SwappableText,
    source: HTMLAnchorElement,
    preview: HTMLAnchorElement,
    controls: NodeListOf<HTMLButtonElement>,
    focusTrap: FocusTrapControls,
    swipeCntrl: SwipeController,
    clickOutsideListener: ClickOutsideControls,
    isOpen = false;



/**
 * Prepares markup and event listeners for project dialog.
 * This function get's executed when browser is idling, since
 * dialog is invisible at it's initial state.
 */
export const prepareDialog = (app: Element) => {
    insertDialogMarkup(app);

    controls = app.querySelectorAll('button')!;
    scrollContainer = app.querySelector('.projects-container')!;
    focusTrap = trapFocus(dialog, '#projectTitle');
    clickOutsideListener = onClickOutside({
        elements: [dialog, scrollContainer],
        callback: closeDialog,
        within: app,
    });

    registerEvents();
}


/**
 * Display a project within the tooltip.
 */
export const displayProject = (a: HTMLAnchorElement) => {
    const project = getProject(a.innerText);

    if (isOpen)
        return switchTo(project);

    assign(project);
    openDialog();
};


/**
 * Opens dialog if currently closed.
 */
export const openDialog = () => {
    if (isOpen) return;
    isOpen = true;

    dialog.style.display = 'block';
    dialog.setAttribute('aria-hidden', 'false');

    dialog.animate([
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
        clickOutsideListener.activate();
        swipeCntrl.addListener();
        focusTrap.trap();
    });
}


/**
 * Closes dialog and starts animated scrolling.
 */
export const closeDialog = () => {
    if (!isOpen) return;
    isOpen = false;

    dialog.animate([
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
        setVisibility(false, dialog);
        swipeCntrl.removeListener();
        focusTrap.untrap();
        clickOutsideListener.deactivate();
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
 * Assign new project to dialog. By default this happens immediately.
 * If animate is true, new contents will smoothly animate
 * to it's new state using the provided direction.
 */
const assign = (project: Project, animate = false, direction: 'up' | 'down' = 'up') => {
    source.href = project.repo;
    preview.href = project.url || project.repo;

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
    const prevHeight = dialog.clientHeight;

    // get animation direction based on height difference
    // between prev and next project description..
    const diff = description.heightDiff(project.description),
        direction = diff <= 0 ? 'down' : 'up';

    // assign & animate new project within dialog..
    assign(project, true, direction);

    // get new dialog height after project assignment as animation end value..
    const newHeight = dialog.getBoundingClientRect().height;

    // animate smoothly from previous to new height..
    dialog.animate([{
        height: `${prevHeight}px`
    }, {
        height: `${newHeight}px`
    }], {
        duration: ANIM_DURATION,
        easing: 'ease-out'
    });
}


/**
 * Generates dialog markup by cloning corresponding template element into provided parent.
 * Assigns variables in order to enable dynamic state changes.
 */
const insertDialogMarkup = (parent: Element) => {
    const template = document.querySelector<HTMLTemplateElement>('#DialogTemplate')!;
    const clone = template.content.cloneNode(true);
    parent.appendChild(clone);

    dialog = parent.querySelector<HTMLDivElement>('div#projectDialog')!;
    source = parent.querySelector<HTMLAnchorElement>('a.source')!;
    preview = parent.querySelector<HTMLAnchorElement>('a.preview')!;

    const titleElement = parent.querySelector<HTMLHeadingElement>('#projectTitle')!;
    const descriptionElement = parent.querySelector<HTMLParagraphElement>('#projectDescription')!;
    const stackListElement = parent.querySelector<HTMLParagraphElement>('.stacklist')!;

    title = swappable(titleElement);
    description = swappable(descriptionElement);
    stackList = createStackList(stackListElement);
}


/**
 * Listener for click event on any of 3 action buttons
 * (exit, previous or next)
 */
const actionEventListener = (e: Event) => {
    const target = e.target as HTMLButtonElement;
    let label = target.children[0] as HTMLSpanElement;

    if (!label) label = target.parentNode!.children[0] as HTMLSpanElement;

    switch (label.innerText) {
        case 'exit': return closeDialog();
        case 'back': return gotoPrevious();
        case 'next': return gotoNext();
    }
}


/**
 * Listen for specific dialog events
 */
const registerEvents = () => {
    swipeCntrl = swipe(scrollContainer, {
        right: gotoPrevious,
        left: gotoNext
    });

    on('post-resize', () => {
        closeDialog();
        scrollBcr = scrollContainer.getBoundingClientRect();
        dialog.style.bottom = `${scrollBcr.height + 50}px`;
    }, { immediately: true });

    // TODO: Inform screenreaders of keyboard shortcuts
    // https://www.w3schools.com/tags/att_global_accesskey.asp
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/ariaKeyShortcuts
    on('key-Right', debounce(gotoNext, { timeout: DEBOUNCE_TIMEOUT }));
    on('key-Left', debounce(gotoPrevious, { timeout: DEBOUNCE_TIMEOUT }));
    on('key-Escape', debounce(closeDialog, { timeout: DEBOUNCE_TIMEOUT }));

    controls.forEach(c => c.addEventListener('click', debounce(actionEventListener, { timeout: DEBOUNCE_TIMEOUT })));
}