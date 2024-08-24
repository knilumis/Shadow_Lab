// script.js
const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const exit = document.getElementById('exit');
const walls = document.querySelectorAll('.wall');
const obstacles = document.querySelectorAll('.obstacle');
const traps = document.querySelectorAll('.trap');
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const lightMask = document.getElementById('light-mask');
const ctx = lightMask.getContext('2d');

let playerPosition = { x: 290, y: 290 }; // Oyuncunun başlangıç pozisyonu
let timeLeft = 45; // Daha zorlu bir oyun için zamanı 45 saniyeye indirdik
let score = 0; // Başlangıç puanı
let gameInterval;
let isPlayerFrozen = false; // Tuzak yakalandığında oyuncu hareketi dondurulacak

// Klavye ile oyuncu hareketi
document.addEventListener('keydown', (event) => {
    if (isPlayerFrozen) return; // Eğer oyuncu dondurulmuşsa hareket etme
    let newPosition = { x: playerPosition.x, y: playerPosition.y };

    switch (event.key) {
        case 'ArrowUp':
            newPosition.y -= 10;
            break;
        case 'ArrowDown':
            newPosition.y += 10;
            break;
        case 'ArrowLeft':
            newPosition.x -= 10;
            break;
        case 'ArrowRight':
            newPosition.x += 10;
            break;
    }

    if (!isCollidingWithWalls(newPosition) && !isCollidingWithObstacles(newPosition)) {
        playerPosition = newPosition;
        movePlayer();
        checkTrap(); // Tuzak kontrolü
        checkExit(); // Çıkış kontrolü
    }
});

function movePlayer() {
    player.style.left = playerPosition.x + 'px';
    player.style.top = playerPosition.y + 'px';
    updateLightMask();
}

function isCollidingWithWalls(newPosition) {
    return checkCollision(newPosition, walls);
}

function isCollidingWithObstacles(newPosition) {
    return checkCollision(newPosition, obstacles);
}

function checkCollision(newPosition, elements) {
    let isColliding = false;
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const playerRect = {
            left: newPosition.x,
            right: newPosition.x + player.clientWidth,
            top: newPosition.y,
            bottom: newPosition.y + player.clientHeight
        };

        if (playerRect.left < rect.right &&
            playerRect.right > rect.left &&
            playerRect.top < rect.bottom &&
            playerRect.bottom > rect.top) {
            isColliding = true;
        }
    });
    return isColliding;
}

function checkTrap() {
    traps.forEach(trap => {
        const trapRect = trap.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        if (playerRect.left < trapRect.right &&
            playerRect.right > trapRect.left &&
            playerRect.top < trapRect.bottom &&
            playerRect.bottom > trapRect.top) {
            handleTrapCollision();
        }
    });
}

function handleTrapCollision() {
    isPlayerFrozen = true;
    score -= 10; // Daha fazla puan kaybı
    scoreDisplay.textContent = score;
    setTimeout(() => {
        isPlayerFrozen = false;
    }, 3000); // 3 saniye boyunca oyuncu hareket edemez
}

function checkExit() {
    const exitRect = exit.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    if (playerRect.left < exitRect.right &&
        playerRect.right > exitRect.left &&
        playerRect.top < exitRect.bottom &&
        playerRect.bottom > exitRect.top) {
        clearInterval(gameInterval); // Oyunu durdur
        alert('Tebrikler! Çıkışı buldunuz.');
        resetGame();
    }
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
    } else {
        clearInterval(gameInterval);
        alert('Süre doldu! Yeniden deneyin.');
        resetGame();
    }
}

function resetGame() {
    playerPosition = { x: 290, y: 290 };
    timeLeft = 45; // Zaman limiti yeniden ayarlandı
    score = 0;
    timeDisplay.textContent = timeLeft;
    scoreDisplay.textContent = score;
    movePlayer();
    startGame();
}

function startGame() {
    gameInterval = setInterval(updateTimer, 1000);
    updateLightMask(); // Oyunu başlatırken ışık maskesini de güncelle
}

// Işık maskesini güncelle
function updateLightMask() {
    ctx.clearRect(0, 0, lightMask.width, lightMask.height);
    
    // Karanlık arka plan
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, lightMask.width, lightMask.height);
    
    // Işık efekti
    const gradient = ctx.createRadialGradient(
        playerPosition.x + 10, playerPosition.y + 10, 10,
        playerPosition.x + 10, playerPosition.y + 10, 100
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(playerPosition.x + 10, playerPosition.y + 10, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
}

// Oyunu başlat
startGame();
