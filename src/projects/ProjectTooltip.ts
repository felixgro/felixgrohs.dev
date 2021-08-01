import { getProject, getTech, Project } from './ProjectFactory';
import { startScrolling } from './ProjectScroller';

const tooltip = document.querySelector<HTMLDivElement>('.project-tooltip')!,
    title = tooltip.querySelector<HTMLHeadingElement>('h3')!,
    description = tooltip.querySelector<HTMLParagraphElement>('p')!,
    stack = tooltip.querySelector<HTMLDivElement>('div.stack')!,
    source = tooltip.querySelector<HTMLAnchorElement>('a.source')!,
    preview = tooltip.querySelector<HTMLAnchorElement>('a.preview')!,
    closeButton = tooltip.querySelector<HTMLButtonElement>('.close-tooltip')!,
    duration = 200;

let bgElement: HTMLDivElement,
    isOpen = false;

/**
 * Displays a new project within the tooltip.
 * 
 * @param a - project's clicked anchor element
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
 * Updates tooltip's data to match the selected project.
 * 
 * @param project
 */
const assignProjectToTooltip = (project: Project) => {
    title.innerText = project.title;
    description.innerText = project.description
    source.href = project.repo;
    preview.href = project.url;

    stack.innerHTML = '';
    for (const t of project.stack) {
        const tech = getTech(t)
        if (!tech) continue;

        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.innerText = tech.short;
        badge.style.background = tech.color;
        stack.appendChild(badge);
    }
};

/**
 * Smoothly animate height to fit new project within tooltip.
 * 
 * @param project 
 */
const switchTo = (project: Project) => {
    let curHeight = tooltip.clientHeight;

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
    startScrolling();
};

closeButton.onclick = closeTooltip;