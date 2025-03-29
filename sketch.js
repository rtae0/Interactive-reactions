// 🎨 Hand Drawing + Eraser + Color Picker + Reaction Emojis

let dots = [];
let video;
let handPose;
let hands = [];
let erasing = false;
let currentColor = [0, 255, 0];
let lastDot = null;
let reactions = [];
let canDraw = true;

// UI Elements
let eraserBox = { x: 20, y: 400, w: 60, h: 60 };
let penBox = { x: 100, y: 400, w: 60, h: 60 };
let colorButtons = [
  { color: [255, 0, 0], x: 180, y: 400, w: 40, h: 40 },
  { color: [0, 0, 255], x: 230, y: 400, w: 40, h: 40 },
  { color: [0, 255, 0], x: 280, y: 400, w: 40, h: 40 }
];
let reactionButtons = [
  { emoji: '❤️', x: 20, y: 20, w: 40, h: 40 },
  { emoji: '👍', x: 70, y: 20, w: 40, h: 40 },
  { emoji: '😢', x: 120, y: 20, w: 40, h: 40 }
];
let showColorOptions = false;

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  dots = [];
  reactions = [];
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  frameRate(60);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  handPose.detectStart(video, gotHands);
  noStroke();
}

function draw() {
  image(video, 0, 0);
  drawUI();

  if (hands.length > 0) {
    let hand = hands[0];
    let index = hand.index_finger_tip;
    let thumb = hand.thumb_tip;
    let d = dist(index.x, index.y, thumb.x, thumb.y);
    let isPinched = d < 20;

    // If not pinched, re-enable drawing (for after color selection)
    if (!isPinched) {
      canDraw = true;
    }

    // Reaction buttons
    if (isPinched) {
      for (let btn of reactionButtons) {
        if (isInside(index, btn)) {
          spawnReactions(btn.emoji);
        }
      }
    }

    // Eraser button
    if (isPinched && isInside(index, eraserBox)) {
      erasing = true;
    }

    // Pen setting
    if (isPinched && isInside(index, penBox)) {
      showColorOptions = true;
    }

    // Color buttons
    if (showColorOptions && isPinched) {
      for (let btn of colorButtons) {
        if (isInside(index, btn)) {
          currentColor = btn.color;
          showColorOptions = false;
          erasing = false;
          canDraw = false; // prevent immediate drawing after color pick
        }
      }
    }

    if (erasing) {
      eraseDotsNear(index.x, index.y);
      lastDot = null;
    } else if (canDraw && isPinched && !isInside(index, penBox)) {
      if (lastDot) {
        let steps = int(dist(index.x, index.y, lastDot.x, lastDot.y) / 1);
        for (let i = 0; i <= steps; i++) {
          let x = lerp(lastDot.x, index.x, i / steps);
          let y = lerp(lastDot.y, index.y, i / steps);
          dots.push({ x, y, color: [...currentColor], size: 4 });
        }
      } else {
        dots.push({ x: index.x, y: index.y, color: [...currentColor], size: 4 });
      }
      lastDot = { x: index.x, y: index.y };
    } else {
      lastDot = null;
    }
  } else {
    lastDot = null;
  }

  // Draw dots
  for (let pt of dots) {
    fill(...pt.color);
    ellipse(pt.x, pt.y, pt.size);
  }

  // Draw reactions only if they exist
  if (reactions.length > 0) {
    for (let r of reactions) {
      textSize(r.size);
      text(r.emoji, r.x, r.y);
      r.y += r.speed;
      r.speed += 0.2;
      r.x += random(-0.5, 0.5);
    }
    reactions = reactions.filter(r => r.y < height + 100);
  }

  if (erasing && hands.length > 0) {
    let index = hands[0].index_finger_tip;
    fill(255, 0, 0, 100);
    ellipse(index.x, index.y, 30);
  }
}

function drawUI() {
  // Eraser button
  fill(255, 100, 100, 200);
  stroke(200, 0, 0);
  rect(eraserBox.x, eraserBox.y, eraserBox.w, eraserBox.h, 10);
  noStroke();
  fill(50);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("지우개", eraserBox.x + eraserBox.w / 2, eraserBox.y + eraserBox.h / 2);

  // Pen button
  fill(200);
  stroke(0);
  rect(penBox.x, penBox.y, penBox.w, penBox.h, 10);
  noStroke();
  fill(0);
  text("펜", penBox.x + penBox.w / 2, penBox.y + penBox.h / 2);

  // Color options
  if (showColorOptions) {
    for (let btn of colorButtons) {
      fill(...btn.color);
      stroke(0);
      rect(btn.x, btn.y, btn.w, btn.h, 5);
    }
  }

  // Reaction buttons
  for (let btn of reactionButtons) {
    fill(255);
    stroke(0);
    rect(btn.x, btn.y, btn.w, btn.h, 10);
    textSize(24);
    noStroke();
    textAlign(CENTER, CENTER);
    text(btn.emoji, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }
}

function isInside(pos, box) {
  return pos.x > box.x && pos.x < box.x + box.w &&
         pos.y > box.y && pos.y < box.y + box.h;
}

function eraseDotsNear(x, y) {
  const eraseRadius = 20;
  for (let i = dots.length - 1; i >= 0; i--) {
    let pt = dots[i];
    if (dist(x, y, pt.x, pt.y) < eraseRadius) {
      dots.splice(i, 1);
    }
  }
}

function spawnReactions(emoji) {
  for (let i = 0; i < 10; i++) {
    reactions.push({
      emoji: emoji,
      x: random(100, width - 100),
      y: -20,
      speed: random(1, 3),
      size: random(20, 32)
    });
  }
}