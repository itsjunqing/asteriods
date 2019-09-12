"use strict";
const radToDeg = (rad) => rad * 180 / Math.PI;
const degToRad = (deg) => deg * Math.PI / 180;
const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
const distanceBetweenPoints = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const getMovement = (x, y, value, angle) => ({ x: x + value * Math.sin(degToRad(angle)), y: y - value * Math.cos(degToRad(angle)) });
const getWrapValue = (x, y, offset, svg) => ({ x: x < -offset ? svg.clientWidth + offset : x > svg.clientWidth + offset ? -offset : x,
    y: y < -offset ? svg.clientHeight + offset : y > svg.clientHeight + offset ? -offset : y });
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
const collisionDetection = (bullet, asteriodsBelt, asteriodsGroup, svg) => {
    asteriodsBelt
        .filter(asteriodData => {
        const bulletX = parseInt(bullet.attr("cx")), bulletY = parseInt(bullet.attr("cy")), asteriodX = parseInt(asteriodData[0].attr("cx")), asteriodY = parseInt(asteriodData[0].attr("cy")), asteriodRadius = parseInt(asteriodData[0].attr("r"));
        return distanceBetweenPoints(bulletX, bulletY, asteriodX, asteriodY) < asteriodRadius;
    })
        .map(asteriodData => {
        const asteriod = asteriodData[0], radius = parseInt(asteriod.attr("r")), score = parseInt(document.getElementById("score").innerText), level = parseInt(document.getElementById("level").innerText);
        bullet.attr("collided", 1);
        asteriodsGroup.elem.removeChild(asteriod.elem);
        asteriodsBelt.splice(asteriodsBelt.indexOf(asteriodData), 1);
        document.getElementById("score").innerText = String(score + radius);
        document.getElementById("level").innerText = (score + radius) >= (level * 2000) ? String(level + 1) : String(level);
        return asteriodData;
    })
        .filter(asteriodData => parseInt(asteriodData[0].attr("r")) > 20)
        .map(asteriodData => {
        const asteriod = asteriodData[0], x = parseInt(asteriod.attr("cx")), y = parseInt(asteriod.attr("cy")), radius = parseInt(asteriod.attr("r")), newSize = radius / 2, a = new Elem(svg, "circle", asteriodsGroup.elem)
            .attr("cx", x + 10 + (newSize * Math.sin(degToRad(60))))
            .attr("cy", y + 10 + (newSize * Math.cos(degToRad(60))))
            .attr("r", newSize)
            .attr("fill", "black").attr("stroke", "yellow"), b = new Elem(svg, "circle", asteriodsGroup.elem)
            .attr("cx", x - 10 - (newSize * Math.sin(degToRad(60))))
            .attr("cy", y + 10 + (newSize * Math.cos(degToRad(60))))
            .attr("r", newSize)
            .attr("fill", "black").attr("stroke", "yellow"), c = new Elem(svg, "circle", asteriodsGroup.elem)
            .attr("cx", x)
            .attr("cy", y - 10 - newSize)
            .attr("r", newSize)
            .attr("fill", "black")
            .attr("stroke", "yellow");
        asteriodsBelt.push([a, getRandomInt(0, 359)]);
        asteriodsBelt.push([b, getRandomInt(0, 359)]);
        asteriodsBelt.push([c, getRandomInt(0, 359)]);
    });
};
function asteroids() {
    let asteriodsBelt = [];
    const resetGame = () => {
        $(asteriodsGroup.elem).empty();
        asteriodsBelt.length = 0;
        g.attr("transform", "translate(300 300) rotate(0)");
    }, svg = document.getElementById("canvas"), g = new Elem(svg, 'g')
        .attr("transform", "translate(300, 300) rotate(0)")
        .attr("id", "rocket"), rocket = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:black; stroke:white; stroke-width:1"), asteriodsGroup = new Elem(svg, "g"), endGame = Observable.interval(10).filter(() => document.getElementById("gameover").getAttribute("visibility") == "visible"), keyDown = Observable.fromEvent(document, "keydown").takeUntil(endGame), keyUp = Observable.fromEvent(document, "keyup").takeUntil(endGame), ship = keyDown.map(key => ({
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
        angle: getRotationDegrees($('#canvas #ship')),
        key: key
    }));
    ship.filter(({ key }) => key.code == "ArrowLeft")
        .subscribe(({ x, y, angle }) => { g.attr("transform", "translate(" + x + " " + y + ") rotate(" + ((angle - 10) % 360) + ")"); });
    ship.filter(({ key }) => key.code == "ArrowRight")
        .subscribe(({ x, y, angle }) => { g.attr("transform", "translate(" + x + " " + y + ") rotate(" + ((angle + 10) % 360) + ")"); });
    const speedController = () => {
        let speed = 0, multipler = 0.2;
        return {
            accelerate: () => {
                speed = speed < 8 ? parseFloat((speed + multipler).toFixed(1)) : speed;
                multipler = speed < 8 ? parseFloat((multipler + 0.2).toFixed(1)) : multipler;
            },
            deccelerate: () => {
                speed = speed > 0 ? parseFloat((speed - 0.1).toFixed(1)) : 0;
                multipler = speed > 0 ? multipler - 0.001 : multipler;
            },
            getSpeed: () => speed,
            reset: () => {
                speed = 5;
            }
        };
    };
    let shipController = speedController();
    let afdsa = Observable.interval(10)
        .map(() => {
        const x = transformMatrix(g).m41, y = transformMatrix(g).m42, angle = getRotationDegrees($('#canvas #ship'));
        return { x, y, angle };
    })
        .subscribe(({ x, y, angle }) => {
        shipController.deccelerate();
        console.log(shipController.getSpeed());
        const movement = getMovement(x, y, shipController.getSpeed(), angle), coordinate = getWrapValue(movement.x, movement.y, 0, svg);
        g.attr("transform", "translate(" + coordinate.x + " " + coordinate.y + ") rotate(" + angle + ")");
    });
    ship.filter(({ key }) => key.code == "ArrowUp")
        .subscribe(() => shipController.accelerate());
    const constructBullets = ship.filter(({ key }) => key.code == "Space")
        .map(({ x, y, angle }) => {
        const coordinate = getMovement(x, y, 20, angle), bullet = new Elem(svg, "circle")
            .attr("cx", coordinate.x)
            .attr("cy", coordinate.y)
            .attr("r", 2)
            .attr("fill", "salmon")
            .attr("collided", 0);
        return { bullet, angle };
    });
    constructBullets.flatMap(({ bullet, angle }) => Observable.interval(10)
        .takeUntil(Observable.interval(1000)
        .filter(() => parseInt(bullet.attr("collided")) == 0)
        .map(() => svg.removeChild(bullet.elem)))
        .map(() => ({ bullet, angle })))
        .filter(({ bullet }) => parseInt(bullet.attr("collided")) == 0)
        .subscribe(({ bullet, angle }) => {
        const coordinate = getMovement(parseInt(bullet.attr("cx")), parseInt(bullet.attr("cy")), 5, angle);
        bullet.attr("cx", coordinate.x).attr("cy", coordinate.y);
        collisionDetection(bullet, asteriodsBelt, asteriodsGroup, svg);
        parseInt(bullet.attr("collided")) == 1 ? svg.removeChild(bullet.elem) : null;
    });
    Observable.interval(10)
        .takeUntil(endGame)
        .subscribe(() => {
        const asteriodPosition = getRandomRockPosition(), asteriod = new Elem(svg, "circle", asteriodsGroup.elem)
            .attr("cx", asteriodPosition.x)
            .attr("cy", asteriodPosition.y)
            .attr("r", 40)
            .attr("fill", "black")
            .attr("stroke", "orange");
        asteriodsBelt.push([asteriod, getRandomInt(0, 359)]);
    });
    Observable.interval(100)
        .takeUntil(endGame)
        .flatMap(() => Observable.fromArray(asteriodsBelt))
        .forEach(asteriodData => {
        const asteriod = asteriodData[0], angle = asteriodData[1], radius = parseInt(asteriod.attr("r")), level = parseInt(document.getElementById("level").innerText), point = getMovement(parseInt(asteriod.attr("cx")), parseInt(asteriod.attr("cy")), 1 * level, angle), coordinate = getWrapValue(point.x, point.y, radius, svg);
        asteriod.attr("cx", coordinate.x).attr("cy", coordinate.y);
    })
        .filter(asteriodData => {
        const asteriodX = parseInt(asteriodData[0].attr("cx")), asteriodY = parseInt(asteriodData[0].attr("cy")), radius = parseInt(asteriodData[0].attr("r")), x = transformMatrix(g).m41, y = transformMatrix(g).m42;
        return distanceBetweenPoints(x, y, asteriodX, asteriodY) < radius;
    })
        .subscribe(() => {
        const lives = Number(document.getElementById("lives").innerText);
        document.getElementById("lives").innerText = lives > 0 ? String(lives - 1) : String(0);
        resetGame();
        if (lives == 0) {
            document.getElementById("gameover").setAttribute("visibility", "visible");
            svg.removeChild(g.elem);
        }
    });
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map