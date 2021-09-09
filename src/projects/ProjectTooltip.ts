import { getProject, Project } from './ProjectFactory';
import { startScrolling } from './ProjectScroller';
import { trapFocus, blurAndCall } from '../utils/dom';
import swipe, { Swipe } from '../utils/swipe';
import { on } from '../utils/events';

const tooltip = document.querySelector<HTMLDivElement>('.project-tooltip')!,
    title = tooltip.querySelector<HTMLHeadingElement>('h3')!,
    description = tooltip.querySelector<HTMLParagraphElement>('p')!,
    stack = tooltip.querySelector<HTMLDivElement>('div.stack')!,
    source = tooltip.querySelector<HTMLAnchorElement>('a.source')!,
    preview = tooltip.querySelector<HTMLAnchorElement>('a.preview')!,
    buttonBackward = tooltip.querySelector<HTMLButtonElement>('button.backward')!,
    buttonEscape = tooltip.querySelector<HTMLButtonElement>('button.close')!,
    buttonForward = tooltip.querySelector<HTMLButtonElement>('button.forward')!,
    duration = 200; // Duration for tooltip animation in ms

let swiper: Swipe,
    currentProject: HTMLAnchorElement | null,
    focusTrap = trapFocus(tooltip),
    bgElement: HTMLDivElement,
    isOpen = false;


/**
 * Displays a new project within the tooltip.
 * 
 * @param a - project's clicked anchor element
 */
export const displayProject = (a: HTMLAnchorElement) => {
    const project = getProject(a.innerText);
    if (!project) return;

    currentProject = a;

    if (isOpen) {
        switchTo(project);
    } else {
        assignProjectToTooltip(project);
        openTooltip();
    }
};


/**
 * Positionates & opens tooltip if it's currently closed.
 */
export const openTooltip = () => {
    if (isOpen) return;
    isOpen = true;

    const parentBcr = document.querySelector('.projects-container')!.getBoundingClientRect()!;

    tooltip.style.display = 'block';
    tooltip.style.bottom = `${window.innerHeight - parentBcr.y + 25}px`;

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
        duration,
        fill: 'forwards',
    });

    addClickableBackground();
    swiper.start();
    focusTrap.trap();
};


/**
 * Closes tooltip, and starts autoscrolling afterwards.
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
        duration,
        fill: 'forwards',
    });

    setTimeout(() => tooltip.style.display = 'none', duration);

    removeClickableBackground();
    swiper.stop();
    focusTrap.untrap();
    startScrolling();
};


/**
 * Jump to next project.
 */
export const gotoNext = () => {
    if (!isOpen) return;

    const next = getRightNeighbor();
    if (next) next.click();
}


/**
 * Jump to previous project.
 */
export const gotoPrevious = () => {
    if (!isOpen) return;

    const prev = getLeftNeighbor();
    if (prev) prev.click();
}


/**
 * Get left neighbor of currently selected project.
 * 
 * @returns project element
 */
export const getLeftNeighbor = (): HTMLAnchorElement | void => {
    if (!isOpen) return;

    const subSection = currentProject!.parentElement!;
    let neighbor: Element;

    if (subSection.firstElementChild !== currentProject!) {
        neighbor = currentProject!.previousElementSibling!;
    } else {
        neighbor = subSection.previousElementSibling!.lastElementChild!;
    }

    return neighbor as HTMLAnchorElement;
}


/**
 * Get right neighbor of currently selected project.
 * 
 * @returns project element
 */
export const getRightNeighbor = (): HTMLAnchorElement | void => {
    if (!isOpen) return;

    const subSection = currentProject!.parentElement!;
    let neighbor: Element;

    if (subSection.lastElementChild !== currentProject!) {
        neighbor = currentProject!.nextElementSibling!;
    } else {
        neighbor = subSection.nextElementSibling!.firstElementChild!;
    }

    return neighbor as HTMLAnchorElement;
}


/**
 * Updates tooltip's data to match the selected project.
 * 
 * @param project
 */
const assignProjectToTooltip = (project: Project) => {
    title.innerText = project.title;
    description.innerText = project.description
    source.href = project.repo;
    preview.href = project.url;

    for (let i = 0; i < stack.children.length; i++) {
        const tech = stack.children[i] as HTMLElement;

        if (project.stack.includes(tech.className)) {
            // show tech if not visible
            if (tech.getAttribute('aria-hidden') === 'true') {
                tech.style.display = 'block';
                tech.setAttribute('aria-hidden', 'false');
            }
        } else {
            // hide tech if still visible
            if (tech.getAttribute('aria-hidden') === 'false') {
                tech.style.display = 'none';
                tech.setAttribute('aria-hidden', 'true');
            }
        }
    }
};


/**
 * Smoothly animate height to fit new project within tooltip.
 * 
 * @param project 
 */
const switchTo = (project: Project) => {
    const curHeight = tooltip.clientHeight;

    assignProjectToTooltip(project);

    tooltip.style.height = 'auto';
    let newHeight = tooltip.getBoundingClientRect().height;
    tooltip.style.height = `${curHeight}px`;

    tooltip.animate([
        {
            height: `${curHeight}px`
        }, {
            height: `${newHeight}px`
        }
    ], {
        duration,
        easing: 'ease-out'
    });

    tooltip.style.height = `auto`;
};


/**
 * Adds full width & height background layer which auto closes tooltip on click.
 */
const addClickableBackground = () => {
    bgElement = document.createElement('div');
    Object.assign(bgElement.style, {
        position: 'fixed',
        inset: 0,
        'z-index': 100,
    });

    bgElement.onclick = closeTooltip;
    document.body.appendChild(bgElement);
}


/**
 * Removes background layer.
 */
const removeClickableBackground = () => {
    bgElement.remove();
}


/**
 * Registration of client events for convenient usage
 */
buttonForward.onclick = (e) => blurAndCall(e, gotoNext);
buttonBackward.onclick = (e) => blurAndCall(e, gotoPrevious);
buttonEscape.onclick = (e) => blurAndCall(e, closeTooltip);

on('key-Left', () => {
    if (!isOpen) return;
    gotoPrevious();
});

on('key-Right', () => {
    if (!isOpen) return;
    gotoNext();
});

on('key-Escape', () => {
    if (!isOpen) return;
    startScrolling();
    closeTooltip();
});

swiper = swipe(document.querySelector('.projects')!)
    .onLeft(gotoNext)
    .onRight(gotoPrevious);