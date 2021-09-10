import { registerDefaultEvents, on } from './utils/events';
import initProjectScroller from './projects/ProjectScroller';
import animateGrid from './utils/grid';

registerDefaultEvents();

on('load', () => {
    // Start scrolling through projects
    initProjectScroller();

    // Draw Grid
    const gridCanvas = document.querySelector('.animated-grid') as HTMLCanvasElement;
    const gridChilds = document.querySelectorAll('.grid-cell');
    animateGrid(gridCanvas, gridChilds);
});

// check client's system theme
// const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
// if (isDark) document.body.className = 'dark';