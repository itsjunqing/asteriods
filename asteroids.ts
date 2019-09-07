// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

const radToDeg = (rad:number) => rad * 180 / Math.PI;
const degToRad = (deg: number) => deg * Math.PI / 180;

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
  const svg = document.getElementById("canvas")!;

  // make a group for the spaceship and a transform to move it and rotate it
  // to animate the spaceship you will update the transform property
  let x = svg.clientWidth / 2;
  let y = svg.clientHeight / 2;
  let angle = 45;

  let g = new Elem(svg,'g')
    // translate is to move element to x = 300 and y = 300
    // rotate 170 degrees clockwise
    // .attr("transform","translate("+x+" "+y+") rotate("+angle+")")  
    .attr("transform", "translate(300, 300) rotate(45)")

  // create a polygon shape for the space ship as a child of the transform group
  let rect = new Elem(svg, 'polygon', g.elem) 
    .attr("points","-15,20 15,20 0,-20")
    .attr("style","fill:black; stroke:white; stroke-width:1")

  const transformMatrix = 
    (e:Elem) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform)

  

  // FOR SHIP MOVING
  const SHIP_BORDERS = 5;
  
  let speed = 5, multipler = 0;
  

  const stopArrowUp = Observable.fromEvent<KeyboardEvent>(document, "keyup")
    .filter(({code}) => code == "ArrowUp")
    .subscribe(() => {
      multipler = 0;
      speed = 5;
    })

  
  const accelerateShip = Observable.fromEvent<KeyboardEvent>(document, "keydown")
    .filter(({code}) => code == "ArrowUp")
    .map(() => {   
      const xChange = speed * Math.sin(angle * Math.PI / 180),
            yChange = speed * Math.cos(angle * Math.PI / 180);
      x += xChange;
      y -= yChange;

      if (x < -SHIP_BORDERS) {
          x = svg.clientWidth;
      } else if (x > svg.clientWidth+SHIP_BORDERS) {
        x = 0;
      }

      if (y < -SHIP_BORDERS) {
        y = svg.clientHeight;
      } else if (y > svg.clientHeight+SHIP_BORDERS) {
        y = 0;
      }

      if (speed < 300) {
        speed += multipler;
        multipler += 0.1;
      }
      return {x, y, multipler}
    })
    .subscribe(({x, y, multipler}) => {
      g.attr("transform", "translate("+x+" "+y+") rotate("+angle+")");
    })
  
  
  const rotateShip = Observable.fromEvent<KeyboardEvent>(document, "keydown")
    .filter(({code}) => code == "ArrowRight" || code == "ArrowLeft")
    .map(({code}) => {
      if (code == "ArrowRight") {
        angle = (angle + 10) % 360
      } else if (code == "ArrowLeft") {
        angle = (angle - 10) % 360
      }
      return {angle}
    })
    .subscribe(({angle}) => {
      g.attr("transform", "translate("+x+" "+y+") rotate("+angle+")");
    })


  const stopBullets = Observable.interval(1000)
    .map(() => {
      let bullets = svg.getElementsByTagName("circle");
      if (bullets.length > 0) {
        svg.removeChild(bullets[0]);
      }
      console.log("stop bullets is running");
    })


  const createBullet = Observable.fromEvent<KeyboardEvent>(document, "keydown")
    .filter(({code}) => code == "Space")
    .map(() => {
      const bulletX = x + (20 * Math.sin(degToRad(angle))),
            bulletY = y - (20 * Math.cos(degToRad(angle))),
            bullet = new Elem(svg, "circle")
                    .attr("cx", bulletX)
                    .attr("cy", bulletY)
                    .attr("r", 2)
                    .attr("fill", "salmon");
      return {bulletX, bulletY, bullet};
    })
    .map(({bulletX, bulletY, bullet}) => Observable.interval(10)
      .takeUntil(stopBullets)
      .subscribe(() => {
        const newX = bulletX + 5 * Math.sin(degToRad(angle)),
              newY = bulletY - 5 * Math.cos(degToRad(angle))
              bulletX = newX;
              bulletY = newY;
              bullet.attr("cx", newX).attr("cy", newY);
      }))
    .subscribe(()=> {});
 
  
  const createRocks = Observable.interval(500)  // generate every 0.5 seconds
    .takeUntil(Observable.interval(2001))  // generate for 5 seconds
    .map(() => {
      const rockPosition = getRandomRockPosition(),
            size = 50,
            angle = getRandomInt(0, 359),
            xChange = size * Math.sin(degToRad(30)),
            yChange = size * Math.cos(degToRad(30)),
            newPoints = `${-xChange},${-yChange} ${xChange},${-yChange} ${size},${0} ${xChange},${yChange} ${-xChange},${yChange} ${-size},${0}`;

      const rock = new Elem(svg, "polygon")
        .attr("points", newPoints)
        .attr("style","fill:black; stroke:cyan; stroke-width:1")
        .attr("transform", "translate("+rockPosition.x+" "+rockPosition.y+") rotate("+angle+")")

      return {rockPosition, rock, angle}
    })

    .map(({rockPosition, rock, angle}) => Observable.interval(100)
      // .takeUntil(Observable.interval(5000))
      .subscribe(() => {
        // const newX = Number(getAttributeValues(rock, "transform")[0]) + 1 * Math.sin(degToRad(angle)),
        //       newY = Number(getAttributeValues(rock, "transform")[1]) - 1 * Math.cos(degToRad(angle))
        const newX = rockPosition.x + 1 * Math.sin(degToRad(angle)),
              newY = rockPosition.y - 1 * Math.cos(degToRad(angle));
        rockPosition.x = newX;
        rockPosition.y = newY;
        rock.attr("transform", "translate("+newX+" "+newY+") rotate("+angle+")")
      }))
    .subscribe(() => {});
}




function getRandomRockPosition() {
  let y = getRandomInt(1, 599),
      x;

  if (y > 150 && y < 450) {
    if (getRandomInt(0, 1)) {
      x = getRandomInt(1, 150)
    } else {
      x = getRandomInt(450, 599)
    }
  } else {
    x = getRandomInt(1, 599);
  }
  return {x, y}
}



function getAttributeValues(e: Elem, attribute: string) : RegExpMatchArray {
  return e.attr(attribute).match(/\d+/g)!;
}

function getRandomInt(min: number, max: number) : number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
