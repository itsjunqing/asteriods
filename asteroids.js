"use strict";
const radToDeg = (rad) => rad * 180 / Math.PI;
const degToRad = (deg) => deg * Math.PI / 180;
const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
const transform = (e) => new WebKitCSSMatrix(window.getComputedStyle(e).webkitTransform);
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
    const ship = Observable.fromEvent(document, "keydown")
        .map(key => ({
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
        angle: getRotationDegrees($('#canvas #ship')),
        key: key
    }));
    ship.filter(({ key }) => key.code == "ArrowLeft")
        .subscribe(({ x, y, angle }) => { g.attr("transform", "translate(" + x + " " + y + ") rotate(" + ((angle - 10) % 360) + ")"); });
    ship.filter(({ key }) => key.code == "ArrowRight")
        .subscribe(({ x, y, angle }) => { g.attr("transform", "translate(" + x + " " + y + ") rotate(" + ((angle + 10) % 360) + ")"); });
    let rocksArray;
    let speed = 5, multipler = 0;
    const stopArrowUp = Observable.fromEvent(document, "keyup")
        .filter(({ code }) => code == "ArrowUp")
        .subscribe(() => {
        multipler = 0;
        speed = 5;
    });
    const accelerateShip = ship.filter(({ key }) => key.code == "ArrowUp")
        .map(({ x, y, angle }) => {
        const xChange = speed * Math.sin(degToRad(angle)), yChange = speed * Math.cos(degToRad(angle)), newX = (x + xChange) < 0 ? svg.clientWidth : (x + xChange) > svg.clientWidth ? 0 : x + xChange, newY = (y - yChange) < 0 ? svg.clientHeight : (y - yChange) > svg.clientHeight ? 0 : y - yChange;
        if (speed < 300) {
            speed += multipler;
            multipler += 0.1;
        }
        return { newX, newY, angle };
    })
        .subscribe(({ newX, newY, angle }) => { g.attr("transform", "translate(" + newX + " " + newY + ") rotate(" + angle + ")"); });
    const deleteBullets = Observable.interval(1000)
        .map(() => {
        let bullets = svg.getElementsByTagName("circle");
        if (bullets.length > 0) {
            svg.removeChild(bullets[0]);
        }
    });
    const bullets = ship.filter(({ key }) => key.code == "Space")
        .map(({ x, y, angle }) => {
        const bulletX = x + (20 * Math.sin(degToRad(angle))), bulletY = y - (20 * Math.cos(degToRad(angle))), bullet = new Elem(svg, "circle")
            .attr("cx", bulletX)
            .attr("cy", bulletY)
            .attr("r", 2)
            .attr("fill", "salmon");
        return { bulletX, bulletY, bullet, angle };
    })
        .flatMap(({ bulletX, bulletY, bullet, angle }) => Observable.interval(10)
        .takeUntil(deleteBullets)
        .map(() => {
        const newX = bulletX + 5 * Math.sin(degToRad(angle)), newY = bulletY - 5 * Math.cos(degToRad(angle));
        bulletX = newX;
        bulletY = newY;
        bullet.attr("cx", newX).attr("cy", newY);
        return { bulletX, bulletY, bullet, angle };
    }));
    const rocks = Observable.interval(500)
        .takeUntil(Observable.interval(1200))
        .map(() => {
        const rockPosition = getRandomRockPosition(), size = 50, angle = getRandomInt(0, 359), xChange = size * Math.sin(degToRad(30)), yChange = size * Math.cos(degToRad(30)), newPoints = `${-xChange},${-yChange} ${xChange},${-yChange} ${size},${0} ${xChange},${yChange} ${-xChange},${yChange} ${-size},${0}`;
        const rock = new Elem(svg, "polygon")
            .attr("points", newPoints)
            .attr("style", "fill:black; stroke:cyan; stroke-width:1")
            .attr("transform", "translate(" + rockPosition.x + " " + rockPosition.y + ") rotate(" + angle + ")");
        rocksArray.push(rock);
        return rocksArray;
    })
        .map(e => {
    });
    rocks.subscribe(() => { });
    const asteroy = Observable.interval(500).map(() => rocksArray);
}
function destroyBullet(svg) {
    let bullets = svg.getElementsByTagName("circle");
    if (bullets.length > 0) {
        svg.removeChild(bullets[0]);
    }
}
function getRotationDegrees(obj) {
    let matrix = obj.css("-webkit-transform") ||
        obj.css("-moz-transform") ||
        obj.css("-ms-transform") ||
        obj.css("-o-transform") ||
        obj.css("transform");
    const values = matrix.split('(')[1].split(')')[0].split(','), a = Number(values[0]), b = Number(values[1]);
    let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    return angle;
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