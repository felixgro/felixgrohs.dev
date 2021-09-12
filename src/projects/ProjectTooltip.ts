import { getProject, Project } from './ProjectFactory';
import { startScrolling, getNeighbor } from './ProjectScroller';
import { trapFocus, FocusTrap } from '../utils/dom';
import { addStylesTo } from '../utils/css';
import { on } from '../utils/events';


const duration = 200; // Duration for tooltip animation in ms


let tooltip: HTMLDivElement,
    heading: HTMLHeadingElement,
    description: HTMLParagraphElement,
    stack: HTMLUListElement,
    source: HTMLAnchorElement,
    preview: HTMLAnchorElement,
    focusTrap: FocusTrap,
    bgLayer: HTMLDivElement,
    isOpen = false;


export const initProjectTooltip = () => {
    createProjectTooltip();
    focusTrap = trapFocus(tooltip);

    on('pre-resize', closeTooltip);

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
    focusTrap.trap();
};


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
        duration,
        fill: 'forwards',
    });

    setTimeout(() => tooltip.style.display = 'none', duration);

    removeClickableBackground();
    focusTrap.untrap();
    startScrolling();
};


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
const assignProjectToTooltip = (project: Project) => {
    heading.innerText = project.title;
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
    if (!bgLayer) {
        bgLayer = document.createElement('div');
        addStylesTo(bgLayer, {
            position: 'fixed',
            inset: 0,
        });

        bgLayer.onclick = closeTooltip;
        document.body.appendChild(bgLayer);
    }

    addStylesTo(bgLayer, {
        zIndex: 100
    });
}


/**
 * Hide background layer.
 */
const removeClickableBackground = () => {
    addStylesTo(bgLayer, {
        zIndex: -1
    });
}


/**
 * Create tooltip markup and assign to dom.
 */
export const createProjectTooltip = () => {
    tooltip = document.createElement('div');
    tooltip.className = 'project-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');

    const header = document.createElement('header');
    heading = document.createElement('h3');
    stack = document.createElement('ul');
    header.appendChild(heading);
    header.appendChild(stack);
    tooltip.appendChild(header);

    description = document.createElement('p');
    tooltip.appendChild(description);

    const footer = document.createElement('footer');
    const actions = document.createElement('form');

    const nav = document.createElement('nav');
    source = nav.appendChild(document.createElement('a'));
    source.href = '#';
    source.rel = 'noreferrer';
    source.innerText = 'Source';
    source.className = 'source';
    source.target = '_blank';
    preview = nav.appendChild(document.createElement('a'));
    preview.href = '#';
    preview.rel = 'noreferrer';
    preview.innerText = 'Preview';
    preview.className = 'preview';
    preview.target = '_blank';

    footer.appendChild(actions);
    footer.appendChild(nav);
    tooltip.appendChild(footer);

    const triangle = document.createElement('div');
    triangle.className = 'triangle-down';
    tooltip.appendChild(triangle);

    document.body.appendChild(tooltip);
};