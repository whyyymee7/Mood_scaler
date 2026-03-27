let mood = 5;
let targetMood = 5;
let particles = [];
let moodHistory = [];

let images = [];

let lastMoodChangeTime = 0;
let showImage = false;
let imageScale = 0;
let imageAlpha = 0;

let inputField;

// тексты
let moodTexts = [
  "Полный упадок",
  "Очень плохо",
  "Низкое состояние",
  "Легкая апатия",
  "Нейтрально",
  "Нормально",
  "Хорошо",
  "Очень хорошо",
  "Отлично",
  "Эйфория"
];

let moodAdvice = [
  "Отдохни и замедлись",
  "Поговори с кем-то",
  "Смени обстановку",
  "Сделай маленькое действие",
  "Просто наблюдай",
  "Продолжай в том же темпе",
  "Используй энергию",
  "Действуй активно",
  "Лови момент",
  "Создавай максимум"
];

function preload() {
  images = [
    loadImage('https://i.imgur.com/B4rsCjc.png'),
    loadImage('https://i.imgur.com/Eb3yJuZ.png'),
    loadImage('https://i.imgur.com/V4dPbG0.png'),
    loadImage('https://i.imgur.com/5Qfr5cu.png'),
    loadImage('https://i.imgur.com/yBhbB1u.png'),
    loadImage('https://i.imgur.com/35fri81.png'),
    loadImage('https://i.imgur.com/fGu9peL.png'),
    loadImage('https://i.imgur.com/nL73OdJ.png'),
    loadImage('https://i.imgur.com/NmvBzjZ.png'),
    loadImage('https://i.imgur.com/s9eNcR5.png')
  ];
}

function setup() {
  createCanvas(900, 550);

  inputField = createInput("");
  inputField.position(30, 30);
  inputField.attribute('placeholder', 'Введите 1–10 и нажмите Enter');
  styleInput(inputField);

  inputField.elt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      let val = int(inputField.value());

      if (val >= 1 && val <= 10) {
        targetMood = val;
        lastMoodChangeTime = millis();

        // СБРОС визуала (ВАЖНО)
        showImage = false;
        imageScale = 0;
        imageAlpha = 0;

        let now = new Date();

        moodHistory.push({
          mood: val,
          time: now.getTime(),
          label: now.toLocaleTimeString().slice(0,5)
        });

        inputField.value("");
      }
    }
  });

  for (let i = 0; i < 200; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  background(10, 10, 20);

  mood = lerp(mood, targetMood, 0.05);

  // частицы
  for (let p of particles) {
    p.update();
    p.display();
  }

  // ПОЯВЛЕНИЕ КАРТИНКИ ЧЕРЕЗ 5 СЕК
  if (millis() - lastMoodChangeTime > 5000) {
    showImage = true;
  }

  if (showImage) {
    imageScale = lerp(imageScale, 1, 0.05);
    imageAlpha = lerp(imageAlpha, 255, 0.05);
    drawImage();
  }

  drawGraph();
  drawTextInfo();
}

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(height);
    this.offset = random(1000);
  }

  update() {
    let speed = map(mood, 1, 10, 0.5, 2);

    this.x += noise(this.offset, frameCount * 0.01) * speed - speed/2;
    this.y += noise(this.offset + 100, frameCount * 0.01) * speed - speed/2;

    // если улетела — возвращаем
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.reset();
    }
  }

  display() {
    let r = map(mood, 1, 10, 100, 255);
    let b = map(mood, 1, 10, 255, 100);

    fill(r, 120, b, 150);
    noStroke();
    circle(this.x, this.y, 3);
  }
}

function drawImage() {
  let idx = constrain(floor(mood) - 1, 0, 9);

  push();
  imageMode(CENTER);
  tint(255, imageAlpha);
  translate(width/2, height/2);
  scale(imageScale);
  image(images[idx], 0, 0, 220, 220);
  pop();
}

function drawGraph() {
  let w = 320;
  let h = 140;
  let x0 = width - w - 20;
  let y0 = height - h - 20;

  let maxPoints = 15;
  let data = moodHistory.slice(-maxPoints);

  if (data.length < 2) return;

  noStroke();
  fill(15, 15, 30, 200);
  rect(x0, y0, w, h, 12);

  stroke(0, 200, 255);
  strokeWeight(2);
  noFill();
  beginShape();

  for (let i = 0; i < data.length; i++) {
    let x = map(i, 0, maxPoints - 1, x0 + 10, x0 + w - 10);
    let y = map(data[i].mood, 1, 10, y0 + h - 20, y0 + 10);
    vertex(x, y);
  }

  endShape();

  for (let i = 0; i < data.length; i++) {
    let x = map(i, 0, maxPoints - 1, x0 + 10, x0 + w - 10);
    let y = map(data[i].mood, 1, 10, y0 + h - 20, y0 + 10);

    fill(0, 255, 255);
    noStroke();
    circle(x, y, 5);
  }

  noFill();
  stroke(100);
  rect(x0, y0, w, h, 12);
}

function drawTextInfo() {
  let idx = constrain(floor(mood) - 1, 0, 9);

  fill(255);
  textSize(16);
  text("Настроение: " + floor(mood), 30, 90);

  textSize(14);
  fill(180);
  text(moodTexts[idx], 30, 115);

  fill(120, 200, 255);
  text(moodAdvice[idx], 30, 140);
}

function styleInput(input) {
  input.style('background', '#0a0a0a');
  input.style('color', '#fff');
  input.style('border', '1px solid #333');
  input.style('padding', '8px');
  input.style('font-size', '14px');
}
