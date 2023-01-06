class Grid {
  constructor(rectangles) {
    // optimize
    this.GRID_SIZE = Math.ceil(Math.sqrt(rectangles.length) / 10);

    this.maxX = Math.max(...rectangles.flatMap(([x0, _, x1]) => [x0, x1]));
    this.maxY = Math.max(...rectangles.flatMap(([_, y0, __, y1]) => [y0, y1]));

    this.CELL_SIZE = Math.ceil(
      (Math.max(this.maxX, this.maxY) + 1) / this.GRID_SIZE
    );

    this.grid = Array.from({ length: this.GRID_SIZE }, (_) =>
      Array.from({ length: this.GRID_SIZE }, (_) => ({
        rectangles: [],
        full: false,
        area: 0,
      }))
    );

    for (const rectangle of rectangles) {
      const left = this.getX(rectangle[0]);
      const bottom = this.getY(rectangle[1]);
      const right = this.getX(rectangle[2]);
      const top = this.getY(rectangle[3]);

      for (let y = left; y <= right; y++) {
        for (let x = bottom; x <= top; x++) {
          if (this.grid[y][x].full) {
            continue;
          }

          if (x !== left && x !== right && y !== bottom && y !== top) {
            this.grid[y][x].full = true;
            this.grid[y][x].area = this.CELL_SIZE ** 2;
            continue;
          }

          const intersection = this.getIntersection(
            rectangle,
            this.getGridShape(x, y)
          );

          if (intersection) {
            this.grid[y][x].rectangles.push(intersection);
          }
        }
      }
    }
  }

  calculate() {
    let totalArea = 0;

    for (let y = 0; y < this.GRID_SIZE; y++) {
      for (let x = 0; x < this.GRID_SIZE; x++) {
        if (this.grid[y][x].full) totalArea += this.grid[y][x].area;
        else totalArea += calculate2(this.grid[y][x].rectangles);
      }
    }

    return totalArea;
  }

  getX(x) {
    return Math.floor(x / this.CELL_SIZE);
  }

  getY(y) {
    return Math.floor(y / this.CELL_SIZE);
  }

  getGridShape(x, y) {
    return [
      x * this.CELL_SIZE,
      y * this.CELL_SIZE,
      (x + 1) * this.CELL_SIZE,
      (y + 1) * this.CELL_SIZE,
    ];
  }

  getIntersection(rectangle1, rectangle2) {
    const left = Math.max(rectangle1[0], rectangle2[0]);
    const right = Math.min(rectangle1[2], rectangle2[2]);
    const bottom = Math.max(rectangle1[1], rectangle2[1]);
    const top = Math.min(rectangle1[3], rectangle2[3]);

    if (left >= right || bottom >= top) {
      return false;
    }

    return [left, bottom, right, top];
  }
}

function calculate(rectangles) {
  if (rectangles.length === 0) return 0;
  if (rectangles.length === 1)
    return (
      (rectangles[0][2] - rectangles[0][0]) *
      (rectangles[0][3] - rectangles[0][1])
    );
  console.time("calculate");

  const grid = new Grid(rectangles);

  console.timeLog("calculate", "grid initialized");

  const area = grid.calculate();

  console.timeEnd("calculate");

  return area;
}

function calculate2(rectangles) {
  if (rectangles.length === 0) return 0;
  if (rectangles.length === 1)
    return (
      (rectangles[0][2] - rectangles[0][0]) *
      (rectangles[0][3] - rectangles[0][1])
    );

  let totalArea = rectangles.reduce(
    (acc, v) => acc + (v[2] - v[0]) * (v[3] - v[1]),
    0
  );

  rectangles.sort((a, b) => a[0] - b[0]);

  let foundIntersection = true;

  while (foundIntersection) {
    foundIntersection = false;

    for (let i = 0; i < rectangles.length; i++) {
      for (let j = i + 1; j < rectangles.length; j++) {
        const intersection = getIntersection(rectangles[i], rectangles[j]);

        if (intersection) {
          totalArea -=
            (intersection[2] - intersection[0]) *
            (intersection[3] - intersection[1]);
          foundIntersection = true;

          rectangles = rectangles.concat(
            splitRectangle(rectangles[i], intersection)
          );
          rectangles.splice(i, 1);

          break;
        }
      }

      if (foundIntersection) {
        break;
      }
    }
  }

  return totalArea;
}

