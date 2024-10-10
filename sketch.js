let triangleInfo = []


function setup() {
  randomSeed(0);

  // Set p5js colors in global space
  Colors()
  Palettes()

  // Set colors
  PALETTE = PAL_PLAGE
  PRIMARY_COLOR = PALETTE[0]
  SECONDARY_COLOR = PALETTE[1]
  TERTIARY_COLOR = PALETTE[2]


  imageHeight = 1024;
  imageWidth = 1024;

  border_padding_size = 85 // 1/12 of image
  canvasHeight = imageHeight - 2 * border_padding_size;
  canvasWidth = imageWidth - 2 * border_padding_size;

  // number of rows of the grid
  gridDivsX = 25;



  // Triangle components - Everything is computed as fraction; assumes that the canvas is a 1x1 square
  baseTriangleWidth = 2 / gridDivsX
  distanceFromYVertex = baseTriangleWidth / (2 * cos(PI / 6))
  YdistanceFromSideVertex = tan(PI / 6) * baseTriangleWidth / 2
  baseTriangleHeight = distanceFromYVertex + YdistanceFromSideVertex

  //Number of rows and canvas height is determined dynamically
  gridDivsY = Math.floor(1 / baseTriangleHeight);

  //Create canvas
  createCanvas(imageWidth, imageHeight);

  // Algorithm params
  triangleSizesConsidered = [1, 2, 3, 4]
  triangleSizesProbabilities = [0.2, 0.3, 0.4, 0.1]
  //triangleSizesConsidered = [1, 2, 3]
  //triangleSizesProbabilities = [1/3, 1/3, 1/3]
  
  startWithABigOne = false // TODO Either false or int. If int make sure the first placed triangle is of that size
  maxAttempts = 600
  add_only_adjacent = false
  allow_left_overlap = true // Allows new triangles to overlap the left side of other triangles
  spacing_size = 0.15


  constructIrregularTriangleGrid_1(triangleSizesConsidered, triangleSizesProbabilities, maxAttempts, add_only_adjacent, allow_left_overlap, spacing_size)

  // Display params
  only_draw_contour = false //TODO
  

  // Draw
  // background(220);
  background(0);
  stroke(255);
  strokeWeight(1);
  noFill()
  drawGrid()
  //markEmptySpots()
}


function is_triangle_inverted(i, j) {
  // Given a position (i,j) in our triangle grid, tells us if its pointing up or down.
  if ((i + j) < 0) {
    return ((i + j) % 2) == -1
  }
  return ((i + j) % 2) == 1
}

function enumerateAllBaseTriangles(i, j, size) {
  /*
  Given a position and a size, enumerates all the base triangle that are part of it.
    (i, j)  the grid index corresponding the top or bottom corner of the triangle (as opposed to the left and right corners)
    size : integer - the size of triangle relative to a base triangle,

  */
  lst = [[i, j]]
  is_inverted = is_triangle_inverted(i, j)

  for (let s = 1; s < size; s++) {
    ydelta = -s * is_inverted + s * (1 - is_inverted)
    lst.push([i, j + ydelta])
    // Condition was x<=size at some point and that gave quirky shapes
    for (let xdelta = 1; xdelta <= s; xdelta++) {
      lst.push([i + xdelta, j + ydelta])
      lst.push([i - xdelta, j + ydelta]) // I forgot that line at some point and it gave cool looking overlap
    }
  }
  return lst
}

function enumerateSideBaseTriangles(i, j, size) {
  /*
  Enumerate base triangles
  TODO: Make right side
  */
  lst = [[i, j]]
  is_inverted = is_triangle_inverted(i, j)

  for (let s = 1; s < size; s++) {
    ydelta = -s * is_inverted + s * (1 - is_inverted)
    lst.push([i, j + ydelta])
    for (let xdelta = 1; xdelta <= s; xdelta++) {
      lst.push([i + xdelta, j + ydelta])
    }
  }
  return lst
}

function getEmptyTriangles() {
  empties = []
  for (let x = 0; x < gridDivsX; x++) {
    for (let y = 0; y < gridDivsY; y++) {
      if (is_spot_empty[x][y]) {
        empties.push([x, y])
      }
    }
  }
  return empties
}

