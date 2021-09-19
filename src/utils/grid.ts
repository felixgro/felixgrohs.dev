import { on } from './events';

enum Position {
    Top,
    Right,
    Bottom,
    Left
}

const lines: Line[] = [],
    lineWidth = 4,
    lineColor = 'hsl(241, 16%, 15%)';

let canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    canvasBcr: DOMRect;

class Line {
    constructor(
        public el: Element,
        public pos: Position
    ) { }

    get startPos(): [number, number] {
        const elBcr = this.el.getBoundingClientRect();

        let x = this.pos == Position.Top || this.pos == Position.Bottom || this.pos === Position.Left ? elBcr.x : elBcr.x + elBcr.width - lineWidth;
        let y = this.pos == Position.Top || this.pos == Position.Right || this.pos === Position.Left ? elBcr.y : elBcr.y + elBcr.height - lineWidth;

        x -= canvasBcr.x;
        y -= canvasBcr.y;

        return [x, y];
    }

    get isHorizontal(): boolean {
        return this.pos % 2 === 0;
    }

    get length(): number {
        return this.isHorizontal ? this.el.clientWidth : this.el.clientHeight;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const [x, y] = this.startPos;

        ctx.beginPath();
        ctx.rect(x, y, this.isHorizontal ? this.length : lineWidth, this.isHorizontal ? lineWidth : this.length);
        ctx.fillStyle = lineColor;
        ctx.fill();
    }
}

export default (c: HTMLCanvasElement, cellElements: NodeList) => {
    // init canvas
    canvas = c;
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
    canvasBcr = canvas.getBoundingClientRect();

    ctx = canvas.getContext('2d')!;

    // TODO: automatically create lines without duplication
    lines.push(new Line(canvas, Position.Top));
    lines.push(new Line(canvas, Position.Left));
    lines.push(new Line(canvas, Position.Right));
    lines.push(new Line(canvas, Position.Bottom));
    lines.push(new Line(cellElements[0] as Element, Position.Bottom));
    lines.push(new Line(cellElements[1] as Element, Position.Bottom));
    lines.push(new Line(cellElements[3] as Element, Position.Top));

    // draw all lines
    for (const line of lines) line.draw(ctx);

    // redraw grid when window resizes..
    on('resize', redrawGrid);
}

const redrawGrid = () => {
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
    canvasBcr = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, canvasBcr.width, canvasBcr.height);
    for (const line of lines) line.draw(ctx);
}