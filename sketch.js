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
  "Очень плохо","Плохо","Немного грустно","Нейтрально",
  "Слегка бодро","Хорошо","Очень хорошо","Отлично","Эйфория","Великолепно"
];

let textAlpha = 0;
let images = [];

let lastMoodChangeTime = 0;
let showImage = false;
let imageScale = 0;
let imageAlpha = 0;

let input;
let topMargin = 20;
let sideMargin = 20;
let textSpacing = 8;

// -------------------- preload --------------------
function preload() {
  const imgIds = ["Eb3yJuZ","MUPcf8u","V4dPbG0","5Qfr5cu","yBhbB1u","35fri81","fGu9peL","nL73OdJ","NmvBzjZ","s9eNcR5"];
  for (let i = 0; i < 10; i++) {
    images[i] = loadImage(`https://i.imgur.com/${imgIds[i]}.png`);
  }
}

// -------------------- setup --------------------
function setup() {
  createCanvas(windowWidth, windowHeight);

  localStorage.removeItem("moodHistory");

  input = createInput("");
  styleInput(input);
  input.attribute('placeholder', '1–10');
  positionInput();

  input.elt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleMoodInput();
  });

  for (let i = 0; i < 220; i++) particles.push(new Particle());

  lastMoodChangeTime = millis();
}

// -------------------- draw --------------------
function draw() {
  mood = lerp(mood, targetMood, 0.03);
  textAlpha = lerp(textAlpha, 255, 0.05);

  background(10, 10, 20);

  if (millis() - lastMoodChangeTime > 5000) showImage = true;

  let chaos = map(mood, 1, 10, 0.3, 1.8);
  let speed = map(mood, 1, 10, 0.1, 0.5);
  let spread = map(mood, 1, 10, 0.2, 1);

  blendMode(ADD);
  for (let p of particles) {
    p.update(chaos, speed, spread);
    p.display();
  }
  blendMode(BLEND);

  for (let i = imprints.length - 1; i >= 0; i--) {
    imprints[i].update();
    imprints[i].display();
    if (imprints[i].life <= 0) imprints.splice(i, 1);
  }

  drawTimeline();
  drawUI();

  if (showImage) {
    imageScale = lerp(imageScale, 1, 0.05);
    imageAlpha = lerp(imageAlpha, 255, 0.05);
    drawMoodImage(imageScale, imageAlpha);
  }
}

// -------------------- handle input --------------------
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
    input.value('');
  }
}

// -------------------- save mood --------------------
function saveMood(value) {
  let history = JSON.parse(localStorage.getItem("moodHistory")) || [];
  history.push(value);
  if (history.length > 30) history.splice(0, history.length - 30);
  localStorage.setItem("moodHistory", JSON.stringify(history));
}

// -------------------- classes --------------------
class Imprint {
  constructor(x, y, moodValue) {
    this.x = x;
    this.y = y;
    this.mood = moodValue;
    this.life = 255;
    this.size = random(50, 120);
  }
  update() { this.life -= 0.4; }
  display() {
    let r = map(this.mood, 1, 10, 120, 255);
    let b = map(this.mood, 1, 10, 255, 120);
    noFill();
    stroke(r, 100, b, this.life);
    ellipse(this.x, this.y, this.size);
  }
}

class Particle {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.offset = random(1000);
    this.size = random(2, 5);
  }
  update(chaos, speed, spread) {
    let t = frameCount * 0.01 * speed;
    let tx = width/2 + (noise(this.offset + t)-0.5)*width*spread;
    let ty = height/2 + (noise(this.offset + 100 + t)-0.5)*height*spread;
    this.x = lerp(this.x, tx, 0.02);
    this.y = lerp(this.y, ty, 0.02);
    this.x += random(-chaos, chaos);
    this.y += random(-chaos, chaos);
  }
  display() {
    let r = map(mood, 1, 10, 120, 255);
    let b = map(mood, 1, 10, 255, 120);
    noStroke();
    fill(r, 100, b, 40);
    ellipse(this.x, this.y, this.size);
  }
}

// -------------------- timeline --------------------
function drawTimeline() {
  let history = JSON.parse(localStorage.getItem("moodHistory")) || [];
  if (history.length < 1) return;

  let x0 = width - 400, y0 = height - 30, w = 380, h = 130;
  stroke(255, 40);
  noFill();
  rect(x0, y0 - h, w, h);

  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = "cyan";

  stroke(0, 200, 255);
  strokeWeight(2);
  noFill();

  beginShape();
  for (let i = 0; i < history.length; i++) {
    let x = map(i, 0, 29, x0, x0 + w);
    let y = map(history[i], 1, 10, y0, y0 - h);
    curveVertex(x, y);
  }
  endShape();

  drawingContext.shadowBlur = 0;

  for (let i = 0; i < history.length; i++) {
    let x = map(i, 0, 29, x0, x0 + w);
    let y = map(history[i], 1, 10, y0, y0 - h);
    noStroke();
    fill(0, 200, 255);
    ellipse(x, y, 4);
  }
}

// -------------------- mood image --------------------
function drawMoodImage(scaleVal, alphaVal) {
  let img = images[constrain(targetMood - 1, 0, 9)];
  push();
  imageMode(CENTER);
  tint(255, alphaVal);
  translate(width/2, height/2);
  scale(scaleVal);
  image(img, 0, 0, 220, 220);
  pop();
}

// -------------------- UI --------------------
function drawUI() {
  let moodIndex = constrain(targetMood - 1, 0, 9);

  let textX = sideMargin;
  let textY = input.y + input.height + textSpacing;

  fill(255, 180);
  textSize(18);
  text("Настроение: " + moodNames[moodIndex], textX, textY);

  fill(180, textAlpha);
  textSize(14);
  text(moodTips[moodIndex], textX, textY + 25);
}

// -------------------- style input --------------------
function styleInput(input) {
  input.style('background', '#0a0a0a');
  input.style('color', '#fff');
  input.style('border', '1px solid #333');
  input.style('padding', '6px');
  input.style('font-size', '16px');
}

// -------------------- position input --------------------
function positionInput() {
  input.position(sideMargin, topMargin);
}

// -------------------- resize --------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  positionInput();
}
