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

  // 👉 ЧИСТИМ старые кривые данные автоматически
  localStorage.removeItem('moodData');

  inputField = createInput("");
  inputField.position(30, 30);
  inputField.attribute('placeholder', '1–10 + Enter');
  styleInput(inputField);

  inputField.elt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      let val = int(inputField.value());

      if (val >= 1 && val <= 10) {
        targetMood = val;
        lastMoodChangeTime = millis();

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

  for (let p of particles) {
    p.update();
    p.display();
  }

  if (millis() - lastMoodChangeTime > 3000) {
    showImage = true;
  }

  if (showImage) {
    imageScale = lerp(imageScale, 1, 0.05);
    imageAlpha = lerp(imageAlpha, 255, 0.05);
    drawImage();
  }

  drawGraph();

  drawCurrentValue();
}

class Particle {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.offset = random(1000);
  }

  update() {
    let speed = map(mood, 1, 10, 0.01, 0.05);
    this.x += noise(this.offset, frameCount * speed) * 4 - 2;
    this.y += noise(this.offset + 100, frameCount * speed) * 4 - 2;
  }

  display() {
    let r = map(mood, 1, 10, 100, 255);
    let b = map(mood, 1, 10, 255, 100);
    fill(r, 100, b, 150);
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
  image(images[idx], 0, 0, 200, 200);
  pop();
}

function drawGraph() {
  let w = 320;
  let h = 140;
  let x0 = width - w - 20;
  let y0 = height - h - 20;

  let now = Date.now();
  let timeWindow = 1000 * 60 * 3; // 3 минуты

  let visible = moodHistory.filter(p => now - p.time <= timeWindow);

  if (visible.length < 2) return;

  let minTime = now - timeWindow;

  // фон
  noStroke();
  fill(15, 15, 30, 200);
  rect(x0, y0, w, h, 12);

  // линия
  stroke(0, 200, 255);
  strokeWeight(2);
  noFill();
  beginShape();

  for (let p of visible) {
    let x = map(p.time, minTime, now, x0 + 10, x0 + w - 10);
    let y = map(p.mood, 1, 10, y0 + h - 20, y0 + 10);
    vertex(x, y);
  }

  endShape();

  // точки
  for (let p of visible) {
    let x = map(p.time, minTime, now, x0 + 10, x0 + w - 10);
    let y = map(p.mood, 1, 10, y0 + h - 20, y0 + 10);

    fill(0, 255, 255);
    noStroke();
    circle(x, y, 5);

    fill(180);
    textSize(10);
    text(p.label, x - 15, y0 + h - 5);
  }

  // рамка
  noFill();
  stroke(100);
  rect(x0, y0, w, h, 12);
}

function drawCurrentValue() {
  fill(255);
  textSize(16);
  text("Текущее настроение: " + floor(mood), 30, 80);
}

function styleInput(input) {
  input.style('background', '#0a0a0a');
  input.style('color', '#fff');
  input.style('border', '1px solid #333');
  input.style('padding', '6px');
}
