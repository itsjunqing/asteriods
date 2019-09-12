// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

/**
 * Converts an angle of radians to degrees
 */
const radToDeg = (rad:number) => 
  rad * 180 / Math.PI;

/**
 * Converts an angle of degrees to radians
 */
const degToRad = (deg: number) => 
  deg * Math.PI / 180;

/**
 * Returns a CSS Matrix of the transform attribute of the element
 */
const transformMatrix = 
  (e:Elem) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);

/**
 * Returns the distance between two coordinates
 */
const distanceBetweenPoints = (x1: number, y1: number, x2: number, y2: number) : number => 
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));   

/**
 * Gets a random integer number within the bounded size (inclusive of max and min value itself)
 */
const getRandomInt = (min: number, max: number) : number => 
  Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Returns a new coordinate of x and y after moving the old coordinates
 */
const getMovement = (x: number, y: number, value: number, angle: number) => 
  ({x: x + value * Math.sin(degToRad(angle)), y: y - value * Math.cos(degToRad(angle))})

const getWrapValue = (x: number, y: number, offset: number, svg: HTMLElement) => 
  ({x: x < -offset? svg.clientWidth + offset : x > svg.clientWidth + offset? -offset : x, 
    y: y < -offset? svg.clientHeight + offset : y > svg.clientHeight + offset? -offset : y})

/**
 * Returns the rotation angle of a transformed element using jQuery
 * Inspired by https://stackoverflow.com/questions/8270612/get-element-moz-transformrotate-value-in-jquery
 */
function getRotationDegrees(obj: JQuery) {
    let matrix = obj.css("-webkit-transform") ||
    obj.css("-moz-transform")    ||
    obj.css("-ms-transform")     ||
    obj.css("-o-transform")      ||
    obj.css("transform");
    const values : string[] = matrix.split('(')[1].split(')')[0].split(','),
            a : number= Number(values[0]),
            b : number = Number(values[1]);
    let angle : number = Math.round(Math.atan2(b, a) * (180/Math.PI));
    return angle;
}

//ok?
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


const collisionDetection = (bullet: Elem, asteriodsBelt: Array<[Elem, number]>, asteriodsGroup: Elem, svg: HTMLElement) => {
  asteriodsBelt
    .filter(asteriodData => {
      const 
        bulletX = parseInt(bullet.attr("cx")),
        bulletY = parseInt(bullet.attr("cy")),
        asteriodX = parseInt(asteriodData[0].attr("cx")),
        asteriodY = parseInt(asteriodData[0].attr("cy")),
        asteriodRadius = parseInt(asteriodData[0].attr("r"))
      return distanceBetweenPoints(bulletX, bulletY, asteriodX, asteriodY) < asteriodRadius
    })

    .map(asteriodData => {
      const asteriod = asteriodData[0],
            radius = parseInt(asteriod.attr("r")),
            score = parseInt(document.getElementById("score")!.innerText),
            level = parseInt(document.getElementById("level")!.innerText)

      bullet.attr("collided", 1);
      asteriodsGroup.elem.removeChild(asteriod.elem);
      asteriodsBelt.splice(asteriodsBelt.indexOf(asteriodData), 1);
      document.getElementById("score")!.innerText = String(score + radius)
      document.getElementById("level")!.innerText = (score + radius) >= (level * 2000)? String(level + 1) : String(level)
      return asteriodData
    })

    .filter(asteriodData => parseInt(asteriodData[0].attr("r")) > 20)

    .map(asteriodData => {
      const 
        asteriod = asteriodData[0],
        x = parseInt(asteriod.attr("cx")),
        y = parseInt(asteriod.attr("cy")),
        radius = parseInt(asteriod.attr("r")),
        newSize = radius / 2, 

        a = new Elem(svg, "circle", asteriodsGroup.elem)
          .attr("cx", x + 10 + (newSize * Math.sin(degToRad(60))))
          .attr("cy", y + 10 + (newSize * Math.cos(degToRad(60))))
          .attr("r", newSize)
          .attr("fill", "black").attr("stroke", "yellow"),

        b = new Elem(svg, "circle", asteriodsGroup.elem)
          .attr("cx", x - 10 - (newSize * Math.sin(degToRad(60))))
          .attr("cy", y + 10 + (newSize * Math.cos(degToRad(60))))
          .attr("r", newSize)
          .attr("fill", "black").attr("stroke", "yellow"),

        c = new Elem(svg, "circle", asteriodsGroup.elem)
          .attr("cx", x)
          .attr("cy", y - 10 - newSize)
          .attr("r", newSize)
          .attr("fill", "black")
          .attr("stroke", "yellow")

      asteriodsBelt.push([a, getRandomInt(0, 359)])
      asteriodsBelt.push([b, getRandomInt(0, 359)])
      asteriodsBelt.push([c, getRandomInt(0, 359)])
    })   
  }


