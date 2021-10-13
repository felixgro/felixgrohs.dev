import projects from './_projects.json';


export interface Project {
    title: string;
    url: string;
    repo: string;
    description: string;
    stack: string[];
}

/**
* Creates a container filled with all projects.
**/
export const createContainer = (): HTMLDivElement => {
    const container = document.createElement('div');
    container.className = 'sub-container';

    addProjectsTo(container);

    return container;
};


/**
 * Finds project by it's title.
 */
export const getProject = (title: string): Project => {
    const project = projects.find(v => v.title === title) as Project;

    if (!project)
        throw new Error(`Cannot find project with title '${title}'`);

    return project;
};


/**
 * Fills container with specified projects as anchor tags.
 */
const addProjectsTo = (container: HTMLDivElement): void => {
    for (const project of projects) {
        const div = document.createElement('div');
        div.className = 'project-anchor';
        div.innerText = project.title;
        container.appendChild(div);
    }
};