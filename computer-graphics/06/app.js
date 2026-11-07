const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scale = 10;

const polygon = [
  {x: 2, y: 5}, {x: 35, y: 5}, {x: 35, y: 25}, 
  {x: 20, y: 15}, {x: 2, y: 25}
];

let currentStage = 'original';

function putPixel(x, y, color = 'black') {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
}

function drawLine(x1, y1, x2, y2, color = 'black') {
  let dx = Math.abs(x2 - x1);
  let dy = Math.abs(y2 - y1);
  let sx = x1 < x2 ? 1 : -1;
  let sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    putPixel(x1, y1, color);
    if (x1 === x2 && y1 === y2) break;
    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x1 += sx; }
    if (e2 < dx) { err += dx; y1 += sy; }
  }
}

function drawRect(rect, color = 'blue') {
  for (let x = rect.xmin; x <= rect.xmax; x++) {
    putPixel(x, rect.ymin, color);
    putPixel(x, rect.ymax, color);
  }
  for (let y = rect.ymin; y <= rect.ymax; y++) {
    putPixel(rect.xmin, y, color);
    putPixel(rect.xmax, y, color);
  }
}

function drawPolygon(points, color = 'black') {
  if (points.length < 2) return;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    drawLine(Math.round(p1.x), Math.round(p1.y), Math.round(p2.x), Math.round(p2.y), color);
  }
}

function intersectVertical(a, b, xBoundary) {
  const t = (xBoundary - a.x) / (b.x - a.x);
  return {
    x: xBoundary,
    y: a.y + t * (b.y - a.y)
  };
}

function intersectHorizontal(a, b, yBoundary) {
  const t = (yBoundary - a.y) / (b.y - a.y);
  return {
    x: a.x + t * (b.x - a.x),
    y: yBoundary
  };
}

function clipAgainstBoundary(poly, isInside, getIntersection) {
  const output = [];
  if (poly.length === 0) return output;

  let s = poly[poly.length - 1];

  for (const p of poly) {
    const sInside = isInside(s);
    const pInside = isInside(p);

    if (sInside && pInside) {
      output.push(p);
    } else if (sInside && !pInside) {
      output.push(getIntersection(s, p));
    } else if (!sInside && pInside) {
      output.push(getIntersection(s, p));
      output.push(p);
    }
    s = p;
  }

  return output;
}

function clipPolygon(poly, rect) {
  let result = poly;

  const afterLeft = clipAgainstBoundary(result, p => p.x >= rect.xmin, (a, b) => intersectVertical(a, b, rect.xmin));
  const afterRight = clipAgainstBoundary(afterLeft, p => p.x <= rect.xmax, (a, b) => intersectVertical(a, b, rect.xmax));
  const afterTop = clipAgainstBoundary(afterRight, p => p.y >= rect.ymin, (a, b) => intersectHorizontal(a, b, rect.ymin));
  const afterBottom = clipAgainstBoundary(afterTop, p => p.y <= rect.ymax, (a, b) => intersectHorizontal(a, b, rect.ymax));

  return { afterLeft, afterRight, afterTop, afterBottom };
}

function formatPoints(points) {
  if (points.length === 0) return 'пусто';
  return points.map(p => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`).join(', ');
}

function renderTable(results) {
  const tbody = document.querySelector('#resultTable tbody');
  tbody.innerHTML = '';
  
  const stages = [
    { name: 'Исходный', data: polygon },
    { name: 'LEFT', data: results.afterLeft },
    { name: 'RIGHT', data: results.afterRight },
    { name: 'TOP', data: results.afterTop },
    { name: 'BOTTOM', data: results.afterBottom }
  ];

  stages.forEach(stage => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${stage.name}</td>
      <td>${stage.data.length}</td>
      <td>${formatPoints(stage.data)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function draw() {
  ctx.fillStyle = '#f9f9f9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rect = {
    xmin: parseFloat(document.getElementById('xmin').value),
    xmax: parseFloat(document.getElementById('xmax').value),
    ymin: parseFloat(document.getElementById('ymin').value),
    ymax: parseFloat(document.getElementById('ymax').value)
  };

  if (rect.xmin >= rect.xmax || rect.ymin >= rect.ymax) {
    alert('Ошибка: xmin < xmax и ymin < ymax');
    return;
  }

  drawRect(rect, 'blue');
  drawPolygon(polygon, 'gray');

  const results = clipPolygon(polygon, rect);
  renderTable(results);

  let toDraw = polygon;
  if (currentStage === 'left') toDraw = results.afterLeft;
  else if (currentStage === 'right') toDraw = results.afterRight;
  else if (currentStage === 'top') toDraw = results.afterTop;
  else if (currentStage === 'bottom') toDraw = results.afterBottom;

  if (toDraw.length > 0) {
    drawPolygon(toDraw, 'red');
  }
}

document.getElementById('drawBtn').addEventListener('click', draw);

document.getElementById('stageSelect').addEventListener('change', (e) => {
  currentStage = e.target.value;
  draw();
});

draw();