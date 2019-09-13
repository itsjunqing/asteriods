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
 * Inspired by Nicholas Wong (Malaysia tutor)
 */
const transformMatrix = 
  (e:Elem) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);

/**
 * Gets a random integer number within the bounded size (inclusive of max and min value itself)
 */
const getRandomInt = (min: number, max: number) : number => 
  Math.floor(Math.random() * (max - min + 1) + min);

/**
 * A pure function that returns the distance between two coordinates
 */
const distanceBetweenPoints = (x1: number, y1: number, x2: number, y2: number) : number => 
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));   

const distanceEllipse = (x: number, y: number, ellipse: Elem) => {
  return (Math.pow(x - parseInt(ellipse.attr("cx")), 2) / Math.pow(parseInt(ellipse.attr("rx")), 2)) +
    (Math.pow(y - parseInt(ellipse.attr("cy")), 2) / Math.pow(parseInt(ellipse.attr("ry")), 2))
}
/**
 * A pure function that returns a new coordinate of x and y after moving the old coordinates
 */
const getMovement = (x: number, y: number, value: number, angle: number) => 
  ({x: x + value * Math.sin(degToRad(angle)), y: y - value * Math.cos(degToRad(angle))})

/**
 * A pure function that returns the wrapped value of the element based on the offsets given
 */
const getWrapValue = (x: number, y: number, offset: number, svg: HTMLElement) => 
  ({x: x < -offset? svg.clientWidth + offset : x > svg.clientWidth + offset? -offset : x, 
    y: y < -offset? svg.clientHeight + offset : y > svg.clientHeight + offset? -offset : y})

/**
 * Returns the rotation angle of a transformed element using jQuery
 * Inspired by https://stackoverflow.com/questions/8270612/get-element-moz-transformrotate-value-in-jquery
 */
function getRotationDegrees(obj: JQuery) {
  const matrix = obj.css("-webkit-transform") ||
                  obj.css("-moz-transform")    ||
                  obj.css("-ms-transform")     ||
                  obj.css("-o-transform")      ||
                  obj.css("transform");
  const values : string[] = matrix.split('(')[1].split(')')[0].split(','),
        a : number= Number(values[0]),
        b : number = Number(values[1]);
  const angle : number = Math.round(Math.atan2(b, a) * (180/Math.PI));
  
  
  return angle;
}

/**
 * An impure function to generate x and y value within a specific range.
 * This is a design choice because I want to ensure that the asteriod's initial position is not at the centre, because there is a possibility where asteriod could be generated at the center and collide with the rocket immediately.
 * So I used an impure to create valid values which won't collide with rocket at the start.
 */
