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
  "Пиши свои мысли",
  "Общение с другом поможет",
  "Сделай что-то творческое",
  "Подумай о достижениях",
  "Наслаждайся моментом"
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
  images[0] = loadImage("https://i.imgur.com/Eb3yJuZ.png");
  images[1] = loadImage("https://i.imgur.com/MUPcf8u.png");
  images[2] = loadImage("https://i.imgur.com/V4dPbG0.png");
  images[3] = loadImage("https://i.imgur.com/5Qfr5cu.png");
  images[4] = loadImage("https://i.imgur.com/yBhbB1u.png");
  images[5] = loadImage("https://i.imgur.com/35fri81.png");
  images[6] = loadImage("https://i.imgur.com/fGu9peL.png");
  images[7] = loadImage("https://i.imgur.com/nL73OdJ.png");
  images[8] = loadImage("https://i.imgur.com/NmvBzjZ.png");
  images[9] = loadImage("https://i.imgur.com/s9eNcR5.png");
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

  mood = lerp(mood, targetMood, 0.04);
  textAlpha = lerp(textAlpha, 255, 0.05);

  // частицы (glow)
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = "rgba(0,200,255,0.5)";

  for (let p of particles) {
    p.update();
    p.display();
  }

  drawingContext.shadowBlur = 0;

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

// ---------- input ----------
function handleMoodInput() {
  let val = int(input.value());

  if (!isNaN(val) && val >= 1 && val <= 10) {
    targetMood = val;

    saveMood(val);
    imprints.push(new Imprint(random(width), random(height), val));

    lastMoodChangeTime = millis();
    showImage = false;
    imageScale = 0;
    imageAlpha = 0;

    textAlpha = 0;

    input.value('');
  }
}

// ---------- save ----------
function saveMood(value) {
  let history = JSON.parse(localStorage.getItem("moodHistory")) || [];
  history.push({ value: value, time: Date.now() });
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

  update() {
    let speed = map(mood, 1, 10, 0.2, 1.2);

    this.x += noise(this.offset, frameCount * 0.01) * speed - speed/2;
    this.y += noise(this.offset + 100, frameCount * 0.01) * speed - speed/2;

    // реакция на мышь
    let d = dist(this.x, this.y, mouseX, mouseY);
    if (d < 120) {
      this.x += (this.x - mouseX) * 0.02;
      this.y += (this.y - mouseY) * 0.02;
    }

    // границы
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.x = random(width);
      this.y = random(height);
    }
  }

  display() {
    let r = map(mood, 1, 10, 120, 255);
    let b = map(mood, 1, 10, 255, 120);

    noStroke();
    fill(r, 120, b, 90);
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
    this.size = random(60, 130);
  }

  update() {
    this.life -= 1;
  }

  display() {
    let r = map(this.mood, 1, 10, 120, 255);
    let b = map(this.mood, 1, 10, 255, 120);

    noFill();
    stroke(r, 100, b, this.life);
    ellipse(this.x, this.y, this.size);
  }
}

// ---------- timeline ----------
function drawTimeline() {
  let history = JSON.parse(localStorage.getItem("moodHistory")) || [];
  if (history.length < 2) return;

  let data = history.slice(-15);

  let x0 = 480, y0 = 520, w = 380, h = 130;

  stroke(255, 40);
  noFill();
  rect(x0, y0 - h, w, h);

  stroke(0, 200, 255);
  strokeWeight(2);
  noFill();
  beginShape();

  for (let i = 0; i < data.length; i++) {
    let x = map(i, 0, 14, x0, x0 + w);
    let y = map(data[i].value, 1, 10, y0, y0 - h);
    curveVertex(x, y);
  }

  endShape();

  for (let i = 0; i < data.length; i++) {
    let x = map(i, 0, 14, x0, x0 + w);
    let y = map(data[i].value, 1, 10, y0, y0 - h);

    noStroke();
    fill(0, 200, 255);
    ellipse(x, y, 5);
  }
}

// ---------- image ----------
function drawMoodImage() {
  let img = images[constrain(targetMood - 1, 0, 9)];

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
  let idx = constrain(targetMood - 1, 0, 9);

  fill(255, textAlpha);
  textSize(16);
  text("EMOTIONAL FIELD", 30, height - 70);

  fill(180);
  textSize(12);
  text("Введите значение (1–10)", 30, 30);

  textSize(18);
  fill(255);
  text("Состояние: " + moodNames[idx], 30, height - 40);

  fill(120, 200, 255);
  textSize(14);
  text(moodTips[idx], 30, height - 15);
}

// ---------- style ----------
function styleInput(input) {
  input.style('background', '#0a0a0a');
  input.style('color', '#fff');
  input.style('border', '1px solid #333');
  input.style('padding', '8px');
  input.style('font-size', '14px');
}
