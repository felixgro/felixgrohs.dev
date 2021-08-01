import projects from '../config/projects.json';
import techs from '../config/tech.json';

export interface Project {
    title: string;
    url: string;
    repo: string;
    description: string;
    stack: string[];
}

export interface Tech {
    title: string;
    short: string;
    color: string;
}

let clickCallback: (this: GlobalEventHandlers, ev: MouseEvent) => any;

/**
* Creates a container filled with all projects.
* 
* @returns container element
**/
export const createContainer = (): HTMLDivElement => {
    const container = document.createElement('div');
    container.className = 'sub-container';

    addProjectsTo(container);

    return container;
};

export const getProject = (title: string): Project | false => {
    const project = projects.find(v => v.title === title) as Project;
    if (!project) return false;

    return project;
};

export const getTech = (short: string): Tech | false => {
    const tech = techs.find(t => t.short === short) as Tech;
    if (!tech) return false;

    return tech;
}

/**
 * Registers an event listener for each project.
 * 
 * @param callback
 */
export const onProjectClick = (callback: (this: GlobalEventHandlers, ev: MouseEvent) => any): void => {
    clickCallback = callback;
};

/**
 * Fills container with specified projects as anchor tags.
 * 
 * @param container 
 */
const addProjectsTo = (container: Element): void => {
    for (const project of projects) {
        const p = document.createElement('div');
        p.className = 'project-anchor';
        p.innerHTML = project.title;
        p.onclick = clickCallback;

        container.appendChild(p);
    }
};