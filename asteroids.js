"use strict";
const radToDeg = (rad) => rad * 180 / Math.PI;
const degToRad = (deg) => deg * Math.PI / 180;
const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const distanceBetweenPoints = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
const distanceEllipse = (x, y, ellipse) => (Math.pow(x - parseInt(ellipse.attr("cx")), 2) / Math.pow(parseInt(ellipse.attr("rx")), 2)) +
    (Math.pow(y - parseInt(ellipse.attr("cy")), 2) / Math.pow(parseInt(ellipse.attr("ry")), 2));
const getMovement = (x, y, value, angle) => ({ x: x + value * Math.sin(degToRad(angle)), y: y - value * Math.cos(degToRad(angle)) });
const getWrapValue = (x, y, offset, svg) => ({ x: x < -offset ? svg.clientWidth + offset : x > svg.clientWidth + offset ? -offset : x,
    y: y < -offset ? svg.clientHeight + offset : y > svg.clientHeight + offset ? -offset : y });
const getRandomPosition = () => {
    const y = getRandomInt(1, 599), x = (y > 150 && y < 450) ? getRandomInt(0, 1) == 1 ? getRandomInt(1, 150) : getRandomInt(450, 599) : getRandomInt(1, 599);
    return { x, y };
};
function getRotationDegrees(obj) {
    const matrix = obj.css("-webkit-transform") ||
        obj.css("-moz-transform") ||
        obj.css("-ms-transform") ||
        obj.css("-o-transform") ||
        obj.css("transform");
    const values = matrix.split('(')[1].split(')')[0].split(','), a = Number(values[0]), b = Number(values[1]);
    const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    return angle;
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
const controller = () => {
    let speed = 0, multipler = 1;
    return {
        accelerate: () => {
            speed = speed < 40 ? parseFloat((speed + multipler).toFixed(1)) : speed;
            multipler = speed < 40 ? parseFloat((multipler + 0.2).toFixed(1)) : multipler;
        },
        deccelerate: () => {
            speed = speed > 0 ? parseFloat((speed - multipler).toFixed(1)) : 0;
            multipler = speed > 0.2 ? parseFloat((multipler - 0.2).toFixed(1)) : 1;
        },
        getSpeed: () => speed,
    };
};
function asteroids() {
    let asteriodsBelt = [];
    const resetGame = () => {
        $("#asteriods").empty();
        asteriodsBelt.length = 0;
        g.attr("transform", "translate(300 300) rotate(0)");
    }, svg = document.getElementById("canvas"), g = new Elem(svg, 'g')
        .attr("transform", "translate(300, 300) rotate(0)")
        .attr("id", "rocket"), rocket = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:black; stroke:white; stroke-width:1"), asteriodsGroup = new Elem(svg, "g")
        .attr("id", "asteriods"), boss = new Elem(svg, "ellipse")
        .attr("cx", 300).attr("cy", 40)
        .attr("rx", 80).attr("ry", 40)
        .attr("fill", "gray").attr("visibility", "hidden")
        .attr("id", "boss").attr("health", 10), endGame = Observable.interval(10)
        .filter(() => document.getElementById("lives").innerText == "0")
        .map(() => {
        document.getElementById("gameover").setAttribute("visibility", "visible");
        $("#rocket").remove();
        $("#boss").remove();
    }), gameController = Observable.interval(100).takeUntil(endGame), keyDown = Observable.fromEvent(document, "keydown").takeUntil(endGame), keyUp = Observable.fromEvent(document, "keyup").takeUntil(endGame), ship = keyDown.map(key => ({
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
        angle: getRotationDegrees($('#canvas #rocket')),
        key: key
    })), movementController = Observable.interval(50)
        .takeUntil(endGame)
        .map(() => ({
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
        angle: getRotationDegrees($("#canvas #rocket"))
    })), constructBullets = ship.filter(({ key }) => key.keyCode == 32)
        .map(({ x, y, angle }) => {
        const coordinate = getMovement(x, y, 20, angle), bullet = new Elem(svg, "circle")
            .attr("cx", coordinate.x)
            .attr("cy", coordinate.y)
            .attr("r", 2)
            .attr("fill", "salmon")
            .attr("collided", 0);
        return { bullet, angle };
    }), constructAsteroids = Observable.interval(3000)
        .takeUntil(endGame)
        .subscribe(() => {
        const asteriodPosition = getRandomPosition(), asteriod = new Elem(svg, "circle", asteriodsGroup.elem)
            .attr("cx", asteriodPosition.x)
            .attr("cy", asteriodPosition.y)
            .attr("r", 40)
            .attr("fill", "black")
            .attr("stroke", "orange");
        asteriodsBelt.push([asteriod, getRandomInt(0, 359)]);
    }), speedController = controller();
    ship.filter(({ key }) => key.keyCode == 37)
        .subscribe(({ x, y, angle }) => { g.attr("transform", "translate(" + x + " " + y + ") rotate(" + ((angle - 10) % 360) + ")"); });
    ship.filter(({ key }) => key.keyCode == 39)
        .subscribe(({ x, y, angle }) => { g.attr("transform", "translate(" + x + " " + y + ") rotate(" + ((angle + 10) % 360) + ")"); });
    ship.filter(({ key }) => key.keyCode == 38)
        .subscribe(() => speedController.accelerate());
    ship.filter(({ key }) => key.keyCode == 40)
        .subscribe(() => speedController.deccelerate());
    movementController.subscribe(({ x, y, angle }) => {
        const movement = getMovement(x, y, speedController.getSpeed(), angle), coordinate = getWrapValue(movement.x, movement.y, 0, svg);
        g.attr("transform", "translate(" + coordinate.x + " " + coordinate.y + ") rotate(" + angle + ")");
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
    gameController.map(() => ({
        score: parseInt(document.getElementById("score").innerText),
        level: parseInt(document.getElementById("level").innerText)
    }))
        .filter(({ score, level }) => score >= level * 1000)
        .subscribe(({ level }) => document.getElementById("level").innerText = String(level + 1));
    gameController.flatMap(() => Observable.fromArray(asteriodsBelt))
        .subscribe(asteriodData => {
        const asteriod = asteriodData[0], angle = asteriodData[1], radius = parseInt(asteriod.attr("r")), level = parseInt(document.getElementById("level").innerText), point = getMovement(parseInt(asteriod.attr("cx")), parseInt(asteriod.attr("cy")), 2 * level, angle), coordinate = getWrapValue(point.x, point.y, radius, svg);
        asteriod.attr("cx", coordinate.x).attr("cy", coordinate.y);
    });
    gameController.flatMap(() => Observable.fromArray(asteriodsBelt))
        .filter(asteriodData => {
        const asteriodX = parseInt(asteriodData[0].attr("cx")), asteriodY = parseInt(asteriodData[0].attr("cy")), radius = parseInt(asteriodData[0].attr("r")), x = transformMatrix(g).m41, y = transformMatrix(g).m42;
        return distanceBetweenPoints(x, y, asteriodX, asteriodY) <= radius;
    })
        .subscribe(() => {
        const lives = parseInt(document.getElementById("lives").innerText);
        document.getElementById("lives").innerText = String(lives - 1);
        resetGame();
    });
    gameController.filter(() => parseInt(document.getElementById("level").innerText) >= 3)
        .map(() => {
        boss.attr("visibility", "visible");
        $("#bossHP").removeAttr("hidden");
    })
        .filter(() => document.getElementById("boss") != null)
        .subscribe(() => {
        const bossX = parseInt(boss.attr("cx")), bossY = parseInt(boss.attr("cy")), x = transformMatrix(g).m41, y = transformMatrix(g).m42, angle = (450 + radToDeg(Math.atan2(y - bossY, x - bossX))) % 360, point = getMovement(bossX, bossY, 2, angle);
        boss.attr("cx", point.x).attr("cy", point.y);
    });
    gameController.filter(() => boss.attr("visibility") == "visible")
        .filter(() => distanceEllipse(transformMatrix(g).m41, transformMatrix(g).m42, boss) <= 1)
        .subscribe(() => {
        const lives = parseInt(document.getElementById("lives").innerText);
        document.getElementById("lives").innerText = String(lives - 1);
        boss.attr("cx", 300).attr("cy", 40);
        resetGame();
    });
    gameController.filter(() => document.contains(boss.elem))
        .filter(() => parseInt(boss.attr("health")) == 0)
        .subscribe(() => {
        svg.removeChild(boss.elem);
        $("#destroyed").removeAttr("hidden");
    });
    ship.filter(({ key }) => key.keyCode == 66)
        .map(({ x, y }) => {
        const bomb = new Elem(svg, "circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 10)
            .attr("id", "bomb")
            .attr("fill", "lime");
        return { bomb };
    })
        .flatMap(({ bomb }) => Observable.interval(100)
        .takeUntil(Observable.interval(10000)
        .filter(() => document.contains(bomb.elem))
        .map(() => svg.removeChild(bomb.elem)))
        .map(() => ({ bomb })))
        .filter(({ bomb }) => document.contains(bomb.elem))
        .filter(({ bomb }) => distanceEllipse(parseInt(bomb.attr("cx")), parseInt(bomb.attr("cy")), boss) <= 1)
        .subscribe(({ bomb }) => {
        const hp = parseInt(boss.attr("health"));
        boss.attr("health", hp > 1 ? hp - 1 : 0);
        document.getElementById("hp").innerText = boss.attr("health");
        document.contains(bomb.elem) ? svg.removeChild(bomb.elem) : null;
    });
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map