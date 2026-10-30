const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scale = 10;

const INSIDE = 0;
const LEFT   = 1;
const RIGHT  = 2;
const BOTTOM = 4;
const TOP    = 8;

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

function getCode(x, y, rect) {
  let code = INSIDE;
  if (x < rect.xmin) code |= LEFT;
  else if (x > rect.xmax) code |= RIGHT;
  if (y < rect.ymin) code |= TOP;
  else if (y > rect.ymax) code |= BOTTOM;
  return code;
}

function codeToBinary(code) {
  return code.toString(2).padStart(4, '0');
}

function clipLine(x1, y1, x2, y2, rect) {
  let code1 = getCode(x1, y1, rect);
  let code2 = getCode(x2, y2, rect);
  let accepted = false;

  const steps = []; 
  let stepNum = 0;

  while (true) {
    steps.push({
      step: stepNum++,
      x1, y1, code1,
      x2, y2, code2,
      action: 'проверка'
    });

    if ((code1 | code2) === 0) {
      steps[steps.length - 1].action = 'ACCEPT';
      accepted = true;
      break;
    }

    if ((code1 & code2) !== 0) {
      steps[steps.length - 1].action = 'REJECT';
      break;
    }

    const codeOut = code1 !== 0 ? code1 : code2;
    let x, y;
    let intersection = '';

    if (codeOut & TOP) {
      intersection = 'TOP';
      const t = (rect.ymin - y1) / (y2 - y1);
      x = x1 + t * (x2 - x1);
      y = rect.ymin;
    } else if (codeOut & BOTTOM) {
      intersection = 'BOTTOM';
      const t = (rect.ymax - y1) / (y2 - y1);
      x = x1 + t * (x2 - x1);
      y = rect.ymax;
    } else if (codeOut & RIGHT) {
      intersection = 'RIGHT';
      const t = (rect.xmax - x1) / (x2 - x1);
      x = rect.xmax;
      y = y1 + t * (y2 - y1);
    } else {
      intersection = 'LEFT';
      const t = (rect.xmin - x1) / (x2 - x1);
      x = rect.xmin;
      y = y1 + t * (y2 - y1);
    }

    steps[steps.length - 1].action = `пересечение ${intersection}`;

    if (codeOut === code1) {
      x1 = x;
      y1 = y;
      code1 = getCode(x1, y1, rect);
    } else {
      x2 = x;
      y2 = y;
      code2 = getCode(x2, y2, rect);
    }
  }

  return { accepted, result: accepted ? { x1, y1, x2, y2 } : null, steps };
}

function renderSteps(steps) {
  const tbody = document.querySelector('#stepsTable tbody');
  tbody.innerHTML = '';
  steps.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.step}</td>
      <td>(${s.x1.toFixed(1)}, ${s.y1.toFixed(1)})</td>
      <td>${codeToBinary(s.code1)}</td>
      <td>(${s.x2.toFixed(1)}, ${s.y2.toFixed(1)})</td>
      <td>${codeToBinary(s.code2)}</td>
      <td>${s.action}</td>
    `;
    tbody.appendChild(tr);
  });
}

function getRect() {
  return {
    xmin: parseFloat(document.getElementById('xmin').value),
    xmax: parseFloat(document.getElementById('xmax').value),
    ymin: parseFloat(document.getElementById('ymin').value),
    ymax: parseFloat(document.getElementById('ymax').value)
  };
}

function clearCanvas() {
  ctx.fillStyle = '#f9f9f9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSingleLine() {
  clearCanvas();

  const rect = getRect();
  if (rect.xmin >= rect.xmax || rect.ymin >= rect.ymax) {
    document.getElementById('status').textContent = 'Ошибка: xmin < xmax и ymin < ymax';
    return;
  }

  const x1 = parseFloat(document.getElementById('x1').value);
  const y1 = parseFloat(document.getElementById('y1').value);
  const x2 = parseFloat(document.getElementById('x2').value);
  const y2 = parseFloat(document.getElementById('y2').value);

  drawRect(rect, 'blue');
  drawLine(x1, y1, x2, y2, 'gray');

  const code1 = getCode(x1, y1, rect);
  const code2 = getCode(x2, y2, rect);
  document.getElementById('codes').textContent =
    `A: ${codeToBinary(code1)}\nB: ${codeToBinary(code2)}`;

  const res = clipLine(x1, y1, x2, y2, rect);

  if (res.accepted) {
    drawLine(Math.round(res.result.x1), Math.round(res.result.y1), Math.round(res.result.x2), Math.round(res.result.y2), 'red');
    document.getElementById('status').textContent = 'Отрезок принят и отсечён';
  } else {
    document.getElementById('status').textContent = 'Отрезок полностью отброшен';
  }

  renderSteps(res.steps);
}

function drawPolyline() {
  clearCanvas();
  const rect = getRect();
  drawRect(rect, 'blue');

  const points = [
    { x: 2, y: 5 },
    { x: 12, y: 2 },
    { x: 20, y: 18 },
    { x: 30, y: 8 },
    { x: 36, y: 22 }
  ];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    drawLine(p1.x, p1.y, p2.x, p2.y, 'gray');

    const res = clipLine(p1.x, p1.y, p2.x, p2.y, rect);
    if (res.accepted) {
      drawLine(Math.round(res.result.x1), Math.round(res.result.y1), Math.round(res.result.x2), Math.round(res.result.y2), 'red');
    }
  }
  document.getElementById('status').textContent = 'Ломаная отсечена';
  document.getElementById('codes').textContent = '';
  document.querySelector('#stepsTable tbody').innerHTML = '';
}

function randomTest() {
  clearCanvas();
  const rect = getRect();
  drawRect(rect, 'blue');

  let accepted = 0, clipped = 0, rejected = 0;

  for (let i = 0; i < 50; i++) {
    const x1 = Math.round(Math.random() * 50 - 5);
    const y1 = Math.round(Math.random() * 40 - 5);
    const x2 = Math.round(Math.random() * 50 - 5);
    const y2 = Math.round(Math.random() * 40 - 5);

    const res = clipLine(x1, y1, x2, y2, rect);

    if (res.accepted) {
      drawLine(x1, y1, x2, y2, 'lightgray');
      drawLine(Math.round(res.result.x1), Math.round(res.result.y1), Math.round(res.result.x2), Math.round(res.result.y2), 'red');

      if (res.result.x1 === x1 && res.result.y1 === y1 &&
          res.result.x2 === x2 && res.result.y2 === y2) {
        accepted++;
      } else {
        clipped++;
      }
    } else {
      rejected++;
    }
  }

  document.getElementById('status').textContent =
    `Принято без изменения: ${accepted} | Отсечено: ${clipped} | Отброшено: ${rejected}`;
  document.getElementById('codes').textContent = '';
  document.querySelector('#stepsTable tbody').innerHTML = '';
}

document.getElementById('drawBtn').addEventListener('click', drawSingleLine);
document.getElementById('polylineBtn').addEventListener('click', drawPolyline);
document.getElementById('randomBtn').addEventListener('click', randomTest);

drawSingleLine();