function getRandomPosition() {
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

/**
 * A impure function that determines if collision happens between a bullet and an asteriod.
 * It is designed in an impure way because we want to mutate the array of asteriods when collided with a bullet, so that the asteriod and the bullet will be destroyed from the svg map along with the removal from the asteriods array.
 * At the same time, when collision happens, 3 small asteriods will be generated near the position of the destroyed asteriod and these 3 new small asteriods are added into the asteriods array (to be moved by the observable) 
 */
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
      document.getElementById("score")!.innerText = String(score + 20 * radius)
      document.getElementById("level")!.innerText = (score + radius) >= (level * 1000)? String(level + 1) : String(level)
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

const controller = () => {
    let speed = 0, multipler = 1
    return {
      accelerate: () => {
        speed = speed < 40? parseFloat((speed + multipler).toFixed(1)): speed
        multipler = speed < 40? parseFloat((multipler + 0.2).toFixed(1)) : multipler
      },
      deccelerate: () => {
        speed = speed > 0? parseFloat((speed - multipler).toFixed(1)): 0
        multipler = speed > 0.2? parseFloat((multipler - 0.2).toFixed(1)) : 1
      },
      getSpeed: () => speed,
      
    }
  }

function asteroids() {
  // an impure array to keep track of the available asteriods in the map, it is a design choice so that we can mutate the position of the asteriods around the map
  let asteriodsBelt: [Elem, number][] = []
  
  const 
    // a resetGame function that resets the game to the starting point without changing the player's score by removing all asteriods in the map resets the rocket's position to the center
    resetGame = () => {
      $("#asteriods").empty()
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
    asteriodsGroup = new Elem(svg, "g")
      .attr("id", "asteriods"),

    boss = new Elem(svg, "ellipse")
      .attr("cx", 300).attr("cy", 40)
      .attr("rx", 80).attr("ry", 40)
      .attr("fill", "gray").attr("visibility", "hidden")
      .attr("id", "boss").attr("health", 30),


    // Observable that runs for every 10 milliseconds to determine if the game ends
    endGame = Observable.interval(10)
      .filter(() =>  document.getElementById("lives")!.innerText == "0")
      .map(() => {
        document.getElementById("gameover")!.setAttribute("visibility", "visible")
        $("#rocket").remove()
        $("#boss").remove()
       }),

    // A main game controller that fires every 100 milliseconds until end of game, this observable stops streaming values when game ends. This observable will be filtered in different states each for a different case, achieving reusability observables
    gameController = Observable.interval(100).takeUntil(endGame),

    // Observables that fires when it observes a keydown or keyup is pressed and stop streaming values when the game ends
    keyDown = Observable.fromEvent<KeyboardEvent>(document, "keydown").takeUntil(endGame),
    keyUp = Observable.fromEvent<KeyboardEvent>(document, "keyup").takeUntil(endGame),


    ship = keyDown.map(key => ({
      x: transformMatrix(g).m41,
      y: transformMatrix(g).m42,
      angle: getRotationDegrees($('#canvas #rocket')),
      key: key
    })),

    movementController = Observable.interval(50)
      .takeUntil(endGame)
      .map(() => ({
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
        angle: getRotationDegrees($("#canvas #rocket"))
      })),

    speedController = controller()


  // rotates the ship to the left by transforming to a new angle, reusing the ship observable
  ship.filter(({key}) => key.code == "ArrowLeft")
    .subscribe(({x, y, angle}) => {g.attr("transform", "translate("+x+" "+y+") rotate("+((angle-10) % 360)+")")})

  // rotates the ship to the right by transforming to a new angle, reusing the ship observable  
  ship.filter(({key}) => key.code == "ArrowRight")
    .subscribe(({x, y, angle}) => {g.attr("transform", "translate("+x+" "+y+") rotate("+((angle+10) % 360)+")")})
  
  // increases the rocket speed via the controller
  keyDown.filter(({code}) => code == "ArrowUp")
    .subscribe(() => speedController.accelerate())

  // decreases the rocket speed via the controller
  keyDown.filter(({code}) => code == "ArrowDown")
    .subscribe(() => speedController.deccelerate())


  // continuously moves the rocket which based on the controller's speed
  movementController.subscribe(({x, y, angle}) => {
    console.log(speedController.getSpeed());
    const movement = getMovement(x, y, speedController.getSpeed(), angle),
          coordinate = getWrapValue(movement.x, movement.y, 0, svg)
    g.attr("transform", "translate("+coordinate.x+" "+coordinate.y+") rotate("+angle+")")
  })


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
   * Moves the bullet generated every 10 milliseconds and stop moving it after 1 second. 
   * If bullet is not collided, if will stop stream its values, otherwise, it will continuously move until 1 second is reached
   * At each position of bullet, the bullet is passed to an impure collisionDetection function to determine if the bullet collides with any asteroids. If collided, the bullet will be removed 
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

  // gameController.filter(() => {
  //     const score = parseInt(document.getElementById("score")!.innerText),
  //           level = parseInt(document.getElementById("level")!.innerText)
  //     return score >= (level * 1000)
  //   })
  //   .subscribe(() => document.getElementById("level")!.innerText = String(Number($("#level")) + 1 ))

  gameController.filter(() => parseInt(document.getElementById("level")!.innerText) >= 3)
    .map(() => {
      boss.attr("visibility", "visible")
      $("#bossHP").removeAttr("hidden")
    })
    .takeUntil(endGame)
    .filter(() => document.getElementById("boss")! != null)
    .subscribe(() => {
      const bossX = parseInt(boss.attr("cx")),
            bossY = parseInt(boss.attr("cy")),
            x = transformMatrix(g).m41,
            y = transformMatrix(g).m42,
            angle = (450 + radToDeg(Math.atan2(y - bossY, x - bossX))) % 360,
            point = getMovement(bossX, bossY, 2, angle)
      boss.attr("cx", point.x).attr("cy", point.y)
      return {bossX: point.x, bossY: point.y}
    })

  gameController.filter(() => boss.attr("visibility") == "visible")
    .filter(() => distanceEllipse(transformMatrix(g).m41, transformMatrix(g).m42, boss) <= 1)
    .subscribe(() => {
      const lives = parseInt(document.getElementById("lives")!.innerText)
      document.getElementById("lives")!.innerText = lives>0? String(lives-1) : String(0)
      boss.attr("cx", 300).attr("cy", 40)
      resetGame();
    })


  gameController.filter(() => document.contains(boss.elem))
    .filter(() => parseInt(boss.attr("health")) == 0)
    .subscribe(() => {
       svg.removeChild(boss.elem)
       $("#destroyed").removeAttr("hidden")  
    })


  ship.filter(({key}) => key.code == "KeyB")
    .map(({x, y}) => {
      const bomb = new Elem(svg, "circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 10)
        .attr("id", "bomb")
        .attr("fill", "lime")
      return {bomb}
    })
    .flatMap(({bomb}) => Observable.interval(100)
        .takeUntil(Observable.interval(10000)
          .filter(() => document.contains(bomb.elem))
          .map(() => svg.removeChild(bomb.elem)))
        .map(() => ({bomb})))
    .filter(({bomb}) => document.contains(bomb.elem))
    .filter(({bomb}) => distanceEllipse(parseInt(bomb.attr("cx")), parseInt(bomb.attr("cy")), boss) <= 1)
    .subscribe(({bomb}) => {
      const hp = parseInt(boss.attr("health"))
      boss.attr("health", hp > 1? hp -1: 0)
      document.getElementById("hp")!.innerText = boss.attr("health")
      document.contains(bomb.elem)? svg.removeChild(bomb.elem) : null
    })



  


  /**
   * An observable that will generate a randomly positioned new asteriod for every 3 seconds.
   * The new asteriod generated will be added into an array of asteriods so that we can move all asteriods at once in a new observable.
   * This observable will stop streaming (stop generating) when the game ends.
   */
  Observable.interval(3000)  
    .takeUntil(endGame)
    .subscribe(() => {
      const asteriodPosition = getRandomPosition(),
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
   * This observable has two parts: 
   * 1) move the asteriods where the speed depends on the game's level, so higher level will move the asteriods faster.
   * 2) filtering if any of the asteriods collide with the rocket and reset the gameplay 
   */
  gameController.flatMap(() => Observable.fromArray(asteriodsBelt))
    .subscribe(asteriodData => {
      const asteriod = asteriodData[0], 
            angle = asteriodData[1], 
            radius = parseInt(asteriod.attr("r")), 
            level = parseInt(document.getElementById("level")!.innerText),
            point = getMovement(parseInt(asteriod.attr("cx")), parseInt(asteriod.attr("cy")), 2 * level, angle),
            coordinate = getWrapValue(point.x, point.y, radius, svg)

      asteriod.attr("cx", coordinate.x).attr("cy", coordinate.y)
    })

  gameController.flatMap(() => Observable.fromArray(asteriodsBelt))
    .filter(asteriodData => {
      const asteriodX = parseInt(asteriodData[0].attr("cx")),
            asteriodY = parseInt(asteriodData[0].attr("cy")),
            radius = parseInt(asteriodData[0].attr("r")),
            x = transformMatrix(g).m41,
            y = transformMatrix(g).m42
      return distanceBetweenPoints(x, y, asteriodX, asteriodY) < radius
    })
    .subscribe(() => {
      const lives = parseInt(document.getElementById("lives")!.innerText)
      document.getElementById("lives")!.innerText = lives>0? String(lives-1) : String(0)
      resetGame();
    })


}



// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