function getIntersection(rectangle1, rectangle2) {
  const left = Math.max(rectangle1[0], rectangle2[0]);
  const right = Math.min(rectangle1[2], rectangle2[2]);
  const bottom = Math.max(rectangle1[1], rectangle2[1]);
  const top = Math.min(rectangle1[3], rectangle2[3]);

  if (left >= right || bottom >= top) {
    return false;
  }

  return [left, bottom, right, top];
}

function splitRectangle(rectangle, intersection) {
  const pieces = [];

  if (intersection[0] > rectangle[0]) {
    pieces.push([rectangle[0], rectangle[1], intersection[0], rectangle[3]]);
  }

  if (intersection[2] < rectangle[2]) {
    pieces.push([intersection[2], rectangle[1], rectangle[2], rectangle[3]]);
  }

  if (intersection[1] > rectangle[1]) {
    pieces.push([
      intersection[0],
      rectangle[1],
      intersection[2],
      intersection[1],
    ]);
  }

  if (intersection[3] < rectangle[3]) {
    pieces.push([
      intersection[0],
      intersection[3],
      intersection[2],
      rectangle[3],
    ]);
  }

  return pieces;
}

console.time("q");

const Test = require("@codewars/test-compat");

// Test.assertEquals(calculate([]), 0, "calculate([]) should return 0");

// Test.assertEquals(
//   calculate([[0, 0, 1, 1]]),
//   1,
//   "calculate([[0,0,1,1]]) should return 1"
// );

// Test.assertEquals(
//   calculate([[0, 4, 11, 6]]),
//   22,
//   "calculate([[0, 4, 11, 6]]]) should return 22"
// );

// Test.assertEquals(
//   calculate([
//     [0, 0, 1, 1],
//     [1, 1, 2, 2],
//   ]),
//   2,
//   "calculate([[0,0,1,1], [1,1,2,2]]) should return 2"
// );

// Test.assertEquals(
//   calculate([
//     [0, 0, 1, 1],
//     [0, 0, 2, 2],
//   ]),
//   4,
//   "calculate([[0,0,1,1], [0,0,2,2]]) should return 4"
// );
// Test.assertEquals(
//   calculate([
//     [3, 3, 8, 5],
//     [6, 3, 8, 9],
//     [11, 6, 14, 12],
//   ]),
//   36,
//   "calculate([[3,3,8,5], [6,3,8,9],[11,6,14,12]]) should return 36"
// );

// const rectangles = [];
// for (let i = 0; i < 10000; i++) {
//   rectangles.push([i, i, 1000 + i, 1000 + i]);
// }

// Test.assertEquals(
//   calculate(rectangles),
//   20988001,
//   "calculate(dohuya) should return 20988001"
// );

