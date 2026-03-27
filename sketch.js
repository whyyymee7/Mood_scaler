function drawTimeline() {
  let history = JSON.parse(localStorage.getItem("moodHistory")) || [];
  if (history.length < 2) return;

  let x0 = 480, y0 = 520, w = 380, h = 130;
  let x1 = x0 + w;
  let y1 = y0 - h;

  // Рамка графика
  stroke(255, 40);
  noFill();
  rect(x0, y1, w, h, 8);

  // Сетка
  stroke(255, 20);
  strokeWeight(0.5);
  for (let yVal = 1; yVal <= 10; yVal++) {
    let y = map(yVal, 1, 10, y0, y1);
    line(x0, y, x1, y);
  }
  for (let xIdx = 0; xIdx <= 4; xIdx++) {
    let x = map(xIdx, 0, 4, x0, x1);
    line(x, y0, x, y1);
  }

  // Подписи значений настроения (1, 5, 10)
  textSize(9);
  fill(150);
  noStroke();
  for (let yVal of [1, 5, 10]) {
    let y = map(yVal, 1, 10, y0, y1);
    text(yVal, x0 - 15, y + 3);
  }

  // Линия с плавными изгибами
  stroke(0, 200, 255);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < history.length; i++) {
    let x = map(i, 0, history.length - 1, x0, x1);
    let y = map(history[i].value, 1, 10, y0, y1);
    curveVertex(x, y);
  }
  endShape();

  // Заливка под линией (полупрозрачная)
  beginShape();
  vertex(x0, y0);
  for (let i = 0; i < history.length; i++) {
    let x = map(i, 0, history.length - 1, x0, x1);
    let y = map(history[i].value, 1, 10, y0, y1);
    vertex(x, y);
  }
  vertex(x1, y0);
  endShape(CLOSE);
  fill(0, 200, 255, 30);
  noStroke();

  // Точки и подписи времени
  for (let i = 0; i < history.length; i++) {
    let x = map(i, 0, history.length - 1, x0, x1);
    let y = map(history[i].value, 1, 10, y0, y1);

    noStroke();
    fill(0, 200, 255);
    ellipse(x, y, 5);

    fill(200);
    textSize(10);
    let timeStr = formatTime(new Date(history[i].time));
    text(timeStr, x - 15, y0 + 12);
  }
}
