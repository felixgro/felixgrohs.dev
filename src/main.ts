import initProjectScroller from './projects/ProjectScroller';
import animateGrid, { renderGrid } from './utils/grid';
import { on } from './utils/events';

// automatic theming
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (isDark) document.body.className = 'dark';

on('load', () => {
    initProjectScroller();

    const gridCanvas = document.querySelector('.animated-grid') as HTMLCanvasElement;
    const gridChilds = document.querySelectorAll('.grid-cell');

    animateGrid(gridCanvas, gridChilds);

    on('resize', renderGrid);
});