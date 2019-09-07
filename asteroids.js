"use strict";
const radToDeg = (rad) => rad * 180 / Math.PI;
const degToRad = (deg) => deg * Math.PI / 180;
const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
const distanceBetweenPoints = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
function asteroids() {
    const svg = document.getElementById("canvas");
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300, 300) rotate(45)")
        .attr("id", "ship");
    let rect = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:black; stroke:white; stroke-width:1");
    const rotateLeft = Observable.fromEvent(document, "keydown")
        .filter(({ code }) => code == "ArrowLeft")
        .map(() => ({
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
        angle: (getRotationDegrees($('#canvas #ship')) - 10) % 360
    }));
    const rotateRight = Observable.fromEvent(document, "keydown")
        .filter(({ code }) => code == "ArrowRight")
        .map(() => ({
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
        angle: (getRotationDegrees($('#canvas #ship')) + 10) % 360
    }));
    rotateLeft.subscribe(({ x, y, angle }) => {
        g.attr("transform", "translate(" + x + " " + y + ") rotate(" + angle + ")");
    });
    rotateRight.subscribe(({ x, y, angle }) => {
        g.attr("transform", "translate(" + x + " " + y + ") rotate(" + angle + ")");
    });
    let speed = 5, multipler = 0;
    const stopArrowUp = Observable.fromEvent(document, "keyup")
        .filter(({ code }) => code == "ArrowUp")
        .subscribe(() => {
        multipler = 0;
        speed = 5;
    });
    const accelerateShip = Observable.fromEvent(document, "keydown")
        .filter(({ code }) => code == "ArrowUp")
        .map(() => {
        const angle = getRotationDegrees($('#canvas #ship')), xChange = speed * Math.sin(degToRad(angle)), yChange = speed * Math.cos(degToRad(angle)), newX = transformMatrix(g).m41 + xChange, newY = transformMatrix(g).m42 - yChange, x = newX < 0 ? svg.clientWidth : newX > svg.clientWidth ? 0 : newX, y = newY < 0 ? svg.clientHeight : newY > svg.clientHeight ? 0 : newY;
        if (speed < 300) {
            speed += multipler;
            multipler += 0.1;
        }
        return { x, y, angle };
    });
    accelerateShip.subscribe(({ x, y, angle }) => {
        g.attr("transform", "translate(" + x + " " + y + ") rotate(" + angle + ")");
    });
    const deleteBullets = Observable.interval(1000)
        .map(() => {
        let bullets = svg.getElementsByTagName("circle");
        if (bullets.length > 0) {
            svg.removeChild(bullets[0]);
        }
    });
    const createBullets = Observable.fromEvent(document, "keydown")
        .filter(({ code }) => code == "Space")
        .map(() => {
        const x = transformMatrix(g).m41, y = transformMatrix(g).m42, angle = getRotationDegrees($('#canvas #ship')), bulletX = x + (20 * Math.sin(degToRad(angle))), bulletY = y - (20 * Math.cos(degToRad(angle))), bullet = new Elem(svg, "circle")
            .attr("cx", bulletX)
            .attr("cy", bulletY)
            .attr("r", 2)
            .attr("fill", "salmon");
        return { bulletX, bulletY, bullet };
    });
    const moveBullets = createBullets.map(({ bulletX, bulletY, bullet }) => Observable.interval(10)
        .takeUntil(deleteBullets)
        .subscribe(() => {
        const angle = getRotationDegrees($('#canvas #ship')), newX = bulletX + 5 * Math.sin(degToRad(angle)), newY = bulletY - 5 * Math.cos(degToRad(angle));
        bulletX = newX;
        bulletY = newY;
        bullet.attr("cx", newX).attr("cy", newY);
    }))
        .subscribe(() => { });
    const createRocks = Observable.interval(500)
        .takeUntil(Observable.interval(3000))
        .map(() => {
        const rockPosition = getRandomRockPosition(), size = 50, angle = getRandomInt(0, 359), xChange = size * Math.sin(degToRad(30)), yChange = size * Math.cos(degToRad(30)), newPoints = `${-xChange},${-yChange} ${xChange},${-yChange} ${size},${0} ${xChange},${yChange} ${-xChange},${yChange} ${-size},${0}`;
        const rock = new Elem(svg, "polygon")
            .attr("points", newPoints)
            .attr("style", "fill:black; stroke:cyan; stroke-width:1")
            .attr("transform", "translate(" + rockPosition.x + " " + rockPosition.y + ") rotate(" + angle + ")");
        return { rockPosition, rock, angle };
    });
    const moveRocks = createRocks.map(({ rockPosition, rock, angle }) => Observable.interval(100)
        .subscribe(() => {
        const newX = rockPosition.x + 2 * Math.sin(degToRad(angle)), newY = rockPosition.y - 2 * Math.cos(degToRad(angle)), x = newX < -50 ? svg.clientWidth + 50 : newX > (svg.clientWidth + 50) ? -50 : newX, y = newY < -50 ? svg.clientHeight + 50 : newY > (svg.clientHeight + 50) ? -50 : newY;
        rockPosition.x = x;
        rockPosition.y = y;
        rock.attr("transform", "translate(" + x + " " + y + ") rotate(" + angle + ")");
    }))
        .subscribe(() => { });
}
function getRotationDegrees(obj) {
    var matrix = obj.css("-webkit-transform") ||
        obj.css("-moz-transform") ||
        obj.css("-ms-transform") ||
        obj.css("-o-transform") ||
        obj.css("transform");
    if (matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = Number(values[0]);
        var b = Number(values[1]);
        var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    }
    else {
        var angle = 0;
    }
    return (angle < 0) ? angle + 360 : angle;
}
function getRandomRockPosition() {
    let y = getRandomInt(1, 599), x;
    if (y > 150 && y < 450) {
        if (getRandomInt(0, 1)) {
            x = getRandomInt(1, 150);
        }
        else {
            x = getRandomInt(450, 599);
        }
    }
    else {
        x = getRandomInt(1, 599);
    }
    return { x, y };
}
function getAttributeValues(e, attribute) {
    return e.attr(attribute).match(/\d+/g);
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map