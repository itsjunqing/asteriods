"use strict";
function asteroids() {
    const svg = document.getElementById("canvas");
    let x = svg.clientWidth / 2;
    let y = svg.clientHeight / 2;
    let angle = 170;
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(" + x + " " + y + ") rotate(" + angle + ")");
    let rect = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:black; stroke:white; stroke-width:1");
    const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
    const radToDeg = (rad) => rad * 180 / Math.PI + 90;
    const SHIP_BORDERS = 25;
    let speed = 5, multipler = 0;
    const stopArrowUp = Observable.fromEvent(document, "keyup")
        .filter(({ key }) => key == "ArrowUp")
        .subscribe(() => {
        multipler = 0;
        speed = 5;
    });
    const accelerateShip = Observable.fromEvent(document, "keydown")
        .filter(({ key }) => key == "ArrowUp")
        .map(() => {
        const xChange = speed * Math.sin(angle * Math.PI / 180), yChange = speed * Math.cos(angle * Math.PI / 180);
        x += xChange;
        y -= yChange;
        if (x < -SHIP_BORDERS) {
            x = svg.clientWidth;
        }
        else if (x > svg.clientWidth + SHIP_BORDERS) {
            x = 0;
        }
        if (y < -SHIP_BORDERS) {
            y = svg.clientHeight;
        }
        else if (y > svg.clientHeight + SHIP_BORDERS) {
            y = 0;
        }
        if (speed < 300) {
            speed += multipler;
            multipler += 0.1;
        }
        return { x, y, multipler };
    })
        .subscribe(({ x, y, multipler }) => {
        g.attr("transform", "translate(" + x + ", " + y + ") rotate(" + angle + ")");
    });
    const rotateShip = Observable.fromEvent(document, "keydown")
        .filter(({ key }) => key == "ArrowRight" || key == "ArrowLeft")
        .map(({ key }) => {
        if (key == "ArrowRight") {
            angle = (angle + 10) % 360;
        }
        else if (key == "ArrowLeft") {
            angle = (angle - 10) % 360;
        }
        return { angle };
    })
        .subscribe(({ angle }) => {
        g.attr("transform", "translate(" + x + ", " + y + ") rotate(" + angle + ")");
    });
}
function getAttributeValues(e, attribute) {
    return e.attr(attribute).match(/\d+/g);
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map