const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const playerImage = new Image();
playerImage.src = 'https://i.imgur.com/NxDmSPB.png'; // Updated URL for the hosted image

const winningImage = new Image();
winningImage.src = 'https://i.imgur.com/MjSvts8.png'; // Winning image URL

const player = {
    x: canvas.width / 2 - 37.5,
    y: canvas.height - 150,
    width: 75, // Increased size
    height: 75, // Increased size
    lives: 3
};

let obstacles = [];
let score = 0;
let gameOver = true;
let obstacleSpeed = 2; // Base speed of obstacles
let risingBarHeight = 0;
let barSpeed = 0.1; // Initial speed of the rising bar

let obstacleInterval;
let speedInterval;
let barSpeedInterval;

function createObstacle() {
    const size = Math.random() * 30 + 20;
    obstacles.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        speed: Math.random() * obstacleSpeed + 1,
        color: getRandomColor()
    });
}

function getRandomColor() {
    const colors = ['#aaff00', '#4b0082', '#e6e6fa'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawPlayer() {
    context.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        context.beginPath();
        context.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
        context.fillStyle = obstacle.color;
        context.fill();
        context.closePath();
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.y += obstacle.speed;

        if (obstacle.y > canvas.height + obstacle.size) {
            obstacles.shift();
            score++;
        }

        if (detectCollision(player, obstacle)) {
            player.lives--;
            obstacles.shift();

            if (player.lives === 0) {
                endGame(false);
            }
        }
    });
}

function detectCollision(player, obstacle) {
    const distX = Math.abs(obstacle.x - player.x - player.width / 2);
    const distY = Math.abs(obstacle.y - player.y - player.height / 2);

    if (distX > (player.width / 2 + obstacle.size) || distY > (player.height / 2 + obstacle.size)) {
        return false;
    }

    if (distX <= (player.width / 2) || distY <= (player.height / 2)) {
        return true;
    }

    const dx = distX - player.width / 2;
    const dy = distY - player.height / 2;
    return (dx * dx + dy * dy <= (obstacle.size * obstacle.size));
}

function drawRisingBar() {
    context.fillStyle = '#aaff00';
    context.fillRect(0, canvas.height - risingBarHeight, canvas.width, risingBarHeight);
    risingBarHeight += barSpeed;

    if (risingBarHeight > canvas.height - player.height && player.y + player.height > canvas.height - risingBarHeight) {
        player.lives--;
        risingBarHeight = 0; // Reset bar height on losing a life
        if (player.lives === 0) {
            endGame(false);
        }
    }
}

function checkWin() {
    if (player.y < risingBarHeight) {
        endGame(true);
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        drawPlayer();
        drawObstacles();
        drawRisingBar();
        updateObstacles();
        checkWin();
    } else {
        context.fillStyle = '#fff';
        context.font = '30px Arial';
        context.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
    }

    context.fillStyle = '#fff';
    context.font = '20px Arial';
    context.fillText(`Score: ${score}`, 10, 30);
    context.fillText(`Lives: ${player.lives}`, 10, 60);

    requestAnimationFrame(draw);
}

function startGame() {
    gameOver = false;
    score = 0;
    player.lives = 3;
    obstacles = [];
    obstacleSpeed = 2;
    risingBarHeight = 0;
    barSpeed = 0.1;
    document.getElementById('startButton').style.display = 'none'; // Hide the start button when game starts
    document.getElementById('playAgainButton').style.display = 'none'; // Hide the play again button when game starts
    obstacleInterval = setInterval(createObstacle, 1000);
    speedInterval = setInterval(() => {
        obstacleSpeed += 0.5; // Increase speed every 20 seconds
    }, 20000);
    barSpeedInterval = setInterval(() => {
        barSpeed += 0.01; // Increase bar speed after 30 seconds
    }, 30000);
    requestAnimationFrame(draw);
}

function endGame(won) {
    gameOver = true;
    clearInterval(obstacleInterval);
    clearInterval(speedInterval);
    clearInterval(barSpeedInterval);
    if (won) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(winningImage, canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 300);
        document.getElementById('playAgainButton').style.display = 'block';
    } else {
        document.getElementById('startButton').style.display = 'block'; // Show the start button on game over
    }
}

canvas.addEventListener('mousemove', (event) => {
    if (!gameOver) {
        const rect = canvas.getBoundingClientRect();
        player.x = event.clientX - rect.left - player.width / 2;
        player.y = event.clientY - rect.top - player.height / 2;
    }
});

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('playAgainButton').addEventListener('click', startGame);
