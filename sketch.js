
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
  
  createCanvas(w, canvasHeight);
  
  //Create canvas
  
  console.log("canvasSize", canvasSize)
  console.log("gridDivsX", gridDivsX )
  console.log("gridDivsY", gridDivsY)
  console.log("baseTriangleHeight",baseTriangleHeight)
  console.log("distanceFromYVertex", distanceFromYVertex)
  console.log("YdistanceFromSideVertex", YdistanceFromSideVertex)      
  console.log("XdistanceFromSideVertex", XdistanceFromSideVertex)  
  
  // here we populate the 2d boolean array and corresponding center location
  bools = [];
  for(let x = 0; x<gridDivsX; x++){
    var column = [];
    for(let y = 0; y<gridDivsY; y++){
      column.push(1);
    }    
    bools.push(column);
  }

  // Since they are not regularly space - We use this array to keep track of triangle centers.
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
      column.push([x_pos, y_pos]);
    }
    centers.push(column);
  }

  triangleSizesConsidered = [1, 2, 3]
  maxAttempts = 800

  constructIrregularTriangleGrid_1(triangleSizesConsidered, maxAttempts)

  background(0);
  stroke(255);
  strokeWeight(1);
  noFill()
  drawGrid()
  markEmptySpots()
}

function randomElement(arr){
  return arr[(Math.floor(Math.random() * arr.length))]
}

function is_triangle_inverted(i,j){
  // Given a position (i,j) in our triangle grid, tells us if its pointing up or down.
  return ((i+j) %2) == 1
}

function getTriangleCoordinate(cx, cy, inverted, size, buffer){
  size = size-buffer
  let [x1, x2, x3] = [cx-size/2, cx, cx+size/2]

  a = size/(2*cos(PI/6))
  b = tan(PI/6)*size/2
  sign = (1-inverted)*2-1

  y1 = cy+sign*b 
  y3 = cy+sign*b 
  y2 = cy-sign*a
  //console.log('coordinates', [x1, y1, x2, y2, x3, y3])
  return [x1, y1, x2, y2, x3, y3]
  
}

function computeBaseTriangleInfo(){
  for(let x = 0; x<gridDivsX; x++){
    for(let y = 0; y<gridDivsY; y++){
      is_inverted = is_triangle_inverted(x,y)
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
      triangleInfo.push([x1, y1, x2, y2, x3, y3])
    }
  }
}

function enumerateBaseTriangle(i,j,size){
  /*
  given a grid index i,j corresponding a corner of the triangle and the size of triangle,
    enumerates all the base triangle that are part of it.
  */
  lst = [[i,j]]
  is_inverted = is_triangle_inverted(i,j)

  for(let s=1; s<size; s++){
    ydelta = -s*is_inverted+s*(1-is_inverted)
    lst.push([i,j+ydelta])
    // Condition was x<=size at some point and that gave quirky shapes
    for(let xdelta = 1; xdelta<=s; xdelta++){
      lst.push([i+xdelta,j+ydelta]) 
      lst.push([i-xdelta,j+ydelta]) // I forgot that line at some point and it gave cool looking overlap
    }
  }
  return lst
}

function getTriangleCenter(i, j, size){
  /*
  
  Like the function enumerateBaseTriangle, this functions assumes that i,j describes the grid location of the top or bottom corner of a triangle of a given size.
    
  h: total height of a triangle, b: distance between center and closest triangle edge, a = h-b
  here f(x) is the vertical delta between j and the center of a triangle of size s which has triangle i,j as a corner.
  
  s|x|f(x)
  1 0 0
  2 1 2b
  3 2 2b  a | b + h
  4 3 2b 2a | 2h
  5 4 4b 2a | 2b + 2h
  6 5 4b 3a | b + 3h
  7 6 4b 4a | 4h    
    7 6b 4a
  
  */
  
  [x, y] = centers[i][j] 
  sign = (1-is_triangle_inverted(i,j))*2-1
  offset = Math.ceil((size-1)/3)*2*YdistanceFromSideVertex+(size-1-Math.ceil((size-1)/3))*distanceFromYVertex
  console.log('size', Math.ceil((size-1)/3))
  console.log('center', sign, offset, x, y)
  return [x, y+sign*offset]
}

function getEmptyTriangles(){
  empties = []
  for(let x = 0; x<gridDivsX; x++){
    for(let y = 0; y<gridDivsY; y++){
      if (bools[x][y]){
        empties.push([x, y])
      }
    }
  }
  return empties
}

function constructIrregularTriangleGrid_1(sizesArr, max_attempts){
  nattempts = 0
  ntriangles = 0
  while (bools.some(arr => arr.includes(1))){
      // random sample from empty
      let [x, y] = randomElement(getEmptyTriangles())
      size = random(sizesArr)
      console.log(x, y, size)
      fits = true
      // enumerate all positions
      positions = enumerateBaseTriangle(x, y, size)
      console.log(positions)
      // check if within bounds
      if(positions.some(a => a[0]<0 | a[1]<0 | a[0]>=gridDivsX | a[1]>=gridDivsY)){
        fits = false
      }
      if(fits){
        for(let i = 0; i < positions.length; i++){
          if (!bools[positions[i][0]][positions[i][1]]){            
            fits = false
            break
          }          
        }
      }
        
      if (fits){
        for(let i = 0; i < positions.length; i++){
          console.log('positions', i , positions[i])
          bools[positions[i][0]][positions[i][1]] = 0
        }
        let [cx, cy] = getTriangleCenter(x,y,size)
        triangleInfo.push(getTriangleCoordinate(cx, cy, is_triangle_inverted(x, y) ,size*baseTriangleWidth, 0.15*baseTriangleWidth))
        ntriangles += 1
      }
      nattempts +=1
      if (nattempts == max_attempts){
        break
      }
  }  
}


function drawGrid(){
  for(let n = 0; n<triangleInfo.length; n++){
    let [x1, y1, x2, y2, x3, y3] = triangleInfo[n]
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

