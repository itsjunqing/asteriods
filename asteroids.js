"use strict";
const radToDeg = (rad) => rad * 180 / Math.PI;
const degToRad = (deg) => deg * Math.PI / 180;
const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
const distanceBetweenPoints = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const getMovement = (x, y, value, angle) => ({ x: x + value * Math.sin(degToRad(angle)), y: y - value * Math.cos(degToRad(angle)) });
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
function asteroids() {
    let score = 0, level = 1, rocksArray = [];
    const svg = document.getElementById("canvas"), g = new Elem(svg, 'g')
        .attr("transform", "translate(300, 300) rotate(0)")
        .attr("id", "ship"), rocket = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:black; stroke:white; stroke-width:1"), keyDown = Observable.fromEvent(document, "keydown"), keyUp = Observable.fromEvent(document, "keyup"), ship = keyDown.map(key => ({
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
        angle: getRotationDegrees($('#canvas #ship')),
        key: key
    }));
    const collisionDetection = (bullet, rocksArray) => {
        let k = rocksArray
            .filter(rockInfo => distanceBetweenPoints(Number(bullet.attr("cx")), Number(bullet.attr("cy")), Number(rockInfo[0].attr("cx")), Number(rockInfo[0].attr("cy"))) < Number(rockInfo[0].attr("r")))
            .map(rockInfo => {
            const rock = rockInfo[0], radius = Number(rock.attr("r"));
            score += radius;
            bullet.attr("collided", 1);
            svg.removeChild(rock.elem);
            rocksArray.splice(rocksArray.indexOf(rockInfo), 1);
            document.getElementById("score").innerHTML = String(score);
            return rockInfo;
        })
            .filter(rockInfo => Number(rockInfo[0].attr("r")) > 20)
            .map(rockInfo => {
            const rock = rockInfo[0], x = Number(rock.attr("cx")), y = Number(rock.attr("cy")), radius = Number(rock.attr("r")), newSize = radius / 2;
            let a = new Elem(svg, "circle")
                .attr("cx", x + 10 + (newSize * Math.sin(degToRad(60)))).attr("cy", y + 10 + (newSize * Math.cos(degToRad(60)))).attr("r", newSize)
                .attr("fill", "black").attr("stroke", "yellow");
            let b = new Elem(svg, "circle")
                .attr("cx", x - 10 - (newSize * Math.sin(degToRad(60)))).attr("cy", y + 10 + (newSize * Math.cos(degToRad(60)))).attr("r", newSize)
                .attr("fill", "black").attr("stroke", "yellow");
            let c = new Elem(svg, "circle")
                .attr("cx", x).attr("cy", y - 10 - newSize).attr("r", newSize)
                .attr("fill", "black").attr("stroke", "yellow");
            rocksArray.push([a, getRandomInt(0, 359)]);
            rocksArray.push([b, getRandomInt(0, 359)]);
            rocksArray.push([c, getRandomInt(0, 359)]);
        });
    };
    const getWrapValue = (x, y, offset) => ({ x: x < -offset ? svg.clientWidth + offset : x > svg.clientWidth + offset ? -offset : x,
        y: y < -offset ? svg.clientHeight + offset : y > svg.clientHeight + offset ? -offset : y });
    ship.filter(({ key }) => key.code == "ArrowLeft")
        .subscribe(({ x, y, angle }) => { g.attr("transform", "translate(" + x + " " + y + ") rotate(" + ((angle - 10) % 360) + ")"); });
    ship.filter(({ key }) => key.code == "ArrowRight")
        .subscribe(({ x, y, angle }) => { g.attr("transform", "translate(" + x + " " + y + ") rotate(" + ((angle + 10) % 360) + ")"); });
    const speedController = () => {
        let speed = 5, multiplier = 0;
        return {
            accelerate: () => {
                speed = speed < 200 ? speed + multiplier : speed;
                multiplier += 0.1;
            },
            decelerate: () => {
                Observable.interval(10)
                    .takeUntil(Observable.interval(5000))
                    .subscribe(() => {
                    speed -= multiplier;
                    multiplier -= 0.1;
                });
            },
            getSpeed: () => speed,
            reset: () => {
                speed = 5;
                multiplier = 0;
            }
        };
    };
    let shipController = speedController();
    const stopArrowUp = Observable.fromEvent(document, "keyup")
        .filter(({ code }) => code == "ArrowUp")
        .subscribe(() => {
        shipController.reset();
    });
    ship.filter(({ key }) => key.code == "ArrowUp")
        .map(({ x, y, angle }) => {
        const xChange = shipController.getSpeed() * Math.sin(degToRad(angle)), yChange = shipController.getSpeed() * Math.cos(degToRad(angle)), newX = (x + xChange) < 0 ? svg.clientWidth : (x + xChange) > svg.clientWidth ? 0 : x + xChange, newY = (y - yChange) < 0 ? svg.clientHeight : (y - yChange) > svg.clientHeight ? 0 : y - yChange;
        shipController.accelerate();
        return { newX, newY, angle };
    })
        .subscribe(({ newX, newY, angle }) => { g.attr("transform", "translate(" + newX + " " + newY + ") rotate(" + angle + ")"); }, () => { });
    const constructBullets = ship.filter(({ key }) => key.code == "Space")
        .map(({ x, y, angle }) => {
        const coordinate = getMovement(x, y, 20, angle), bullet = new Elem(svg, "circle").attr("cx", coordinate.x).attr("cy", coordinate.y).attr("r", 2).attr("fill", "salmon").attr("collided", 0);
        return { bullet, angle };
    });
    constructBullets.flatMap(({ bullet, angle }) => Observable.interval(10)
        .takeUntil(Observable.interval(1000)
        .filter(() => Number(bullet.attr("collided")) == 0)
        .map(() => svg.removeChild(bullet.elem)))
        .map(() => ({ bullet, angle })))
        .filter(({ bullet }) => Number(bullet.attr("collided")) == 0)
        .subscribe(({ bullet, angle }) => {
        const coordinate = getMovement(Number(bullet.attr("cx")), Number(bullet.attr("cy")), 5, angle);
        bullet.attr("cx", coordinate.x).attr("cy", coordinate.y);
        collisionDetection(bullet, rocksArray);
        Number(bullet.attr("collided")) == 1 ? svg.removeChild(bullet.elem) : null;
    });
    Observable.interval(500)
        .takeUntil(Observable.interval(5000))
        .subscribe(() => {
        const rockPosition = getRandomRockPosition(), rock = new Elem(svg, "circle").attr("cx", rockPosition.x).attr("cy", rockPosition.y).attr("r", 40).attr("fill", "black").attr("stroke", "orange");
        rocksArray.push([rock, getRandomInt(0, 359)]);
    });
    const rocksMovement = Observable.interval(100)
        .takeUntil(Observable.interval(1000000000))
        .flatMap(() => Observable.fromArray(rocksArray))
        .forEach(rockInfo => {
        const rock = rockInfo[0], angle = rockInfo[1], radius = Number(rock.attr("r")), point = getMovement(Number(rock.attr("cx")), Number(rock.attr("cy")), 2, angle), coordinate = getWrapValue(point.x, point.y, radius);
        rock.attr("cx", coordinate.x).attr("cy", coordinate.y);
    });
    rocksMovement.filter(rockInfo => {
        const rockX = Number(rockInfo[0].attr("cx")), rockY = Number(rockInfo[0].attr("cy")), radius = Number(rockInfo[0].attr("r")), x = transformMatrix(g).m41, y = transformMatrix(g).m42;
        return distanceBetweenPoints(x, y, rockX, rockY) < radius;
    });
    rocksMovement.subscribe(() => { });
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map