let rectInfo = []
let triangleInfo = []

function setup(){
  randomSeed(0);

  w = min(windowWidth-50, windowHeight-50);

  // size of the padding between grid and sketch borders
  padding = w/12;
  canvasSize = (w - padding*2)
  
  // number of rows and columns of the grid
  gridDivsX = 25;

  // Triangle components - Everything is computed as fraction; assumes that the canvas is a 1x1 square
  baseTriangleWidth = 2/gridDivsX
  distanceFromYVertex = baseTriangleWidth/(2*cos(PI/6))
  YdistanceFromSideVertex = tan(PI/6)*baseTriangleWidth/2
  XdistanceFromSideVertex = baseTriangleWidth/2
  baseTriangleHeight = distanceFromYVertex + YdistanceFromSideVertex

  //Number of rows and canvas height is determined dynamically
  gridDivsY = Math.floor(1/baseTriangleHeight);
  canvasHeight = gridDivsY*baseTriangleHeight*canvasSize+2*padding;
  
  //console.log(gridDivsY,baseTriangleHeight,canvasSize,2*padding)
  //console.log(w, canvasHeight)
  createCanvas(w, canvasHeight);
  
  //Create canvas
  
  console.log("canvasSize", canvasSize)
  console.log("nrows", gridDivsY)
  console.log("baseTriangleHeight",baseTriangleHeight)
  console.log("distanceFromYVertex", distanceFromYVertex)
  console.log("YdistanceFromSideVertex", YdistanceFromSideVertex)      
  console.log("XdistanceFromSideVertex", XdistanceFromSideVertex)
  baseTriangleHeight
  
  //Distance between triangle center 
  //gridSpacingX = baseTriangleWidth/2
  
  //gridSpacingY = (w - padding*2)/gridDivsY;

  
  
  // here we populate the 2d boolean array and corresponding center location
  bools = [];
  for(let x = 0; x<gridDivsX; x++){
    var column = [];
    for(let y = 0; y<gridDivsY; y++){
      column.push(1);
    }    
    bools.push(column);
  }

  // Since points are not regularly space - We use this array to keep track of triangle centers
  // Padding is not taken into account here
  centers = [];
  for(let x = 0; x<gridDivsX; x++){
    var column = [];
    for(let y = 0; y<gridDivsY; y++){
        x_pos = x*baseTriangleWidth/2 + baseTriangleWidth/4
      if (y%2 ==0){
        y_pos = y*baseTriangleHeight + (x%2 == 0)*distanceFromYVertex + (x%2 == 1)*YdistanceFromSideVertex
      } else {
        y_pos = y*baseTriangleHeight + (x%2 == 1)*distanceFromYVertex + (x%2 == 0)*YdistanceFromSideVertex
      }
      
      //console.log(x, y, x_pos, y_pos)
      column.push([x_pos, y_pos]);

    }
    centers.push(column);
  }

  
  // Draw triangle
  
  for(let x = 0; x<gridDivsX; x++){
    for(let y = 0; y<gridDivsY; y++){
      is_inverted = ((x+y) %2) == 1
      let [cx, cy] = centers[x][y]
      let [x1, x2, x3] = [cx-baseTriangleWidth/2, cx, cx+baseTriangleWidth/2]
      
      if (is_inverted){
        y1 = cy-YdistanceFromSideVertex 
        y3 = cy-YdistanceFromSideVertex 
        y2 = cy+distanceFromYVertex
      } else {
        y1 = cy+YdistanceFromSideVertex 
        y3 = cy+YdistanceFromSideVertex 
        y2 = cy-distanceFromYVertex
      }
      //console.log(x1, y1, x2, y2, x3, y3)
      triangleInfo.push([x1, y1, x2, y2, x3, y3])
    }
  }
  
  //constructIrregularGrid([2,3]);
  //construct([1,2,3])
  
  background(0);
  stroke(255);
  strokeWeight(1);
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
  
  for(let n = 0; n<triangleInfo.length; n++){
    let [x1, y1, x2, y2, x3, y3] = triangleInfo[n]
    //console.log(n, x1, y1, x2, y2, x3, y3)
     triangle(x1 * canvasSize + padding, y1 * canvasSize + padding,
             x2 * canvasSize + padding, y2 * canvasSize + padding, 
             x3 * canvasSize + padding, y3 * canvasSize + padding)
    
  }
  
}

function markEmptySpots(){
  for(let x = 0; x<gridDivsX; x++){
    for(let y = 0; y<gridDivsY; y++){
      if(bools[x][y]){
        let [x_pos, y_pos] = centers[x][y]
        point(x_pos * (w - padding*2) + padding,
              y_pos * (w - padding*2) + padding)
      }
    }
  }
}

