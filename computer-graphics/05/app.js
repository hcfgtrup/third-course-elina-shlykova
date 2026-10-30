const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scale = 15;

const COLS = 40;
const ROWS = 30;
let grid = [];

const polygon = [
  {x: 5, y: 5}, {x: 30, y: 5}, {x: 30, y: 10}, {x: 15, y: 10},
  {x: 15, y: 25}, {x: 35, y: 25}, {x: 35, y: 28}, {x: 5, y: 28}, 
  {x: 5, y: 20}, {x: 10, y: 20}, {x: 10, y: 15}, {x: 5, y: 15}
];

function initGrid() {
  grid = Array.from({length: ROWS}, () => Array(COLS).fill(0));
}

function drawLine(x1, y1, x2, y2) {
  let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
  let sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  
  while (true) {
    if (x1 >= 0 && x1 < COLS && y1 >= 0 && y1 < ROWS) {
      grid[y1][x1] = 1;
    }
    if (x1 === x2 && y1 === y2) break;
    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x1 += sx; }
    if (e2 < dx) { err += dx; y1 += sy; }
  }
}

function drawPolygon() {
  initGrid();
  for (let i = 0; i < polygon.length; i++) {
    let p1 = polygon[i];
    let p2 = polygon[(i + 1) % polygon.length];
    drawLine(p1.x, p1.y, p2.x, p2.y);
  }
  render();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x] === 1) {
        ctx.fillStyle = 'black';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      } else if (grid[y][x] === 2) {
        ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  ctx.strokeStyle = '#eee';
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x * scale, 0); ctx.lineTo(x * scale, ROWS * scale); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * scale); ctx.lineTo(COLS * scale, y * scale); ctx.stroke();
  }
}

function floodFill(startX, startY) {
  if (startX < 0 || startX >= COLS || startY < 0 || startY >= ROWS) return;
  if (grid[startY][startX] !== 0) return;

  const stack = [{x: startX, y: startY}];
  
  while (stack.length > 0) {
    let {x, y} = stack.pop();
    
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) continue;
    if (grid[y][x] !== 0) continue;
    
    grid[y][x] = 2;
    
    stack.push({x: x + 1, y});
    stack.push({x: x - 1, y});
    stack.push({x, y: y + 1});
    stack.push({x, y: y - 1});
  }
  render();
}

function scanlineFill() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x] === 2) grid[y][x] = 0;
    }
  }

  let minY = Math.min(...polygon.map(p => p.y));
  let maxY = Math.max(...polygon.map(p => p.y));

  for (let y = minY; y <= maxY; y++) {
    let intersections = [];

    for (let i = 0; i < polygon.length; i++) {
      let p1 = polygon[i];
      let p2 = polygon[(i + 1) % polygon.length];

      if (p1.y === p2.y) continue;

      let yMin = Math.min(p1.y, p2.y);
      let yMax = Math.max(p1.y, p2.y);

      if (y >= yMin && y < yMax) {
        let x = p1.x + ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y);
        intersections.push(x);
      }
    }

    intersections.sort((a, b) => a - b);

    for (let i = 0; i < intersections.length; i += 2) {
      let xStart = Math.ceil(intersections[i]);
      let xEnd = Math.floor(intersections[i + 1]);

      for (let x = xStart; x <= xEnd; x++) {
        if (grid[y][x] === 0) {
          grid[y][x] = 2;
        }
      }
    }
  }
  render();
}

document.getElementById('drawPoly').addEventListener('click', drawPolygon);
document.getElementById('clearBtn').addEventListener('click', () => { initGrid(); render(); });
document.getElementById('scanlineBtn').addEventListener('click', scanlineFill);

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / scale);
  const y = Math.floor((e.clientY - rect.top) / scale);
  floodFill(x, y);
});

initGrid();
drawPolygon();