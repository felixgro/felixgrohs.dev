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
* 
* @returns container element
**/
export const createContainer = (): HTMLDivElement => {
    const container = document.createElement('div');
    container.className = 'sub-container';

    addProjectsTo(container);

    return container;
};


/**
 * Fills container with specified projects as anchor tags.
 * 
 * @param container 
 */
const addProjectsTo = (container: HTMLDivElement): void => {
    for (const project of projects) {
        const div = document.createElement('div');
        div.className = 'project-anchor';
        div.innerText = project.title;
        container.appendChild(div);
    }
};

/**
 * Finds project by it's title.
 * 
 * @param title - title of project
 * @returns project object or false if nothing found
 */
export const getProject = (title: string): Project | false => {
    const project = projects.find(v => v.title === title) as Project;
    return project ? project : false;
};