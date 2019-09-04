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
  const svg = document.getElementById("canvas")!;

  // make a group for the spaceship and a transform to move it and rotate it
  // to animate the spaceship you will update the transform property
  let x = svg.clientWidth / 2;
  let y = svg.clientHeight / 2;
  let angle = 170;

  let g = new Elem(svg,'g')
    // translate is to move element to x = 300 and y = 300
    // rotate 170 degrees clockwise
    .attr("transform","translate("+x+" "+y+") rotate("+angle+")")  

  // let g = new Elem(svg,'g')
  //   // translate is to move element to x = 300 and y = 300
  //   // rotate 170 degrees clockwise
  //   .attr("transform","translate(300 300) rotate(170)")    

  // create a polygon shape for the space ship as a child of the transform group
  let rect = new Elem(svg, 'polygon', g.elem) 
    .attr("points","-15,20 15,20 0,-20")
    .attr("style","fill:black; stroke:white; stroke-width:1")

  const transformMatrix = 
    (e:Elem) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform)

  const radToDeg = (rad:number) => rad * 180 / Math.PI + 90;
  
  



  // FOR SHIP MOVING
  const SHIP_BORDERS = 25;
  
  let speed = 5, multipler = 0;

  const stopArrowUp = Observable.fromEvent<KeyboardEvent>(document, "keyup")
    .filter(({key}) => key == "ArrowUp")
    .subscribe(() => {
      multipler = 0;
      speed = 5;
    })

  const accelerateShip = Observable.fromEvent<KeyboardEvent>(document, "keydown")
    .filter(({key}) => key == "ArrowUp")
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
      g.attr("transform", "translate("+x+", "+y+") rotate("+angle+")");
    })
  
  const rotateShip = Observable.fromEvent<KeyboardEvent>(document, "keydown")
    .filter(({key}) => key == "ArrowRight" || key == "ArrowLeft")
    .map(({key}) => {
      if (key == "ArrowRight") {
        angle = (angle + 10) % 360
      } else if (key == "ArrowLeft") {
        angle = (angle - 10) % 360
      }
      return {angle}
    })
    .subscribe(({angle}) => {
      g.attr("transform", "translate("+x+", "+y+") rotate("+angle+")");
    })


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

  // Observable.fromEvent<KeyboardEvent>(document, "keyup")
  //   .map(({key}) => {
  //     if (key == "ArrowUp") {
  //       i = 0
  //     }
  //   })


}


function getAttributeValues(e: Elem, attribute: string) : RegExpMatchArray {
  return e.attr(attribute).match(/\d+/g)!;
}


// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
