// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing
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
    var angle = 90;
    var g = new Elem(svg, 'g')
        // translate is to move element to x = 300 and y = 300
        // rotate 170 degrees clockwise
        .attr("transform", "translate(" + x + " " + y + ") rotate(" + angle + ")");
    // create a polygon shape for the space ship as a child of the transform group
    var rect = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:black; stroke:white; stroke-width:1");
    var transformMatrix = function (e) { return new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform); };
    var radToDeg = function (rad) { return rad * 180 / Math.PI; };
    var degToRad = function (deg) { return deg * Math.PI / 180; };
    console.log(g.elem.getBoundingClientRect());
    console.log(rect.elem.getBoundingClientRect());
    console.log(rect.elem.clientHeight);
    console.log(rect.elem.clientWidth);
    var kk = g.elem.getBoundingClientRect();
    console.log(kk.top);
    console.log(kk.left);
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
            .takeUntil(Observable.interval(2000)
            .map(function () {
            var circles = svg.getElementsByTagName("circle");
            // svg.removeChild(circles[0]);
            circles[0].parentNode.removeChild(circles[0]);
        }))
            .subscribe(function () {
            var newX = bulletX + 5 * Math.sin(degToRad(angle)), newY = bulletY - 5 * Math.cos(degToRad(angle));
            bulletX = newX;
            bulletY = newY;
            bullet.attr("cx", newX).attr("cy", newY);
        });
    })
        .subscribe(function () { });
    // .flatMap(({bulletX, bulletY, bullet}) => Observable.interval(10)
    //                                                    .takeUntil(Observable.interval(2000)
    //                                                    .(() => {
    //                                                      const newX = bulletX + 5 * Math.sin(degToRad(angle)),
    //                                                           newY = bulletY - 5 * Math.cos(degToRad(angle))
    //                                                           bulletX = newX;
    //                                                           bulletY = newY;
    //                                                           bullet.attr("cx", newX).attr("cy", newY);
    //                                                    }))
    //               )
    // .subscribe()
    // .subscribe(({bulletX, bulletY, bullet}) => {
    //   setInterval(() => {
    //     const newX = bulletX + 5 * Math.sin(degToRad(angle)),
    //           newY = bulletY - 5 * Math.cos(degToRad(angle))
    //     bulletX = newX;
    //     bulletY = newY;
    //     bullet.attr("cx", newX).attr("cy", newY);
    //   }, 10);
    //   setTimeout(() => {
    //     let circles = svg.getElementsByTagName("circle");
    //     svg.removeChild(circles[0]);
    //   }, 1000);
    // })
    var x1 = getRandomInt(100, 300), y1 = getRandomInt(100, 300), x2 = getRandomInt(100, 300), y2 = getRandomInt(100, 300), x3 = getRandomInt(100, 300), y3 = getRandomInt(100, 300), x4 = getRandomInt(100, 300), y4 = getRandomInt(100, 300);
    var newPoints = x1 + "," + y1 + " " + x2 + "," + y2 + " " + x3 + "," + y3 + " " + x4 + "," + y4;
    console.log(newPoints);
    var rock = new Elem(svg, 'polygon')
        .attr("points", "10,10 80,10 80,80 10,80")
        .attr("style", "fill:black; stroke:cyan; stroke-width:1")
        .attr("transform", "translate(100, 100) rotate(20)");
    // const values = getAttributeValues(rock, "transform");
    // console.log(Number(values[0])+1);
    // let moveRocks = Observable.interval(10)
    //   .takeUntil(Observable.interval(2000))
    //   .subscribe(() => {
    //     const values = getAttributeValues(rock, "transform"),
    //           rockX = Number(values[0]) + 1,
    //           rockY = Number(values[1]) + 1;
    //     rock.attr("transform", "translate("+rockX+" "+rockY+")");
    //     })
    var createRock = Observable.interval(10)
        .map(function () {
    });
    // let moveShip = Observable
    //   .fromEvent<KeyboardEvent>(document, "keydown")
    //   .map(({key}) => {
    //     if (key == "ArrowRight") {
    //      angle = (angle+10) % 360;
    //     } 
    //     if (key == "ArrowLeft") {
    //       angle = (angle-10) % 360;
    //     }
    //     if (key == "ArrowUp") {
    //       // we need to manipulate the x and y based on the angle
    //       const xSpeed = spe * Math.sin(angle * Math.PI / 180),
    //             ySpeed = spe * Math.cos(angle * Math.PI / 180);
    //       x += xSpeed;
    //       y -= ySpeed;
    //       if (x < -SHIP_BORDERS) {
    //         x = svg.clientWidth;
    //       } else if (x > svg.clientWidth+SHIP_BORDERS) {
    //         x = 0;
    //       }
    //       if (y < -SHIP_BORDERS) {
    //         y = svg.clientHeight;
    //       } else if (y > svg.clientHeight+SHIP_BORDERS) {
    //         y = 0;
    //       }
    //       spe = spe + i;
    //       i += 0.1;
    //     }
    //     return {x, y, angle}})
    //   .subscribe(({x, y, angle}) => {
    //     console.log(angle);
    //     g.attr("transform", "translate("+x+", "+y+") rotate("+angle+")")
    //     })
    // let moveShip = Observable.fromEvent<KeyboardEvent>(document, "keydown")
    //   .map(({key}) => {
    //     const values: RegExpMatchArray = getAttributeValues(g, "transform");
    //     // let x = values[0],
    //     //     y = values[1],
    //     //     angle = Number(values[2]);
    //     if (key == "ArrowRight") {
    //       angle = (angle + 10) % 360;
    //     }
    //     if (key == "ArrowLeft") {
    //       angle = (angle - 10) % 360;
    //     }
    //     if (key == "ArrowUp") {
    //       const xSpeed = spe * Math.sin(angle * Math.PI / 180),
    //             ySpeed = spe * Math.cos(angle * Math.PI / 180);
    //       x += xSpeed;
    //       y -= ySpeed;
    //       if (x < -SHIP_BORDERS) {
    //         x = svg.clientWidth;
    //       } else if (x > svg.clientWidth+SHIP_BORDERS) {
    //         x = 0;
    //       }
    //       if (y < -SHIP_BORDERS) {
    //         y = svg.clientHeight;
    //       } else if (y > svg.clientHeight+SHIP_BORDERS) {
    //         y = 0;
    //       }
    //       spe = spe * i;
    //       i += 0.1;
    //     }
    //     return {x, y, angle};
    //   })
    //   .subscribe(({x, y, angle}) => {
    //     console.log(angle);
    //     g.attr("transform", "translate("+x+", "+y+") rotate("+angle+")");
    //   })
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