// Test.assertEquals(
//   calculate([
//     [1, 7, 3, 10],
//     [1, 8, 3, 9],
//   ]),
//   6,
//   "1 under 2"
// );
// Test.assertEquals(
//   calculate([
//     [6, 7, 9, 10],
//     [7, 8, 8, 9],
//   ]),
//   9,
//   "nested"
// );
// Test.assertEquals(
//   calculate([
//     [1, 7, 4, 10],
//     [2, 7, 4, 9],
//     [3, 7, 4, 9],
//   ]),
//   9,
//   "nested 2"
// );
// Test.assertEquals(
//   calculate([
//     [1, 1, 4, 3],
//     [2, 2, 3, 4],
//   ]),
//   7,
//   "intersection up"
// );
// Test.assertEquals(
//   calculate([
//     [5, 0, 7, 3],
//     [6, 1, 8, 2],
//   ]),
//   7,
//   "intersetion right"
// );
// Test.assertEquals(
//   calculate([
//     [9, 0, 11, 2],
//     [10, 1, 12, 3],
//   ]),
//   7,
//   "intersection up right"
// );
// Test.assertEquals(
//   calculate([
//     [13, 1, 16, 3],
//     [14, 0, 15, 2],
//   ]),
//   7,
//   "intersection down"
// );
// Test.assertEquals(
//   calculate([
//     [17, 1, 19, 3],
//     [18, 0, 20, 2],
//   ]),
//   7,
//   "intersection down right"
// );
// Test.assertEquals(
//   calculate([
//     [13, 5, 15, 6],
//     [14, 4, 16, 7],
//   ]),
//   7,
//   "intersection of the entire right side"
// );
// Test.assertEquals(
//   calculate([
//     [1, 3, 4, 6],
//     [2, 1, 5, 4],
//     [3, 2, 6, 5],
//   ]),
//   20,
//   "intersection 3 rect"
// );
// Test.assertEquals(
//   calculate([
//     [1, 1, 2, 2],
//     [2, 1, 3, 2],
//     [3, 1, 4, 2],
//     [1, 2, 2, 3],
//     [2, 2, 3, 3],
//     [3, 2, 4, 3],
//     [1, 3, 2, 4],
//     [2, 3, 3, 4],
//     [3, 3, 4, 4],
//   ]),
//   9,
//   "3*3"
// );
// Test.assertEquals(
//   calculate([
//     [1, 1, 6, 6],
//     [1, 3, 4, 6],
//     [2, 3, 4, 6],
//     [2, 4, 5, 6],
//     [3, 5, 4, 6],
//   ]),
//   25,
//   "intersection"
// );
// Test.assertEquals(
//   calculate([
//     [1, 1, 6, 6],
//     [2, 1, 6, 6],
//     [3, 1, 6, 6],
//     [4, 1, 6, 6],
//     [5, 2, 6, 5],
//   ]),
//   25,
//   "shift right"
// );
// Test.assertEquals(
//   calculate([
//     [1, 1, 7, 6],
//     [2, 2, 8, 7],
//     [3, 3, 9, 8],
//     [4, 4, 10, 9],
//     [5, 5, 11, 10],
//   ]),
//   70,
//   "shift right down"
// );
// Test.assertEquals(
//   calculate([
//     [1, 4, 5, 6],
//     [2, 5, 6, 7],
//     [3, 6, 7, 8],
//     [4, 7, 8, 9],
//     [2, 3, 6, 5],
//     [3, 2, 7, 4],
//     [4, 1, 8, 3],
//   ]),
//   38,
//   "wings"
// );
// Test.assertEquals(
//   calculate([
//     [9, 5, 12, 6],
//     [10, 4, 11, 7],
//   ]),
//   5,
//   "intersection cross"
// );
// Test.assertEquals(
//   calculate([
//     [7, 1, 11, 7],
//     [8, 0, 12, 3],
//     [8, 4, 13, 5],
//     [9, 5, 14, 8],
//     [10, 2, 15, 6],
//   ]),
//   53,
//   "intersection 2"
// );
// Test.assertEquals(
//   calculate([
//     [1, 2, 6, 6],
//     [1, 3, 5, 5],
//     [1, 1, 7, 7],
//   ]),
//   36,
//   "pyramid"
// );
// Test.assertEquals(
//   calculate([
//     [1, 2, 3, 7],
//     [2, 1, 7, 3],
//     [6, 2, 8, 7],
//     [2, 6, 7, 8],
//     [4, 4, 5, 5],
//   ]),
//   37,
//   "circle"
// );
// Test.assertEquals(
//   calculate([
//     [1, 1, 2, 2],
//     [1, 1, 2, 2],
//     [1, 1, 2, 2],
//     [1, 1, 2, 2],
//     [1, 1, 2, 2],
//     [1, 1, 2, 2],
//   ]),
//   1,
//   "one"
// );
// Test.assertEquals(
//   calculate([
//     [3, 3, 6, 5],
//     [4, 4, 6, 6],
//     [4, 3, 7, 5],
//     [4, 2, 8, 5],
//     [4, 3, 8, 6],
//     [9, 0, 11, 4],
//     [9, 1, 10, 6],
//     [9, 0, 12, 2],
//     [10, 1, 13, 5],
//     [12, 4, 15, 6],
//     [14, 1, 16, 5],
//     [12, 1, 17, 2],
//   ]),
//   52,
//   "very hard!"
// );
// Test.assertEquals(
//   calculate([
//     [2, 2, 17, 2],
//     [2, 2, 17, 4],
//     [2, 2, 17, 6],
//     [2, 2, 17, 8],
//     [2, 2, 17, 10],
//     [2, 2, 17, 12],
//     [2, 2, 17, 14],
//     [2, 2, 17, 16],
//     [2, 2, 17, 18],
//     [2, 2, 17, 20],
//     [2, 2, 17, 22],
//     [2, 2, 17, 24],
//     [2, 2, 17, 26],
//     [2, 2, 17, 28],
//   ]),
//   390,
//   "waterfall"
// );

console.timeEnd("q");
