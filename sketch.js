// 🎨 손으로 그리기 + 지우개 + 색상 선택 + 반응 이모지

let dots = []; // 그려진 점들을 저장하는 배열
let video; // 웹캠 비디오 캡처 객체
let handPose; // ml5.js HandPose 모델 객체
let hands = []; // 인식된 손 정보 배열
let erasing = false; // 지우개 모드 여부
let currentColor = [0, 255, 0]; // 현재 선택된 색상 (기본: 초록)
let lastDot = null; // 이전 점 위치 (선을 부드럽게 이어 그리기 위해)
let reactions = []; // 떠오르는 이모지 효과 배열
let canDraw = true; // 현재 드로잉이 가능한지 여부

// UI 요소들
let eraserBox = { x: 20, y: 400, w: 60, h: 60 }; // 지우개 버튼 위치 및 크기
let penBox = { x: 100, y: 400, w: 60, h: 60 }; // 펜 버튼 위치 및 크기
let colorButtons = [ // 색상 버튼들
  { color: [255, 0, 0], x: 180, y: 400, w: 40, h: 40 },
  { color: [0, 0, 255], x: 230, y: 400, w: 40, h: 40 },
  { color: [0, 255, 0], x: 280, y: 400, w: 40, h: 40 }
];
let reactionButtons = [ // 이모지 버튼들
  { emoji: '❤️', x: 20, y: 20, w: 40, h: 40 },
  { emoji: '👍', x: 70, y: 20, w: 40, h: 40 },
  { emoji: '😢', x: 120, y: 20, w: 40, h: 40 }
];
let showColorOptions = false; // 색상 버튼 표시 여부

function preload() {
  // 손 인식 모델 로드 (좌우 반전된 상태로)
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  // 마우스를 누르면 그림과 이모지를 모두 초기화
  dots = [];
  reactions = [];
}

function gotHands(results) {
  // 손 인식 결과를 hands 배열에 저장
  hands = results;
}

function setup() {
  createCanvas(640, 480); // 캔버스 생성
  frameRate(60); // 프레임 설정
  video = createCapture(VIDEO, { flipped: true }); // 웹캠 켜기 (좌우반전)
  video.hide(); // 기본 웹캠 영상 숨기기
  handPose.detectStart(video, gotHands); // 손 인식 시작
  noStroke(); // 도형 외곽선 없음
}

