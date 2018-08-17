const shapeCount = 30;
const minSize = 45;
const corners = 6;
const bezier = [.4, 0, .2, 1];
const bezierDuration = 1300;
const delayPerShape = 50;

const degrees = 360 / corners;

interface Point {
    x: number;
    y: number;
}


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let bodyRect;
let bodyCenterPoint: Point;
let bezierSteps = {};

window.addEventListener('resize', initSize);
initSize();
calculateBezierSteps();
window.requestAnimationFrame(draw);

function initSize() {
    bodyRect = document.body.getBoundingClientRect();
    canvas.width = bodyRect.width;
    canvas.height = bodyRect.height;
    bodyCenterPoint = {
        x: bodyRect.width / 2,
        y: bodyRect.height / 2
    };
}

function calculateBezierSteps() {
    bezierSteps = {};
    const step = 0.001;

    for (let t = 0; t <= 1; t += step) {
        let x = Math.pow(1 - t, 3) * 0 +
            3 * t * Math.pow(1 - t, 2) * bezier[0] +
            3 * Math.pow(t, 2) * (1 - t) * bezier[2] +
            Math.pow(t, 3) * 1;

        let y = Math.pow(1 - t, 3) * 0 +
            3 * t * Math.pow(1 - t, 2) * bezier[1] +
            3 * Math.pow(t, 2) * (1 - t) * bezier[3] +
            Math.pow(t, 3) * 1;

        bezierSteps[Math.round(x * 100) / 100] = y;
    }
}

function draw(time) {
    ctx.clearRect(0, 0, bodyRect.width, bodyRect.height);

    for (let index = 0; index < shapeCount; index++) {
        const shapeTime = time + delayPerShape * index;
        const animationProgress = bezierSteps[Math.round(((shapeTime / bezierDuration) % 1) * 100) / 100];

        if (shapeTime % (bezierDuration * 2) >= bezierDuration) {
            ctx.fillStyle = index % 2 ? 'black' : 'white';
        } else {
            ctx.fillStyle = index % 2 ? 'white' : 'black';
        }
        drawShape(minSize * (shapeCount - index) - minSize * animationProgress, degrees * animationProgress);
    }

    window.requestAnimationFrame(draw);
}

function drawShape(lineLength, rotationDegrees) {
    let shape = [];
    let dx, dy, radians;
    let x = 0, y = 0;
    let totalX = 0, totalY = 0;

    for (let i = 0; i < corners; i++) {
        radians = (degrees * i) * (Math.PI / 180);
        dx = lineLength * Math.sin(radians);
        dy = lineLength * Math.cos(radians);
        x += Math.round(dx);
        y += Math.round(dy);

        totalX += x;
        totalY += y;

        shape.push({ x: x, y: y });
    }

    const centerPoint = {
        x: totalX / shape.length,
        y: totalY / shape.length,
    }

    //apply rotation
    const rotationRadians = rotationDegrees * (Math.PI / 180);
    const sin = Math.sin(rotationRadians);
    const cos = Math.cos(rotationRadians);

    shape = shape.map(point => {
        const x = point.x - centerPoint.x;
        const y = point.y - centerPoint.y;

        const x2 = (x * cos) - (y * sin);
        const y2 = (x * sin) + (y * cos);

        return {
            x: x2 + centerPoint.x,
            y: y2 + centerPoint.y
        };
    });

    //paint
    dx = bodyCenterPoint.x - centerPoint.x;
    dy = bodyCenterPoint.y - centerPoint.y;

    ctx.beginPath();
    const startingPoint = shape[shape.length - 1];
    ctx.moveTo(startingPoint.x + dx, startingPoint.y + dy);
    for (const point of shape) {
        ctx.lineTo(point.x + dx, point.y + dy);
    }
    ctx.closePath();
    ctx.fill();

}
