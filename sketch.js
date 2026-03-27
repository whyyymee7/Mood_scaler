<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Эмоциональное поле</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
  <style>
    body {
      margin: 0;
      background: #080812;
      font-family: 'Courier New', monospace;
      overflow: hidden;
    }
    canvas {
      display: block;
    }
  </style>
</head>
<body>
<script>
let mood = 5;
let targetMood = 5;

let particles = [];
let imprints = [];

let moodTips = [
  "Попробуй сделать паузу и вдохнуть глубоко",
  "Лёгкая разминка или прогулка помогут поднять настроение",
  "Слушай любимую музыку",
  "Попробуй выполнить маленькое приятное дело",
  "Вдохни и сосредоточься на себе",
  "Пиши свои мысли, это помогает понять чувства",
  "Общение с другом поднимет настроение",
  "Сделай что-то творческое",
  "Подумай о своих достижениях",
  "Радуй себя и делай то, что любишь"
];

let moodNames = [
  "Очень плохо","Плохо","Грустно","Нейтрально",
  "Спокойно","Нормально","Хорошо","Очень хорошо","Отлично","Эйфория"
];

let textAlpha = 0;
let images = [];

let lastMoodChangeTime = 0;
let showImage = false;
let imageScale = 0;
let imageAlpha = 0;

let input;

// ---------- preload ----------
function preload() {
  for (let i = 0; i < 10; i++) {
    images[i] = loadImage(`https://i.imgur.com/${["Eb3yJuZ","MUPcf8u","V4dPbG0","5Qfr5cu","yBhbB1u","35fri81","fGu9peL","nL73OdJ","NmvBzjZ","s9eNcR5"][i]}.png`);
  }
}

// ---------- setup ----------
function setup() {
  createCanvas(900, 550);

  input = createInput("");
  input.position(30, 45);
  input.attribute('placeholder', 'Введите 1–10 и нажмите Enter');
  styleInput(input);

  input.elt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleMoodInput();
  });

  for (let i = 0; i < 220; i++) {
    particles.push(new Particle());
  }
}

// ---------- draw ----------
function draw() {
  background(8, 8, 18);

  mood = lerp(mood, targetMood, 0.05);
  textAlpha = lerp(textAlpha, 255, 0.05);

  // эффекты частиц
  let chaos = map(mood, 1, 10, 0.3, 2.5);
  let spread = map(mood, 1, 10, 0.2, 1.2);

  blendMode(ADD);
  for (let p of particles) {
    p.update(chaos, spread);
    p.display();
  }
  blendMode(BLEND);

  // отпечатки
  for (let i = imprints.length - 1; i >= 0; i--) {
    imprints[i].update();
    imprints[i].display();
    if (imprints[i].life <= 0) imprints.splice(i, 1);
  }

  // задержка картинки
  if (lastMoodChangeTime > 0 && millis() - lastMoodChangeTime > 5000) {
    showImage = true;
  }

  if (showImage) {
    imageScale = lerp(imageScale, 1, 0.05);
    imageAlpha = lerp(imageAlpha, 255, 0.05);
    drawMoodImage();
  }

  drawTimeline();
  drawUI();
}

// ---------- handle input ----------
function handleMoodInput() {
  let val = int(input.value());

  if (!isNaN(val) && val >= 1 && val <= 10) {
    targetMood = val;
    lastMoodChangeTime = millis();
    showImage = false;
    imageScale = 0;
    imageAlpha = 0;
    textAlpha = 0;

    saveMood(val);
    imprints.push(new Imprint(random(width), random(height), val));

    input.value('');
  }
}

// ---------- save ----------
function saveMood(value) {
  let history = JSON.parse(localStorage.getItem("moodHistory")) || [];
  history.push({ value: value, time: Date.now() });
  if (history.length > 15) history.shift();
  localStorage.setItem("moodHistory", JSON.stringify(history));
}

// ---------- particle ----------
class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.offset = random(1000);
    this.size = random(2, 4);
  }

  update(chaos, spread) {
    // шумовое движение по экрану
    this.x += (noise(this.offset, frameCount * 0.01) - 0.5) * spread * 200;
    this.y += (noise(this.offset + 100, frameCount * 0.01) - 0.5) * spread * 200;

    // небольшая рандомизация
    this.x += random(-chaos, chaos);
    this.y += random(-chaos, chaos);

    // реакция на мышь
    let d = dist(this.x, this.y, mouseX, mouseY);
    if (d < 120) {
      this.x += (this.x - mouseX) * 0.02;
      this.y += (this.y - mouseY) * 0.02;
    }

    // границы
    if (this.x < 0 || this.x > width) this.x = random(width);
    if (this.y < 0 || this.y > height) this.y = random(height);
  }

  display() {
    let r = map(mood, 1, 10, 80, 255);
    let g = map(mood, 1, 10, 80, 180);
    let b = map(mood, 1, 10, 180, 255);
    noStroke();
    fill(r, g, b, 60);
    ellipse(this.x, this.y, this.size);
  }
}

// ---------- imprint ----------
class Imprint {
  constructor(x, y, moodValue) {
    this.x = x;
    this.y = y;
    this.mood = moodValue;
    this.life = 255;
    this.size = random(60, 120);
  }

  update() {
    this.life -= 1;
  }

  display() {
    let r = map(this.mood, 1, 10, 80, 255);
    let g = map(this.mood, 1, 10, 80, 180);
    let b = map(this.mood, 1, 10, 180, 255);
    noFill();
    stroke(r, g, b, this.life);
    ellipse(this.x, this.y, this.size);
  }
}

// ---------- timeline (упрощённый, без времени) ----------
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

  // Минимальные подписи (только для ориентира)
  fill(150);
  textSize(10);
  text("1", x0 - 12, map(1, 1, 10, y0, y1) + 3);
  text("10", x0 - 15, map(10, 1, 10, y0, y1) + 3);

  // Линия
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

  // Точки
  for (let i = 0; i < history.length; i++) {
    let x = map(i, 0, history.length - 1, x0, x1);
    let y = map(history[i].value, 1, 10, y0, y1);
    noStroke();
    fill(0, 200, 255);
    ellipse(x, y, 5);
  }
}

// ---------- mood image ----------
function drawMoodImage() {
  let img = images[constrain(targetMood-1,0,9)];
  push();
  imageMode(CENTER);
  tint(255, imageAlpha);
  translate(width/2, height/2);
  scale(imageScale);
  image(img, 0, 0, 230, 230);
  pop();
}

// ---------- UI ----------
function drawUI() {
  let idx = constrain(targetMood-1, 0, 9);
  fill(255, textAlpha);
  textSize(16);
  text("ЭМОЦИОНАЛЬНОЕ ПОЛЕ", 30, height-70);

  fill(180);
  textSize(12);
  text("Введите настроение (1–10) и нажмите Enter", 30, 30);

  textSize(18);
  fill(255);
  text("Настроение: " + moodNames[idx], 30, height-40);

  fill(120, 200, 255);
  textSize(14);
  text(moodTips[idx], 30, height-15);
}

// ---------- style ----------
function styleInput(input) {
  input.style('background', '#0a0a0a');
  input.style('color', '#fff');
  input.style('border', '1px solid #333');
  input.style('padding', '8px');
  input.style('font-size', '14px');
}
</script>
</body>
</html>
