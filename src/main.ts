import initProjectScroller from './projects/ProjectScroller';
import animateGrid, { renderGrid } from './utils/grid';
import { on } from './utils/events';

on('load', () => {
    initProjectScroller();

    const gridCanvas = document.querySelector('.animated-grid') as HTMLCanvasElement;
    const gridChilds = document.querySelectorAll('.grid-cell');

    animateGrid(gridCanvas, gridChilds);

    on('resize', renderGrid);
});