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

  // let enemy = new Elem(svg, "ellipse")
  //   .attr("cx", 300).attr("cy", 20)
  //   .attr("rx", 50).attr("ry", 20)
  //   .attr("fill", "navy")

  
  
  // make a group for the spaceship and a transform to move it and rotate it
  // to animate the spaceship you will update the transform property
  let g = new Elem(svg,'g')
    // translate is to move element to x = 300 and y = 300
    // rotate 170 degrees clockwise
    // .attr("transform","translate("+x+" "+y+") rotate("+angle+")")  
    .attr("transform", "translate(300, 300) rotate(45)")
    .attr("id", "ship")

  // create a polygon shape for the space ship as a child of the transform group
  let rect = new Elem(svg, 'polygon', g.elem) 
    .attr("points","-15,20 15,20 0,-20")
    .attr("style","fill:black; stroke:white; stroke-width:1")

  const ship = Observable.fromEvent<KeyboardEvent>(document, "keydown")
    .map(key => ({
      x: transformMatrix(g).m41,
      y: transformMatrix(g).m42,
      angle: getRotationDegrees($('#canvas #ship')),
      key: key
    }))

  ship.filter(({key}) => key.code == "ArrowLeft")
    .subscribe(({x, y, angle}) => {g.attr("transform", "translate("+x+" "+y+") rotate("+((angle-10) % 360)+")")})

  ship.filter(({key}) => key.code == "ArrowRight")
    .subscribe(({x, y, angle}) => {g.attr("transform", "translate("+x+" "+y+") rotate("+((angle+10) % 360)+")")})


  let rocksArray: Array<Elem>;
  
  let speed = 5, multipler = 0;
  
  // function shipData = () => {
  //   let spedd = 5; multipler = 0;
  //   () => {

  //   }
  // }

  const stopArrowUp = Observable.fromEvent<KeyboardEvent>(document, "keyup")
    .filter(({code}) => code == "ArrowUp")
    .subscribe(() => {
      multipler = 0;
      speed = 5;
    })

  const accelerateShip = ship.filter(({key}) => key.code == "ArrowUp")
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
    .subscribe(({newX, newY, angle}) => {g.attr("transform", "translate("+newX+" "+newY+") rotate("+angle+")");})

  

  const deleteBullets = Observable.interval(1000)
    .map(() => {
      let bullets = svg.getElementsByTagName("circle");
      if (bullets.length > 0) {
        svg.removeChild(bullets[0]);
      }
    })

  const bullets = ship.filter(({key}) => key.code == "Space")
    .map(({x, y, angle}) => {
      const bulletX = x + (20 * Math.sin(degToRad(angle))),
            bulletY = y - (20 * Math.cos(degToRad(angle))),
            bullet = new Elem(svg, "circle")
                    .attr("cx", bulletX)
                    .attr("cy", bulletY)
                    .attr("r", 2)
                    .attr("fill", "salmon");
      return {bulletX, bulletY, bullet, angle};
    })
    .flatMap(({bulletX, bulletY, bullet, angle}) => Observable.interval(10)
    .takeUntil(deleteBullets)
    .map(() => {
      const newX = bulletX + 5 * Math.sin(degToRad(angle)),
            newY = bulletY - 5 * Math.cos(degToRad(angle));
            bulletX = newX;
            bulletY = newY;
            bullet.attr("cx", newX).attr("cy", newY);
      return {bulletX, bulletY, bullet, angle}
    }))  



  const rocks = Observable.interval(500)
    .takeUntil(Observable.interval(1200))
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
      
      rocksArray.push(rock)
      return rocksArray
    })
    .map(e => {

    })

    



    // .flatMap(({rockPosition, rock, angle, size}) => Observable.interval(100)
    //   .takeUntil(Observable.interval(100000000000000))
    //   .map(() => {
    //     const newX = rockPosition.x + 2 * Math.sin(degToRad(angle)),
    //           newY = rockPosition.y - 2 * Math.cos(degToRad(angle)),
    //           x = newX < -50? svg.clientWidth+50 : newX > (svg.clientWidth+50)? -50 : newX,
    //           y = newY < -50? svg.clientHeight+50 : newY > (svg.clientHeight+50)? -50 : newY;
    //     rockPosition.x = x;
    //     rockPosition.y = y;
    //     rock.attr("transform", "translate("+x+" "+y+") rotate("+angle+")")

    //     return {rockPosition, rock, angle, size}
    //   }))  

  rocks.subscribe(() => {})

  const asteroy = Observable.interval(500).map(() => rocksArray);

  // rocks.flatMap(({rockPosition, rock, angle, size}) => bullets
  //     .map(({bulletX, bulletY, bullet}) => ({rockPosition, rock, angle, size, bulletX, bulletY, bullet})))
  //   .filter(({rockPosition, bulletX, bulletY, size}) => distanceBetweenPoints(rockPosition.x, rockPosition.y, bulletX, bulletY) < size)
  //   .map(({rockPosition, rock, angle, size, bulletX, bulletY, bullet}) => {
  //     rock.elem.parentNode!.removeChild(rock.elem);
  //     bullet.elem.parentNode!.removeChild(bullet.elem)

  //   })





  // const createMiniRocks = function(x: number, y: number, size: number) {
  //   const angle = getRandomInt(0, 359),
  //         xChange = size * Math.sin(degToRad(30)),
  //         yChange = size * Math.cos(degToRad(30)),
  //         newPoints = `${-xChange},${-yChange} ${xChange},${-yChange} ${size},${0} ${xChange},${yChange} ${-xChange},${yChange} ${-size},${0}`;

  //   let a = new Elem(svg, "polygon", rocks.elem)
  //           .attr("points", newPoints)
  //           .attr("style","fill:black; stroke:cyan; stroke-width:1")
  //           .attr("transform", "translate("+(x + (size * Math.sin(degToRad(60))))+" "+(y + (size * Math.cos(degToRad(60))))+") rotate("+angle+")")

  //   let b = new Elem(svg, "polygon", rocks.elem)
  //     .attr("points", newPoints)
  //     .attr("style","fill:black; stroke:cyan; stroke-width:1")
  //     .attr("transform", "translate("+(x - (size * Math.sin(degToRad(60))))+" "+(y + (size * Math.cos(degToRad(60))))+") rotate("+angle+")")

  //   let c = new Elem(svg, "polygon", rocks.elem)
  //     .attr("points", newPoints)
  //     .attr("style","fill:black; stroke:cyan; stroke-width:1")
  //     .attr("transform", "translate("+x+" "+(y - size)+") rotate("+angle+")")

  //   asteriodsArray.push(a)
  //   asteriodsArray.push(b)
  //   asteriodsArray.push(c)
  // }

  
  // let k = moveBullets.map(({bulletX, bulletY}) => Observable.fromArray<Elem>(asteriodsArray)
  //     // .forEach(e => console.log(e)))
  //     // .subscribe(() => {
  //     //   console.log("hello world")
  //     //   // console.log(asteriodsArray);
  //     // })
  //   // .subscribe(() => {})
  //   .filter(e => {
  //     const rockX = transformMatrix(e).m41,
  //           rockY = transformMatrix(e).m42,
  //           size = Number(getAttributeValues(e, "points")[18])

  //     return distanceBetweenPoints(rockX, rockY, bulletX, bulletY) < size
  //   })
  //   .map(e => {
  //     const rockX = transformMatrix(e).m41,
  //           rockY = transformMatrix(e).m42,
  //           size = Number(getAttributeValues(e, "points")[18])

  //     e.elem.parentNode!.removeChild(e.elem)
  //     asteriodsArray.splice(asteriodsArray.indexOf(e), 1)

  //     destroyBullet(svg)
  //     createMiniRocks(rockX, rockY, size / 2);
  //   }))
  // k.subscribe(() => {})

 
  // Observable.interval(1000).takeUntil(Observable.interval(2500)).subscribe(() => console.log(asteriodsArray))

  


  // const collision = moveRocks.flatMap(({rockPosition, rock, size}) => moveBullets
  //     .takeUntil(moveBullets
  //       .filter(({bulletX, bulletY}) => distanceBetweenPoints(rockPosition.x, rockPosition.y, bulletX, bulletY) < 50)
  //       .map(({bulletX, bulletY}) => {
  //         // new Elem(svg, "rect")
  //         // .attr("x", bulletX).attr("y", bulletY)
  //         // .attr("width", 2).attr("height", 2)
  //         // .attr("fill", "lime");
          
  //         rock.elem.parentNode!.removeChild(rock.elem);
  //         $("circle").remove();
  //       })
  //       .filter(() => size > 15)
        // .map(_ => {
        //   const newSize = size / 2,
        //         angle = getRandomInt(0, 359),
        //         xChange = newSize * Math.sin(degToRad(30)),
        //         yChange = newSize * Math.cos(degToRad(30)),
        //         newPoints = `${-xChange},${-yChange} ${xChange},${-yChange} ${newSize},${0} ${xChange},${yChange} ${-xChange},${yChange} ${-newSize},${0}`;

        //   new Elem(svg, "polygon")
        //     .attr("points", newPoints)
        //     .attr("style","fill:black; stroke:cyan; stroke-width:1")
        //     .attr("transform", "translate("+(rockPosition.x + (newSize * Math.sin(degToRad(60))))+" "+(rockPosition.y + (newSize * Math.cos(degToRad(60))))+") rotate("+angle+")")

        //   new Elem(svg, "polygon")
        //     .attr("points", newPoints)
        //     .attr("style","fill:black; stroke:cyan; stroke-width:1")
        //     .attr("transform", "translate("+(rockPosition.x - (newSize * Math.sin(degToRad(60))))+" "+(rockPosition.y + (newSize * Math.cos(degToRad(60))))+") rotate("+angle+")")

        //   new Elem(svg, "polygon")
        //     .attr("points", newPoints)
        //     .attr("style","fill:black; stroke:cyan; stroke-width:1")
        //     .attr("transform", "translate("+rockPosition.x+" "+(rockPosition.y - newSize)+") rotate("+angle+")")
        // })
  //       ))
  //     .subscribe(() => {})


}


function destroyBullet(svg: HTMLElement) {
  let bullets = svg.getElementsByTagName("circle");
  if (bullets.length > 0) {
    svg.removeChild(bullets[0]);
  }
}

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


// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
