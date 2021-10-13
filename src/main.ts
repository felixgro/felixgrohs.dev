import { registerDefaultEvents, on } from './utils/events';
import { initProjectScroller } from './projects/ProjectScroller';
import animateGrid from './utils/grid';

registerDefaultEvents();

on('load', () => {
    const appContainer = document.querySelector('#app')!;
    // Start scrolling through projects
    initProjectScroller(appContainer);

    // Draw Grid..
    const gridCanvas = document.querySelector('.animated-grid') as HTMLCanvasElement;
    const gridChilds = document.querySelectorAll('.grid-cell');
    animateGrid(gridCanvas, gridChilds);
});