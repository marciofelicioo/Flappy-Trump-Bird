const canvas = document.getElementById('flappyBird');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let bird = { x: 67, y: canvas.height / 2, width: 67, height: 67, velocity: 0 };
const gravity = 0.5;
const jump = -9;
let pipes = [];
let pipeInterval = 150;
let frameCount = 0;
let pipeCount = 0;
let score = 0;
let isGameOver = false;
let gameOverHandled = false;
let currentPhrase = null;
let cloudTimer = 0;

const phrases = ["Always winning!", "USA GOAT", "USA Legend!"];

const birdImage = new Image();
birdImage.src = 'trumvd.webp';

const video5El = document.createElement('video');
video5El.src = 'donald-trump-thumbs-up.mp4';
video5El.muted = true;
video5El.loop = true;
video5El.play().catch(err => {
  console.warn("Autoplay falhou vídeo 5-can. Sem interação do usuário.");
});

const video3El = document.createElement('video');
video3El.src = 'trump-dance-trump-2024.mp4';
video3El.muted = true;
video3El.loop = true;
video3El.play().catch(err => {
  console.warn("Autoplay falhou vídeo 3-can. Sem interação do usuário.");
});

document.addEventListener('keydown', (e) => {
  if (isGameOver) return;
  if (e.code === "Space") bird.velocity = jump;
});

document.addEventListener('click', () => {
  if (!isGameOver) {
    bird.velocity = jump;
  }
});

document.addEventListener('touchstart', () => {
  if (!isGameOver) {
    bird.velocity = jump;
  }
});


function drawBird() {
  ctx.save();
  ctx.beginPath();
  ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
  ctx.restore();
}

function drawGround() {
  const groundHeight = 20;
  ctx.fillStyle = 'rgba(101, 67, 33, 0.7)';
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function drawPipes() {
  const groundHeight = 20;
  pipes.forEach(pipe => {
    ctx.fillStyle = 'red';
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);

    if (pipe.isSpecial5 && !video5El.paused && !video5El.ended) {
      ctx.drawImage(video5El, pipe.x, canvas.height - pipe.bottom - groundHeight, pipe.width, pipe.bottom);
    } else if (pipe.isSpecial3 && !video3El.paused && !video3El.ended) {
      ctx.drawImage(video3El, pipe.x, canvas.height - pipe.bottom - groundHeight, pipe.width, pipe.bottom);
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(pipe.x, canvas.height - pipe.bottom - groundHeight, pipe.width, pipe.bottom);
    }
  });
}

function updatePipes() {
  if (frameCount % pipeInterval === 0) {
    const groundHeight = 20;
    const gap = canvas.height * 0.37;
    const top = Math.random() * (canvas.height - gap - groundHeight - 100);

    pipeCount++;

    let isSpecial5 = (pipeCount % 5 === 0);
    let isSpecial3 = (pipeCount % 3 === 0);

    pipes.push({ 
      x: canvas.width,
      width: 100,
      top: top,
      bottom: canvas.height - top - gap,
      passed: false,
      isSpecial5: isSpecial5,
      isSpecial3: isSpecial3
    });
  }
  pipes.forEach(pipe => pipe.x -= 2);
  pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

function detectCollision() {
  const groundHeight = 20;
  for (const pipe of pipes) {
    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom - groundHeight)
    ) {
      return true;
    }
  }
  return bird.y + bird.height > canvas.height - groundHeight;
}

function checkPassPipes() {
  pipes.forEach(pipe => {
    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score++;
      pipe.passed = true;
      if (score % 5 === 0) {
        currentPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        cloudTimer = 100;
      }
    }
  });
}

function drawCloud() {
  if (cloudTimer > 0 && currentPhrase) {
    ctx.save();
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    const cloudX = bird.x + 80;
    const cloudY = bird.y - 50;
    const textWidth = ctx.measureText(currentPhrase).width;

    ctx.beginPath();
    ctx.ellipse(cloudX + textWidth / 2, cloudY, textWidth / 2 + 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.fillText(currentPhrase, cloudX, cloudY + 8);
    ctx.restore();
    cloudTimer--;
  }
}

let startAgainButton = {
  width: 200,
  height: 50,
  x: 0,
  y: 0
};

function drawGameOverScreen() {
  if (gameOverHandled) return;
  gameOverHandled = true;

  const boxWidth = 300;
  const boxHeight = 200;

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(canvas.width / 2 - boxWidth / 2, canvas.height / 2 - boxHeight / 2, boxWidth, boxHeight);

  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, (canvas.height / 2) - 30);

  startAgainButton.x = canvas.width / 2 - startAgainButton.width / 2;
  startAgainButton.y = canvas.height / 2 + 10;

  ctx.fillStyle = '#d95c5c'; 
  ctx.fillRect(startAgainButton.x, startAgainButton.y, startAgainButton.width, startAgainButton.height);

  ctx.fillStyle = 'white';
  ctx.font = '25px Arial';
  ctx.fillText('Start Again', canvas.width / 2, startAgainButton.y + 33);

  ctx.restore();

  canvas.addEventListener('click', handleClickOnGameOver);
}

function handleClickOnGameOver(event) {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  if (
    clickX >= startAgainButton.x &&
    clickX <= startAgainButton.x + startAgainButton.width &&
    clickY >= startAgainButton.y &&
    clickY <= startAgainButton.y + startAgainButton.height
  ) {
    restartGame();
  }
}

function restartGame() {
  canvas.removeEventListener('click', handleClickOnGameOver);
  pipes = [];
  pipeCount = 0;
  bird = { x: 67, y: canvas.height / 2, width: 67, height: 67, velocity: 0 };
  score = 0;
  frameCount = 0;
  isGameOver = false;
  gameOverHandled = false;
  currentPhrase = null;
  cloudTimer = 0;
  gameLoop();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (detectCollision()) {
    isGameOver = true;
  }

  if (isGameOver) {
    drawGameOverScreen();
    return; 
  }

  bird.velocity += gravity;
  bird.y += bird.velocity;

  drawBird();
  drawGround();
  updatePipes();
  drawPipes();
  checkPassPipes();
  drawCloud();

  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, 50);

  frameCount++;
  requestAnimationFrame(gameLoop);
}

gameLoop();