function asteroids() {
  // an impure array to keep track of the available asteriods in the map, it is a design choice so that we can mutate the position of the asteriods around the map
  let asteriodsBelt: [Elem, number][] = []
  
  const 
    // a resetGame function that resets the game to the starting point without changing the player's score by removing all asteriods in the map resets the rocket's position to the center
    resetGame = () => {
      $(asteriodsGroup.elem).empty()
      asteriodsBelt.length = 0;
      g.attr("transform", "translate(300 300) rotate(0)")
    },

    // an SVG canvas representing the map
    svg = document.getElementById("canvas")!,

    // a container for the rocket to move
    g = new Elem(svg,'g')
      .attr("transform", "translate(300, 300) rotate(0)")
      .attr("id", "rocket"),

    // a rocket Polygon to move around the map
    rocket = new Elem(svg, 'polygon', g.elem) 
      .attr("points","-15,20 15,20 0,-20")
      .attr("style","fill:black; stroke:white; stroke-width:1"),

    // a container to store all asteriods 
    asteriodsGroup = new Elem(svg, "g"),

    // boss = new Elem(svg, "ellipse")
    //   .attr("cx", 300).attr("cy", 40).attr("rx", 80).attr("ry", 40).attr("fill", "gray").attr("visibility", "hidden"),


    // Observable that runs for every 10 milliseconds to determine if the game ends
    endGame = Observable.interval(10).filter(() => document.getElementById("gameover")!.getAttribute("visibility") == "visible"),

    // Observables that fires when it observes a keydown or keyup is pressed and stop streaming values when the game ends
    keyDown = Observable.fromEvent<KeyboardEvent>(document, "keydown").takeUntil(endGame),
    keyUp = Observable.fromEvent<KeyboardEvent>(document, "keyup").takeUntil(endGame),


    ship = keyDown.map(key => ({
      x: transformMatrix(g).m41,
      y: transformMatrix(g).m42,
      angle: getRotationDegrees($('#canvas #ship')),
      key: key
    }))



  // rotates the ship to the left by transforming to a new angle, reusing the ship observable
  ship.filter(({key}) => key.code == "ArrowLeft")
    .subscribe(({x, y, angle}) => {g.attr("transform", "translate("+x+" "+y+") rotate("+((angle-10) % 360)+")")})

  // rotates the ship to the right by transforming to a new angle, reusing the ship observable  
  ship.filter(({key}) => key.code == "ArrowRight")
    .subscribe(({x, y, angle}) => {g.attr("transform", "translate("+x+" "+y+") rotate("+((angle+10) % 360)+")")})
  
  
  
  const speedController = () => {
    let speed = 0, multipler = 0.2
    return {
      accelerate: () => {
        speed = speed < 8? parseFloat((speed + multipler).toFixed(1)): speed
        // console.log("accelrtea speed = " + speed);
        multipler = speed < 8? parseFloat((multipler + 0.2).toFixed(1)) : multipler
        // console.log("multiplier = " + multipler);
      },
      deccelerate: () => {
        speed = speed > 0? parseFloat((speed - 0.1).toFixed(1)): 0
        multipler = speed > 0? multipler - 0.001 : multipler
        // console.log("decleerate speed = " + speed);
      },
      getSpeed: () => speed,

      reset: () => {
        speed = 5
      }
    }
  }

  let shipController = speedController();
  let afdsa = Observable.interval(10)
    .map(() => {
      const x = transformMatrix(g).m41,
            y = transformMatrix(g).m42,
            angle = getRotationDegrees($('#canvas #ship'))
      return {x, y, angle}
    })
    .subscribe(({x, y, angle})=> {
      shipController.deccelerate();
      console.log(shipController.getSpeed());
      const movement = getMovement(x, y, shipController.getSpeed(), angle),
            coordinate = getWrapValue(movement.x, movement.y, 0, svg)
      g.attr("transform", "translate("+coordinate.x+" "+coordinate.y+") rotate("+angle+")")
    })


  ship.filter(({key}) => key.code == "ArrowUp")
    .subscribe(() => shipController.accelerate())





  // keyUp.filter(({code}) => code == "ArrowUp")
  //   .flatMap(() => ship)
  //   .map(({x, y, angle}) => {
  //     Observable.interval(10).takeUntil(Observable.interval(2000))
  //     .map(() => {
  //       const movement = getMovement(x, y, shipController.getSpeed(), angle),
  //             coordinate = getWrapValue(movement.x, movement.y, 0)
  //       g.attr("transform", "translate("+coordinate.x+" "+coordinate.y+") rotate("+angle+")")
  //       shipController.decelerate();
  //     })
  //     .subscribe(() => {})
  //   })
  //   .subscribe(() => {})
    // .flatMap(({x, y, angle}) => Observable.interval(10).takeUntil(Observable.interval(2000))
    //   .map(() => {
    //     const movement = getMovement(x, y, shipController.getSpeed(), angle),
    //         coordinate = getWrapValue(movement.x, movement.y, 0)        
    //     shipController.decelerate()
    //     return {x: coordinate.x, y: coordinate.y, angle}
    //   }))
    // .subscribe(({x, y, angle}) => {
    //   g.attr("transform", "translate("+x+" "+y+") rotate("+angle+")")
    // })

  // keyUp.filter(key => key.code == "ArrowUp")
  //   .subscribe(() => {
  //     shipController.reset();
  //   })

  // ship.filter(({key}) => key.code == "ArrowUp")
  //   .subscribe(({x, y, angle}) => {
  //     const movement = getMovement(x, y, shipController.getSpeed(), angle), 
  //           coordinate = getWrapValue(movement.x, movement.y, 0, svg)

  //     g.attr("transform", "translate("+coordinate.x+" "+coordinate.y+") rotate("+angle+")")
      
  //     shipController.accelerate();
  //     console.log(shipController.getSpeed());
  //   })


  /**
   * Fires a bullet at the peak of the ship when space button is pressed and returns the properties of the generated bullet
   */
  const constructBullets = ship.filter(({key}) => key.code == "Space")
    .map(({x, y, angle}) => {
      const coordinate = getMovement(x, y, 20, angle),
            bullet = new Elem(svg, "circle")
              .attr("cx", coordinate.x)
              .attr("cy", coordinate.y)
              .attr("r", 2)
              .attr("fill", "salmon")
              .attr("collided", 0);
      return {bullet, angle};
    })


  /**
   * This observable will move the bullet generated every 10 milliseconds and stop moving it after 1 second. 
   * This bullet will be deleted after 1 second  if it did not collide with any asterids, so filter is used to determine the collision after 1 second.
   * At each bullet's new position, the bullet is passed to a collisionDetection function if the bullet collides with any asteriods
   */
  constructBullets.flatMap(({bullet, angle}) => Observable.interval(10)
      .takeUntil(Observable.interval(1000)
        .filter(() => parseInt(bullet.attr("collided")) == 0)
        .map(() => svg.removeChild(bullet.elem)))
      .map(() => ({bullet, angle})))
    .filter(({bullet}) => parseInt(bullet.attr("collided")) == 0)
    .subscribe(({bullet, angle}) => {
      const coordinate = getMovement(parseInt(bullet.attr("cx")), parseInt(bullet.attr("cy")), 5, angle);
      bullet.attr("cx", coordinate.x).attr("cy", coordinate.y);
      collisionDetection(bullet, asteriodsBelt, asteriodsGroup, svg);
      parseInt(bullet.attr("collided")) == 1? svg.removeChild(bullet.elem) : null
    })  

  


  /**
   * An observable that will generate a randomly positioned new asteriod for every 2 seconds.
   * The new asteriod generated will be added into an array of asteriods so that we can move all asteriods at once in a new observable.
   * This observable will stop streaming (stop generating) the values when the game ends.
   */
  Observable.interval(10)  
    .takeUntil(endGame)
    .subscribe(() => {
      const asteriodPosition = getRandomRockPosition(),
            asteriod = new Elem(svg, "circle", asteriodsGroup.elem)
              .attr("cx", asteriodPosition.x)
              .attr("cy", asteriodPosition.y)
              .attr("r", 40)
              .attr("fill", "black")
              .attr("stroke", "orange")
      asteriodsBelt.push([asteriod, getRandomInt(0, 359)]);
    })


  /**
   * An observable that moves all the asteriods that exist in the map every 100 milliseconds. 
   * The array of asteriods is flatmapped with the interval observable so that the observable is able to stream all asteriods that exist in the map, and move them accordingly.
   * The speed in which the asteriods move depeneds on the game's level, so higher level will move the asteriods faster.
   */
   Observable.interval(100)
    .takeUntil(endGame)
    .flatMap(() => Observable.fromArray(asteriodsBelt))
    .forEach(asteriodData => {
      const asteriod = asteriodData[0], 
            angle = asteriodData[1], 
            radius = parseInt(asteriod.attr("r")), 
            level = parseInt(document.getElementById("level")!.innerText),
            point = getMovement(parseInt(asteriod.attr("cx")), parseInt(asteriod.attr("cy")), 1 * level, angle),
            coordinate = getWrapValue(point.x, point.y, radius, svg)

      asteriod.attr("cx", coordinate.x).attr("cy", coordinate.y)
    })
    .filter(asteriodData => {
      const asteriodX = parseInt(asteriodData[0].attr("cx")),
            asteriodY = parseInt(asteriodData[0].attr("cy")),
            radius = parseInt(asteriodData[0].attr("r")),
            x = transformMatrix(g).m41,
            y = transformMatrix(g).m42
      return distanceBetweenPoints(x, y, asteriodX, asteriodY) < radius
    })
    .subscribe(() => {
      const lives = Number(document.getElementById("lives")!.innerText)
      document.getElementById("lives")!.innerText = lives>0? String(lives-1) : String(0)
      resetGame();
      if (lives == 0) {
         document.getElementById("gameover")!.setAttribute("visibility", "visible")
         svg.removeChild(g.elem)
       } 
    })



}



// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
