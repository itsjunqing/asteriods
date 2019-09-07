// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing
var radToDeg = function (rad) { return rad * 180 / Math.PI; };
var degToRad = function (deg) { return deg * Math.PI / 180; };
function asteroids() {
    // Inside this function you will use the classes and functions 
    // defined in svgelement.ts and observable.ts
    // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
    // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.
    // You will be marked on your functional programming style
    // as well as the functionality that you implement.
    // Document your code!  
    // Explain which ideas you have used ideas from the lectures to 
    // create reusable, generic functions.
    var svg = document.getElementById("canvas");
    // make a group for the spaceship and a transform to move it and rotate it
    // to animate the spaceship you will update the transform property
    var x = svg.clientWidth / 2;
    var y = svg.clientHeight / 2;
    var angle = 45;
    var g = new Elem(svg, 'g')
        // translate is to move element to x = 300 and y = 300
        // rotate 170 degrees clockwise
        // .attr("transform","translate("+x+" "+y+") rotate("+angle+")")  
        .attr("transform", "translate(300, 300) rotate(45)");
    // create a polygon shape for the space ship as a child of the transform group
    var rect = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:black; stroke:white; stroke-width:1");
    var transformMatrix = function (e) { return new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform); };
    // FOR SHIP MOVING
    var SHIP_BORDERS = 5;
    var speed = 5, multipler = 0;
    var stopArrowUp = Observable.fromEvent(document, "keyup")
        .filter(function (_a) {
        var code = _a.code;
        return code == "ArrowUp";
    })
        .subscribe(function () {
        multipler = 0;
        speed = 5;
    });
    var accelerateShip = Observable.fromEvent(document, "keydown")
        .filter(function (_a) {
        var code = _a.code;
        return code == "ArrowUp";
    })
        .map(function () {
        var xChange = speed * Math.sin(angle * Math.PI / 180), yChange = speed * Math.cos(angle * Math.PI / 180);
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
        return { x: x, y: y, multipler: multipler };
    })
        .subscribe(function (_a) {
        var x = _a.x, y = _a.y, multipler = _a.multipler;
        g.attr("transform", "translate(" + x + " " + y + ") rotate(" + angle + ")");
    });
    var rotateShip = Observable.fromEvent(document, "keydown")
        .filter(function (_a) {
        var code = _a.code;
        return code == "ArrowRight" || code == "ArrowLeft";
    })
        .map(function (_a) {
        var code = _a.code;
        if (code == "ArrowRight") {
            angle = (angle + 10) % 360;
        }
        else if (code == "ArrowLeft") {
            angle = (angle - 10) % 360;
        }
        return { angle: angle };
    })
        .subscribe(function (_a) {
        var angle = _a.angle;
        g.attr("transform", "translate(" + x + " " + y + ") rotate(" + angle + ")");
    });
    var stopBullets = Observable.interval(1000)
        .map(function () {
        var bullets = svg.getElementsByTagName("circle");
        if (bullets.length > 0) {
            svg.removeChild(bullets[0]);
        }
        console.log("stop bullets is running");
    });
    var createBullet = Observable.fromEvent(document, "keydown")
        .filter(function (_a) {
        var code = _a.code;
        return code == "Space";
    })
        .map(function () {
        var bulletX = x + (20 * Math.sin(degToRad(angle))), bulletY = y - (20 * Math.cos(degToRad(angle))), bullet = new Elem(svg, "circle")
            .attr("cx", bulletX)
            .attr("cy", bulletY)
            .attr("r", 2)
            .attr("fill", "salmon");
        return { bulletX: bulletX, bulletY: bulletY, bullet: bullet };
    })
        .map(function (_a) {
        var bulletX = _a.bulletX, bulletY = _a.bulletY, bullet = _a.bullet;
        return Observable.interval(10)
            .takeUntil(stopBullets)
            .subscribe(function () {
            var newX = bulletX + 5 * Math.sin(degToRad(angle)), newY = bulletY - 5 * Math.cos(degToRad(angle));
            bulletX = newX;
            bulletY = newY;
            bullet.attr("cx", newX).attr("cy", newY);
        });
    })
        .subscribe(function () { });
    var createRocks = Observable.interval(500) // generate every 0.5 seconds
        .takeUntil(Observable.interval(2001)) // generate for 5 seconds
        .map(function () {
        var rockPosition = getRandomRockPosition(), size = 50, angle = getRandomInt(0, 359), xChange = size * Math.sin(degToRad(30)), yChange = size * Math.cos(degToRad(30)), newPoints = -xChange + "," + -yChange + " " + xChange + "," + -yChange + " " + size + "," + 0 + " " + xChange + "," + yChange + " " + -xChange + "," + yChange + " " + -size + "," + 0;
        var rock = new Elem(svg, "polygon")
            .attr("points", newPoints)
            .attr("style", "fill:black; stroke:cyan; stroke-width:1")
            .attr("transform", "translate(" + rockPosition.x + " " + rockPosition.y + ") rotate(" + angle + ")");
        return { rockPosition: rockPosition, rock: rock, angle: angle };
    })
        .map(function (_a) {
        var rockPosition = _a.rockPosition, rock = _a.rock, angle = _a.angle;
        return Observable.interval(100)
            // .takeUntil(Observable.interval(5000))
            .subscribe(function () {
            // const newX = Number(getAttributeValues(rock, "transform")[0]) + 1 * Math.sin(degToRad(angle)),
            //       newY = Number(getAttributeValues(rock, "transform")[1]) - 1 * Math.cos(degToRad(angle))
            var newX = rockPosition.x + 1 * Math.sin(degToRad(angle)), newY = rockPosition.y - 1 * Math.cos(degToRad(angle));
            rockPosition.x = newX;
            rockPosition.y = newY;
            rock.attr("transform", "translate(" + newX + " " + newY + ") rotate(" + angle + ")");
        });
    })
        .subscribe(function () { });
}
function getRandomRockPosition() {
    var y = getRandomInt(1, 599), x;
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
    return { x: x, y: y };
}
function getAttributeValues(e, attribute) {
    return e.attr(attribute).match(/\d+/g);
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
    window.onload = function () {
        asteroids();
    };
