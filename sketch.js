let mood = 5;
let targetMood = 5;
let particles = [];
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
  "Очень плохо", "Плохо", "Немного грустно", "Нейтрально",
  "Слегка бодро", "Хорошо", "Очень хорошо", "Отлично", "Эйфория", "Великолепно"
];

let images = [];
let lastMoodChangeTime = 0;
let showImage = false;
let imageScale = 0;
let imageAlpha = 0;
let textAlpha = 0;

function preload() {
  for (let i = 1; i <= 10; i++) {
    images[i-1] = loadImage(`images/mood${i}.jpg`);
  }
}

function setup() {
  createCanvas(900, 550);

  let input = select('#moodInput');
  input.input(() => {
    let val = int(input.value());
    if (val >= 1 && val <= 10) {
      targetMood = val;
      lastMoodChangeTime = millis();
      showImage = false;
      imageScale = 0;
      imageAlpha = 0;
      input.value(''); // очищаем поле сразу после ввода
    }
  });

  for (let i = 0; i < 220; i++) {
    particles.push(new Particle());
  }

  lastMoodChangeTime = millis();
}

function draw() {
  mood = lerp(mood, targetMood, 0.03);
  textAlpha = lerp(textAlpha, 255, 0.05);
  background(10, 10, 20);

  if (millis() - lastMoodChangeTime > 5000) {
    showImage = true;
  }

  let chaos = map(mood, 1, 10, 0.3, 1.8);
  let speed = map(mood, 1, 10, 0.1, 0.5);
  let pull = map(mood, 1, 10, 0.01, 0.05);
  let spread = map(mood, 1, 10, 0.2, 1);

  for (let p of particles) {
    p.update(chaos, speed, pull, spread);
    p.display();
  }

  drawUI();

  if (showImage) {
    imageScale = lerp(imageScale, 1, 0.05);
    imageAlpha = lerp(imageAlpha, 255, 0.05);
    drawMoodImage(imageScale, imageAlpha);
  }
}

class Particle {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.offset = random(1000);
    this.size = random(2, 5);
    this.targetX = random(width);
    this.targetY = random(height);
  }

  update(chaos, speed, pull, spread) {
    let t = frameCount * 0.01 * speed;
    this.targetX = width/2 + (noise(this.offset + frameCount*0.01)-0.5)*width*spread;
    this.targetY = height/2 + (noise(this.offset + 100 + frameCount*0.01)-0.5)*height*spread;
    this.x = lerp(this.x, this.targetX, 0.02);
    this.y = lerp(this.y, this.targetY, 0.02);
    this.x += map(noise(this.offset, t), 0, 1, -chaos, chaos);
    this.y += map(noise(this.offset + 100, t), 0, 1, -chaos, chaos);
  }

  display() {
    let r = map(mood, 1, 10, 120, 255);
    let b = map(mood, 1, 10, 255, 120);
    let pulse = sin(frameCount * 0.03) * 2;
    noStroke();
    for (let i = 3; i > 0; i--) {
      fill(r, 80, b, 15);
      ellipse(this.x, this.y, this.size * i * 2 + pulse);
    }
    fill(r, 150, b, 180);
    ellipse(this.x, this.y, this.size + pulse);
  }
}

function drawMoodImage(scaleVal, alphaVal) {
  let moodIndex = constrain(floor(mood) - 1, 0, 9);
  let img = images[moodIndex];
  push();
  imageMode(CENTER);
  tint(255, alphaVal);
  translate(width/2, height/2);
  scale(scaleVal);
  image(img, 0, 0, 200, 200);
  pop();
}

function drawUI() {
  let moodIndex = constrain(floor(mood) - 1, 0, 9);
  fill(255, textAlpha);
  textSize(16);
  text("ЭМОЦИОНАЛЬНОЕ ПОЛЕ", 30, height - 70);
  textSize(18);
  text("Настроение: " + moodNames[moodIndex], 30, height - 40);
  fill(180, textAlpha);
  textSize(14);
  text(moodTips[moodIndex], 30, height - 15);
}
