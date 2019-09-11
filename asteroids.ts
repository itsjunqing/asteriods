// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

const radToDeg = (rad:number) => 
  rad * 180 / Math.PI;

const degToRad = (deg: number) => 
  deg * Math.PI / 180;

const transformMatrix = 
  (e:Elem) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);

const transform = (e: Element) => new WebKitCSSMatrix(window.getComputedStyle(e).webkitTransform)

const distanceBetweenPoints = (x1: number, y1: number, x2: number, y2: number) : number => 
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));   

const getRandomInt = (min: number, max: number) : number => 
  Math.floor(Math.random() * (max - min + 1) + min);

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

  let score = 0;

  const collisionDetection = (bullet: Elem, rocksArray: Array<[Elem, number]>) => {
    const bulletX = Number(bullet.attr("cx")),
          bulletY = Number(bullet.attr("cy"))

    rocksArray
      .filter(rockInfo => {
        const rock = rockInfo[0],
              rockX = Number(rock.attr("cx")),
              rockY = Number(rock.attr("cy")),
              radius = Number(rock.attr("r"))
        return distanceBetweenPoints(bulletX, bulletY, rockX, rockY) < radius
      })
      .map(rockInfo => {
        const rock = rockInfo[0],
              radius = Number(rock.attr("r"))

        bullet.attr("collided", 1)
        console.log("score before = " + score);
        score += radius;
        console.log("score after = " + score);
        svg.removeChild(rock.elem);
        // rock.elem.parentNode!.removeChild(rock.elem);
        rocksArray.splice(rocksArray.indexOf(rockInfo), 1);

        document.getElementById("score")!.innerHTML = String(score)
        return rockInfo
      })
      .filter(rockInfo => Number(rockInfo[0].attr("r")) > 20)
      .map(rockInfo => {
        const rock = rockInfo[0],
              x = Number(rock.attr("cx")),
              y = Number(rock.attr("cy")),
              radius = Number(rock.attr("r")),
              newSize = radius / 2
        let a = new Elem(svg, "circle")
            .attr("cx", x + 10 + (newSize * Math.sin(degToRad(60)))).attr("cy", y + 10 + (newSize * Math.cos(degToRad(60)))).attr("r", newSize)
            .attr("fill", "black").attr("stroke", "cyan")

        let b = new Elem(svg, "circle")
          .attr("cx", x - 10 - (newSize * Math.sin(degToRad(60)))).attr("cy", y + 10 + (newSize * Math.cos(degToRad(60)))).attr("r", newSize)
          .attr("fill", "black").attr("stroke", "cyan")

        let c = new Elem(svg, "circle")
          .attr("cx", x).attr("cy", y - 10 - newSize).attr("r", newSize)
          .attr("fill", "black").attr("stroke", "cyan")

        rocksArray.push([a, getRandomInt(0, 359)])
        rocksArray.push([b, getRandomInt(0, 359)])
        rocksArray.push([c, getRandomInt(0, 359)])
      })   
  }
  const svg = document.getElementById("canvas")!;


  
  
  let g = new Elem(svg,'g')
    .attr("transform", "translate(300, 300) rotate(45)")
    .attr("id", "ship")

  let rect = new Elem(svg, 'polygon', g.elem) 
    .attr("points","-15,20 15,20 0,-20")
    .attr("style","fill:black; stroke:white; stroke-width:1")

  let rocksArray: Array<[Elem, number]> = [];

  const ship = Observable.fromEvent<KeyboardEvent>(document, "keydown")
    .map(key => ({
      x: transformMatrix(g).m41,
      y: transformMatrix(g).m42,
      angle: getRotationDegrees($('#canvas #ship')),
      key: key
    }))

  ship.filter(({key}) => key.code == "ArrowLeft")
    .subscribe(({x, y, angle}) => {g.attr("transform", "translate("+x+" "+y+") rotate("+((angle-10) % 360)+")")}, () => {})

  ship.filter(({key}) => key.code == "ArrowRight")
    .subscribe(({x, y, angle}) => {g.attr("transform", "translate("+x+" "+y+") rotate("+((angle+10) % 360)+")")}, () => {})
  
  let speed = 5, multipler = 0;
  
  // function shipData = () => {
  //   let spedd = 5; multipler = 0;
  //   return {
  //     lala: () => {

  //     }
  //   }
  // }


  const stopArrowUp = Observable.fromEvent<KeyboardEvent>(document, "keyup")
    .filter(({code}) => code == "ArrowUp")
    .subscribe(() => {
      multipler = 0;
      speed = 5;
    })

  ship.filter(({key}) => key.code == "ArrowUp")
    .map(({x, y, angle}) => {
      const xChange = speed * Math.sin(degToRad(angle)),
            yChange = speed * Math.cos(degToRad(angle)),
            newX = (x+xChange) < 0? svg.clientWidth : (x+xChange) > svg.clientWidth? 0 : x+xChange,
            newY = (y-yChange) < 0? svg.clientHeight : (y-yChange) > svg.clientHeight? 0 : y-yChange;
      if (speed < 300) {
        speed += multipler;
        multipler += 0.1;
      }
      return {newX, newY, angle}
    })
    .subscribe(({newX, newY, angle}) => {g.attr("transform", "translate("+newX+" "+newY+") rotate("+angle+")")}, () => {})

 


  const bullets = ship.filter(({key}) => key.code == "Space")
    .map(({x, y, angle}) => {
      const bulletX = x + (20 * Math.sin(degToRad(angle))),
            bulletY = y - (20 * Math.cos(degToRad(angle))),
            bullet = new Elem(svg, "circle")
                    .attr("cx", bulletX)
                    .attr("cy", bulletY)
                    .attr("r", 2)
                    .attr("fill", "salmon")
                    .attr("class", "bullet")
                    .attr("collided", 0);
      return {bulletX, bulletY, bullet, angle};
    })



  // const fireBullets = bullets.flatMap(({bulletX, bulletY, bullet, angle}) => Observable.interval(10)
  //     .takeUntil(Observable
  //       .interval(1000)
  //       .filter(() => Number(bullet.attr("collided")) == 0)
  //       .map(() => svg.removeChild(bullet.elem)))
  //     .map(() => {
  //       const newX = bulletX + 5 * Math.sin(degToRad(angle)),
  //             newY = bulletY - 5 * Math.cos(degToRad(angle));
  //             bulletX = newX;
  //             bulletY = newY;
  //       bullet.attr("cx", newX).attr("cy", newY);
  //       collisionDetection(bullet, rocksArray);
  //       return {bulletX, bulletY, bullet, angle}
  //     }))

  const fireBullets = bullets.flatMap(({bulletX, bulletY, bullet, angle}) => Observable.interval(10)
      .takeUntil(Observable
        .interval(1000)
        .filter(() => Number(bullet.attr("collided")) == 0)
        .map(() => svg.removeChild(bullet.elem)))
      .map(() => {
        return {bulletX, bulletY, bullet, angle}
      }))

  
  // let k = fireBullets.filter(({bullet}) => {
  //    console.log(Number(bullet.attr("collided"))); 
  //    return Number(bullet.attr("collided")) == 1
  // })
  // .subscribe(({bullet}) => {
  //   console.log("running collided");
  //   svg.removeChild(bullet.elem)
  // })
  
  fireBullets.filter(({bullet}) => Number(bullet.attr("collided")) == 0).subscribe(({bulletX, bulletY, bullet, angle}) => {
    const newX = Number(bullet.attr("cx")) + 5 * Math.sin(degToRad(angle)),
          newY = Number(bullet.attr("cy")) - 5 * Math.cos(degToRad(angle));

    bullet.attr("cx", newX).attr("cy", newY);
    collisionDetection(bullet, rocksArray);
    Number(bullet.attr("collided")) == 1? svg.removeChild(bullet.elem) : null
  })  



  const spawnRocks = Observable.interval(500)  // generate every 0.5 seconds
    .takeUntil(Observable.interval(5000))  // generate for 5 seconds
    .map(() => {
      const rockPosition = getRandomRockPosition(),
            size = 40,
            angle = getRandomInt(0, 359)

      const rock = new Elem(svg, "circle")
        .attr("cx", rockPosition.x).attr("cy", rockPosition.y).attr("r", size)
        .attr("fill", "black").attr("stroke", "cyan")
      rocksArray.push([rock, angle]);
      return rocksArray
    })

  spawnRocks.subscribe(() => {})

  const t = Observable.interval(100)
    .takeUntil(Observable.interval(1000000000))
    .flatMap(() => Observable.fromArray(rocksArray))
    .forEach(rockInfo => {
      const rock = rockInfo[0],
            angle = rockInfo[1],
            newX = Number(rock.attr("cx")) + 2 * Math.sin(degToRad(angle)),
            newY = Number(rock.attr("cy")) - 2 * Math.cos(degToRad(angle)),
            radius = Number(rock.attr("r")),
            x = newX < -radius? svg.clientWidth+radius : newX > (svg.clientWidth+radius)? -radius : newX,
            y = newY < -radius? svg.clientHeight+radius : newY > (svg.clientHeight+radius)? -radius : newY
      rock.attr("cx", x).attr("cy", y)
    })


  // t.filter(rockInfo => {
  //   const rockX = Number(rockInfo[0].attr("cx")),
  //         rockY = Number(rockInfo[0].attr("cy")),
  //         radius = Number(rockInfo[0].attr("r")),
  //         x = transformMatrix(g).m41,
  //         y = transformMatrix(g).m42
  //   return distanceBetweenPoints(x, y, rockX, rockY) < radius
  // })

    
  t.subscribe(() => {})


}



// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