function draw() {
  image(video, 0, 0); // 배경에 웹캠 영상 출력
  drawUI(); // UI 버튼 출력

  if (hands.length > 0) {
    // 손이 감지되었을 때
    let hand = hands[0];
    let index = hand.index_finger_tip; // 검지 끝 위치
    let thumb = hand.thumb_tip; // 엄지 끝 위치
    let d = dist(index.x, index.y, thumb.x, thumb.y); // 검지와 엄지 거리
    let isPinched = d < 20; // 손가락이 붙었는지 판단 (클릭처럼 사용)

    // 손가락이 떨어지면 다시 드로잉 가능 상태로 변경
    if (!isPinched) {
      canDraw = true;
    }

    // 이모지 버튼이 눌렸을 경우
    if (isPinched) {
      for (let btn of reactionButtons) {
        if (isInside(index, btn)) {
          spawnReactions(btn.emoji); // 해당 이모지 띄우기
        }
      }
    }

    // 지우개 버튼이 눌렸을 경우
    if (isPinched && isInside(index, eraserBox)) {
      erasing = true;
    }

    // 펜 버튼이 눌렸을 경우 (색상 선택 UI 표시)
    if (isPinched && isInside(index, penBox)) {
      showColorOptions = true;
    }

    // 색상 버튼이 눌렸을 경우
    if (showColorOptions && isPinched) {
      for (let btn of colorButtons) {
        if (isInside(index, btn)) {
          currentColor = btn.color; // 현재 색상 변경
          showColorOptions = false; // 색상 선택창 닫기
          erasing = false; // 지우개 해제
          canDraw = false; // 실수로 바로 그려지는 것 방지
        }
      }
    }

    if (erasing) {
      // 지우개 모드일 경우 근처 점 삭제
      eraseDotsNear(index.x, index.y);
      lastDot = null; // 드로잉 이어지지 않게 초기화
    } else if (canDraw && isPinched && !isInside(index, penBox)) {
      // 드로잉 가능 상태이면서 펜 버튼 위가 아니면 그림 그리기
      if (lastDot) {
        // 마지막 점이 있을 경우 선을 부드럽게 이어 그리기
        let steps = int(dist(index.x, index.y, lastDot.x, lastDot.y) / 1);
        for (let i = 0; i <= steps; i++) {
          let x = lerp(lastDot.x, index.x, i / steps);
          let y = lerp(lastDot.y, index.y, i / steps);
          dots.push({ x, y, color: [...currentColor], size: 4 });
        }
      } else {
        // 첫 점은 바로 추가
        dots.push({ x: index.x, y: index.y, color: [...currentColor], size: 4 });
      }
      lastDot = { x: index.x, y: index.y }; // 마지막 위치 저장
    } else {
      lastDot = null;
    }
  } else {
    lastDot = null; // 손이 없으면 그리기 초기화
  }

  // 저장된 점들을 모두 그리기
  for (let pt of dots) {
    fill(...pt.color);
    ellipse(pt.x, pt.y, pt.size);
  }

  // 이모지가 있을 경우 떠오르게 그리기
  if (reactions.length > 0) {
    for (let r of reactions) {
      textSize(r.size);
      text(r.emoji, r.x, r.y);
      r.y += r.speed; // 위로 움직임
      r.speed += 0.2; // 가속도 추가
      r.x += random(-0.5, 0.5); // 흔들림 추가
    }
    // 화면 위로 지나간 이모지는 제거
    reactions = reactions.filter(r => r.y < height + 100);
  }

  // 지우개 모드일 때 현재 위치 표시 (반투명 빨간 원)
  if (erasing && hands.length > 0) {
    let index = hands[0].index_finger_tip;
    fill(255, 0, 0, 100);
    ellipse(index.x, index.y, 30);
  }
}

function drawUI() {
  // 지우개 버튼
  fill(255, 100, 100, 200);
  stroke(200, 0, 0);
  rect(eraserBox.x, eraserBox.y, eraserBox.w, eraserBox.h, 10);
  noStroke();
  fill(50);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("지우개", eraserBox.x + eraserBox.w / 2, eraserBox.y + eraserBox.h / 2);

  // 펜 버튼
  fill(200);
  stroke(0);
  rect(penBox.x, penBox.y, penBox.w, penBox.h, 10);
  noStroke();
  fill(0);
  text("펜", penBox.x + penBox.w / 2, penBox.y + penBox.h / 2);

  // 색상 버튼 표시
  if (showColorOptions) {
    for (let btn of colorButtons) {
      fill(...btn.color);
      stroke(0);
      rect(btn.x, btn.y, btn.w, btn.h, 5);
    }
  }

  // 이모지 버튼들
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
  // pos 좌표가 box 안에 들어오는지 확인
  return pos.x > box.x && pos.x < box.x + box.w &&
         pos.y > box.y && pos.y < box.y + box.h;
}

function eraseDotsNear(x, y) {
  // (x, y) 주변의 점들을 지움
  const eraseRadius = 20;
  for (let i = dots.length - 1; i >= 0; i--) {
    let pt = dots[i];
    if (dist(x, y, pt.x, pt.y) < eraseRadius) {
      dots.splice(i, 1);
    }
  }
}

function spawnReactions(emoji) {
  // 선택한 이모지를 여러 개 떠오르게 추가
  for (let i = 0; i < 10; i++) {
    reactions.push({
      emoji: emoji,
      x: random(100, width - 100), // 가로 위치 랜덤
      y: -20, // 위에서 시작
      speed: random(1, 3), // 떠오르는 속도
      size: random(20, 32) // 글자 크기 랜덤
    });
  }
}