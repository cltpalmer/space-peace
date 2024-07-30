const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const playerImage = new Image();
playerImage.src = 'https://i.imgur.com/NxDmSPB.png'; // Updated URL for the hosted image

const winningImage = new Image();
winningImage.src = 'https://i.imgur.com/MjSvts8.png'; // Winning image URL

const losingImage = new Image();
losingImage.src = 'https://i.imgur.com/yOHGZ9w.png'; // Losing image URL

const player = {
    x: canvas.width / 2 - 37.5,
    y: canvas.height - 150,
    width: 75, // Increased size
    height: 75, // Increased size
    lives: 3
};

let obstacles = [];
let rareBalls = [];
let score = 0;
let highestScore = 0;
let gameOver = true;
let gameWon = false; // Track game won state
let obstacleSpeed = 2; // Base speed of obstacles
let risingBarHeight = 0;
let barSpeed = 0.1; // Initial speed of the rising bar
let collectedBalls = 0; // Number of rare balls collected
let totalObstacles = 0; // Track total obstacles for rare ball spawning

let obstacleInterval;
let speedInterval;
let barSpeedInterval;

const emotions = ["peace", "calm", "serenity", "tranquility", "relaxation"];

function createObstacle() {
    const size = Math.random() * 30 + 20;
    obstacles.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        speed: Math.random() * obstacleSpeed + 1,
        color: getRandomColor()
    });

    totalObstacles++;
    if (totalObstacles % 6 === 0) {
        createRareBall();
    }
}

function createRareBall() {
    const size = Math.random() * 30 + 20;
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    rareBalls.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        size: size,
        speed: Math.random() * obstacleSpeed + 1,
        color: '#FF3131',
        emotion: emotion
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

function drawRareBalls() {
    rareBalls.forEach(ball => {
        context.beginPath();
        context.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
        context.fillStyle = ball.color;
        context.fill();
        context.closePath();
        context.fillStyle = '#fff';
        context.font = '10px Arial';
        context.fillText(ball.emotion, ball.x - ball.size / 2, ball.y);
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

    rareBalls.forEach((ball, index) => {
        ball.y += ball.speed;

        if (ball.y > canvas.height + ball.size) {
            rareBalls.splice(index, 1);
        }

        if (detectCollision(player, ball)) {
            collectedBalls++;
            score += 10; // Add 10 points for each rare ball collected
            rareBalls.splice(index, 1);

            if (collectedBalls >= 3) {
                checkWin();
            }
        }
    });
}

function detectCollision(player, obj) {
    const distX = Math.abs(obj.x - player.x - player.width / 2);
    const distY = Math.abs(obj.y - player.y - player.height / 2);

    if (distX > (player.width / 2 + obj.size) || distY > (player.height / 2 + obj.size)) {
        return false;
    }

    if (distX <= (player.width / 2) || distY <= (player.height / 2)) {
        return true;
    }

    const dx = distX - player.width / 2;
    const dy = distY - player.height / 2;
    return (dx * dx + dy * dy <= (obj.size * obj.size));
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
    if (player.y < risingBarHeight && collectedBalls >= 3) {
        endGame(true);
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        drawPlayer();
        drawObstacles();
        drawRareBalls();
        drawRisingBar();
        updateObstacles();
    } else {
        if (gameWon) {
            context.drawImage(winningImage, canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 300);
        } else {
            context.drawImage(losingImage, canvas.width / 2 - 150, canvas.height / 2 - 150, 300, 300);
        }
        document.getElementById('totalScore').innerText = `Total Score: ${score}`;
    }

    context.fillStyle = '#fff';
    context.font = '20px Arial';
    context.fillText(`Score: ${score}`, 10, 30);
    context.fillText(`Lives: ${player.lives}`, 10, 60);
    context.fillText(`Balls collected: ${collectedBalls}/3`, canvas.width - 150, 30);
    context.fillText(`Highest Score: ${highestScore}`, canvas.width - 150, 60);

    requestAnimationFrame(draw);
}

function startGame() {
    gameOver = false;
    gameWon = false; // Reset game won state
    score = 0;
    player.lives = 3;
    player.y = canvas.height - 150; // Reset player position
    obstacles = [];
    rareBalls = [];
    obstacleSpeed = 2;
    risingBarHeight = 0;
    barSpeed = 0.1;
    collectedBalls = 0; // Reset collected balls
    totalObstacles = 0; // Reset total obstacles count
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
    gameWon = won; // Set game won state
    clearInterval(obstacleInterval);
    clearInterval(speedInterval);
    clearInterval(barSpeedInterval);
    if (score > highestScore) {
        highestScore = score; // Update highest score
    }
    document.getElementById('playAgainButton').style.display = 'block'; // Show play again button
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