const Coordinates = {
  getTriangleCenter: function (i, j, size) {
    /*

    Like the function enumerateAllBaseTriangles, this functions assumes that i,j describes the grid location of the top or bottom corner of a triangle of a given size.

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
    8 7 6b 4a

    */

    const isEvenY = (j % 2 === 0);
    const isEvenX = (i % 2 === 0);
    x = i * baseTriangleWidth / 2 + baseTriangleWidth / 4
    y = j * baseTriangleHeight + (isEvenY ? (isEvenX ? distanceFromYVertex : YdistanceFromSideVertex) : (isEvenX ? YdistanceFromSideVertex : distanceFromYVertex));
    sign = (1 - is_triangle_inverted(i, j)) * 2 - 1
    offset = Math.ceil((size - 1) / 3) * 2 * YdistanceFromSideVertex + (size - 1 - Math.ceil((size - 1) / 3)) * distanceFromYVertex

    return [x, y + sign * offset]
  },

  getTriangleCorners: function(x, y, grid_size, spacing) {
    /*
    spacing: percentage indicating how much to reduce the actual triangle size by as to produce a spacing between them
    */
    let size = (grid_size-spacing)*baseTriangleWidth
    let [cx, cy] = Coordinates.getTriangleCenter(x, y, grid_size)
    let is_inverted = is_triangle_inverted(x, y)
    let [x1, x2, x3] = [cx - size / 2, cx, cx + size / 2]
  
    a = size / (2 * cos(PI / 6))
    b = tan(PI / 6) * size / 2
    sign = (1 - is_inverted) * 2 - 1
  
    y1 = cy + sign * b
    y3 = cy + sign * b
    y2 = cy - sign * a

    return [x1, y1, x2, y2, x3, y3]
  },
  
  getBorderTriangleCorners: function(x, y, grid_size, spacing, left) {

    let size = (grid_size-spacing)*baseTriangleWidth
    let [cx, cy] = Coordinates.getTriangleCenter(x, y, grid_size)
    let is_inverted = is_triangle_inverted(x, y)
  
    if (left) {
      [x1, x2, x3] = [cx, cx, cx + size / 2]
    } else {
      [x1, x2, x3] = [cx - size / 2, cx, cx]
    }
    a = size / (2 * cos(PI / 6))
    b = tan(PI / 6) * size / 2
    sign = (1 - is_inverted) * 2 - 1 // -1 if inverted, else 1
  
    y1 = cy + sign * b
    y3 = cy + sign * b
    y2 = cy - sign * a
    return [x1, y1, x2, y2, x3, y3]
  }
}

function sampleColor(){
  return Probabilities.getRandomItemWithProbability([PRIMARY_COLOR, SECONDARY_COLOR, TERTIARY_COLOR, PALETTE[3]], [0.25, 0.5, 0.15, 0.1])
}

function constructIrregularTriangleGrid_1(sizesArr, sizesProbs, max_attempts, add_only_adjacent, allow_left_overlap, spacing_size) {
  
  is_spot_empty = create_2d_array(gridDivsX, gridDivsY, true);
  nattempts = 0
  ntriangles = 0

  // This queue allow you to specify which triangle you want to draw. Can be useful for debugging
  to_draw = [];
  //to_draw = [[0,0], [0,1], [0, 2], [0,3]];//, [1, 1], [1,0]];
  //max_attempts = 40;

  while (true) {

    // Break conditions
    if (!is_spot_empty.some(arr => arr.includes(true))){
      console.log("Grid filled.");
      break;
    } else if (nattempts == max_attempts) {
      console.log("Max attempts reached");
      break;
    }

    let x, y;

    if (to_draw.length == 0){
      // Take a random sample from a non-filled location
      [x, y] = Probabilities.randomElement(getEmptyTriangles());
      grid_size = Probabilities.getRandomItemWithProbability(sizesArr, sizesProbs);
    } else {
      // to draw queue
      let obj = to_draw.pop();
      x = obj[0];
      y = obj[1];
      grid_size = 1;
    }
    

    // Enumerate all base positions covered by this potential triangle
    positions = enumerateAllBaseTriangles(x, y, grid_size)
    fits = true

    // Check if within bounds
    if (positions.some(a => a[0] < 0 | a[1] < 0 | a[0] >= gridDivsX | a[1] >= gridDivsY)) {
      fits = false
    }

    // Check if space is already occupied by a placed triangle
    if (fits) {
      for (let i = 0; i < positions.length; i++) {
        if (!is_spot_empty[positions[i][0]][positions[i][1]]) {
          fits = false
          break
        }
      }
    }

    // If applicable, check if adjacent to a placed triangle
    if (add_only_adjacent && ntriangles > 0) {
      // TODO
    }

    
    // It checks all the criteria, add triangle
    if (fits) {
      // Mark spots as used
      for (let i = 0; i < positions.length; i++) {
        is_spot_empty[positions[i][0]][positions[i][1]] = false
      }

      // Compute position on canvas and features
      corners = Coordinates.getTriangleCorners(x, y, grid_size, spacing_size)
      sampled_color = sampleColor()

      // Write triangle info
      triangleInfo.push(corners.concat([sampled_color]))
      ntriangles += 1
    }
    nattempts += 1
  }

  
  // Add border triangles TODO: Only if map is filled
  if (true){
    size = 1

    for (let y = 0; y < gridDivsY; y++) {
      for (let x of [-1, gridDivsX]) {
        let left = (x === -1)
        corners = Coordinates.getBorderTriangleCorners(x, y, size, spacing_size, left)
        
        triangleInfo.push(corners.concat([sampleColor()]));
      }
    }
  }
}


function drawGrid() {

  for (let n = 0; n < triangleInfo.length; n++) {

    // Retrieve triangle coordinates
    let [x1, y1, x2, y2, x3, y3, color] = triangleInfo[n]

    if (only_draw_contour){
      //TODO
    } else {
      fill(color)
    }

    // Draw
    triangle(x1 * canvasWidth + border_padding_size, y1 * canvasHeight + border_padding_size,
      x2 * canvasWidth + border_padding_size, y2 * canvasHeight + border_padding_size,
      x3 * canvasWidth + border_padding_size, y3 * canvasHeight + border_padding_size)

  }
}

function markEmptySpots(){
 for(let x = 0; x<gridDivsX; x++){
   for(let y = 0; y<gridDivsY; y++){
     if(is_spot_empty[x][y]){
       let [x_pos, y_pos] = Coordinates.getTriangleCenter(x, y, 1)
       point(x_pos * canvasWidth + border_padding_size,
             y_pos * canvasHeight + border_padding_size)
     }
   }
 }
}

