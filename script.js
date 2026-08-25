const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRID_SIZE = 20;
const TILE_SIZE = canvas.width / GRID_SIZE;
const INITIAL_SPEED = 100; // ms

// Game variables
let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let direction = {x: 1, y: 0};
let nextDirection = {x: 1, y: 0};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = true;
let gamePaused = false;
let gameSpeed = INITIAL_SPEED;

// Initialize
window.addEventListener('load', () => {
    document.getElementById('highScore').textContent = highScore;
    gameLoop();
});

// Keyboard controls
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    const key = e.key.toLowerCase();
    const arrowKeyMap = {
        'arrowup': {x: 0, y: -1},
        'arrowdown': {x: 0, y: 1},
        'arrowleft': {x: -1, y: 0},
        'arrowright': {x: 1, y: 0},
        'w': {x: 0, y: -1},
        's': {x: 0, y: 1},
        'a': {x: -1, y: 0},
        'd': {x: 1, y: 0}
    };

    if (arrowKeyMap[key]) {
        e.preventDefault();
        const newDir = arrowKeyMap[key];
        
        // Prevent reversing into itself
        if (!(newDir.x === -direction.x && newDir.y === -direction.y)) {
            nextDirection = newDir;
        }
    }
}

function gameLoop() {
    if (!gameRunning) return;
    
    setTimeout(() => {
        if (!gamePaused) {
            update();
            draw();
        }
        gameLoop();
    }, gameSpeed);
}

function update() {
    // Update direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };
    
    // Check wall collision
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        endGame();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame();
        return;
    }
    
    // Add new head
    snake.unshift(newHead);
    
    // Check food collision
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        generateFood();
        
        // Increase speed slightly
        if (gameSpeed > 50) {
            gameSpeed -= 2;
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (optional)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(canvas.width, i * TILE_SIZE);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#00ff00';
        } else {
            // Body
            ctx.fillStyle = '#00cc00';
        }
        
        ctx.fillRect(
            segment.x * TILE_SIZE + 1,
            segment.y * TILE_SIZE + 1,
            TILE_SIZE - 2,
            TILE_SIZE - 2
        );
    });
    
    // Draw food
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(
        food.x * TILE_SIZE + TILE_SIZE / 2,
        food.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function generateFood() {
    let newFood;
    let isOnSnake = true;
    
    while (isOnSnake) {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        
        isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    
    food = newFood;
}

function endGame() {
    gameRunning = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
    
    // Show game over screen
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
}

function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
}

function resetGame() {
    // Reset variables
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};
    score = 0;
    gameSpeed = INITIAL_SPEED;
    gameRunning = true;
    gamePaused = false;
    
    // Update UI
    document.getElementById('score').textContent = score;
    document.getElementById('pauseBtn').textContent = 'Pause';
    document.getElementById('gameOver').classList.add('hidden');
    
    // Restart game
    gameLoop();
}