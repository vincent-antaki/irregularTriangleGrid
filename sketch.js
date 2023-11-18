let rectInfo = []
let triangleInfo = []

function setup(){
  randomSeed(0);

  w = min(windowWidth, windowHeight);
  createCanvas(w, w);

  // size of the padding between grid and sketch borders
  padding = w/12;

  // number of rows and columns of the grid
  gridDivsX = 15;
  gridDivsY = 15;

  // actual spacing between grid points
  gridSpacingX = (w - padding*2)/gridDivsX;
  gridSpacingY = (w - padding*2)/gridDivsY;

  // here we populate the 2d boolean array
  bools = [];

  for(let x = 0; x<gridDivsX; x++){
    var column = [];
    for(let y = 0; y<gridDivsY; y++){
      column.push(1);
    }
    bools.push(column);
  }

  // Draw triangle
  for(let x = 0; x<gridDivsX; x++){
    for(let y = 0; y<gridDivsY; y++){
      is_inverted = ((x+y) %2) == 1
      x1 = x
      y1 = y
      
      if (is_inverted){
        x2 = x1-0.5
        y2 = y1+1
        x3 = x2+1
        y3 = y2
      } else {
        x2 = x1+0.5
        y2 = y1+1       
        x3 = x1+1
        y3 = y1
      }
      console.log(x1, y1, x2, y2, x3, y3)
      triangleInfo.push([x1, y1, x2, y2, x3, y3])
    }
  }
  
  //constructIrregularGrid([2,3]);
  //construct([1,2,3])
  
  background(0);
  stroke(255);
  strokeWeight(4);
  noFill()
  drawGrid()
  markEmptySpots()
}

function makeRect(posX, posY, dimX, dimY){
  this.posX = posX;
  this.posY = posY;
  this.dimX = dimX;
  this.dimY = dimY;
}

function construct(sizesArr){
  console.log(bools.some(arr => arr.includes(1)))

  
  while (bools.some(arr => arr.includes(1))){
    
      x = Math.floor(random(gridDivsX))
      y = Math.floor(random(gridDivsY))
    
      xdim = random(sizesArr)
      ydim = random(sizesArr)
    
      fits = true

      console.log(x,y,xdim, ydim)
      // check if within bounds
      if(x + xdim > gridDivsX || y + ydim > gridDivsY){
        fits = false
      }

      // check if rectangle overlaps with any other rectangle
      if(fits){
        fits = !checkIfOverlap(x,y,xdim,ydim)
      }

      if(fits){
        addRect(x,y,xdim,ydim)
      }
          
      console.log(x,y,xdim, ydim, fits)
    
  }
  
}

function addRect(x,y,xdim,ydim){
      // mark area as occupied
      for(let xc = x; xc < x + xdim; xc++){
        for(let yc = y; yc < y + ydim; yc++){
          bools[xc][yc] = false
        }
      }

      rectInfo.push(new makeRect(x,y,xdim,ydim))
}

function checkIfOverlap(x,y,xdim,ydim){
  for(let xc = x; xc < x + xdim; xc++){
    for(let yc = y; yc < y + ydim; yc++){
      if(bools[xc][yc] == 0){
        return true
      }
    }
  }
  return false
}

function constructIrregularGrid(sizesArr){
  for(let x = 0; x<gridDivsX-max(sizesArr)+1; x++){
    for(let y = 0; y<gridDivsY-max(sizesArr)+1; y++){

      xdim = random(sizesArr)
      ydim = random(sizesArr)

      fits = true

      // check if within bounds
      if(x + xdim > gridDivsX || y + ydim > gridDivsY){
        fits = false
      }

      // check if rectangle overlaps with any other rectangle
      if(fits){
        fits = !checkIfOverlap(x,y,xdim,ydim)
      }

      if(fits){
        addRect(x,y,xdim,ydim)
      }
    }
  }
}

function drawGrid(){
  for(let n = 0; n<rectInfo.length; n++){
    r = rectInfo[n]
    rect(r.posX * gridSpacingX + padding, r.posY * gridSpacingY + padding,
          r.dimX * gridSpacingX, r.dimY * gridSpacingY)
  }
  
  console.log("triangleInfo")
  console.log(triangleInfo[0])
    console.log(triangleInfo[1])
  for(let n = 0; n<triangleInfo.length; n++){
    let [x1, y1, x2, y2, x3, y3] = triangleInfo[n]
    console.log(x1, y1, x2, y2, x3, y3)
    console.log(x1 * gridSpacingX + padding, y1 * gridSpacingY + padding,
             x2 * gridSpacingX + padding, y2 * gridSpacingY + padding, 
             x3 * gridSpacingX + padding, y3 * gridSpacingY + padding)
    triangle(x1 * gridSpacingX + padding, y1 * gridSpacingY + padding,
             x2 * gridSpacingX + padding, y2 * gridSpacingY + padding, 
             x3 * gridSpacingX + padding, y3 * gridSpacingY + padding)
    
  }
  
}

function markEmptySpots(){
  for(let x = 0; x<gridDivsX; x++){
    for(let y = 0; y<gridDivsY; y++){
      if(bools[x][y]){
        point(x * gridSpacingX + gridSpacingX/2 + padding,
              y * gridSpacingY + gridSpacingY/2 + padding)
      }
    }
  }
}
