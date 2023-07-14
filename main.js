(function() {

/* DOM Elements */


const body = document.querySelector('body');
const scoreDisplay = body.querySelector('.left-ui__box span[data-score]');
const mainBoard = body.querySelector('.main-board');
const mainBoardMessage = mainBoard.querySelector('.main-board__message');
const startMessage = mainBoardMessage.querySelector('p[data-message-start]');
const gameOverMessage = mainBoardMessage.querySelector('div[data-message-over]');
const gameOverScore = gameOverMessage.querySelector('span[data-score]');
const countDownMessage = mainBoardMessage.querySelector('p[data-message-countdown]');
const fruitImg = body.querySelector('.main-board__fruit');
const sliceAudio = body.querySelector('audio[data-slice-sound]');
const startButton = body.querySelector('.right-ui__button[data-start]');
const stopButton = body.querySelector('.right-ui__button[data-stop]');


/* CONSTANTS */


const fruitsArray = ['apple', 'banana', 'grapes', 'lemon', 'orange', 'peach', 'pear', 'pineapple', 'strawberry', 'watermelon'];


/* VARIABLES */


let playing = false,
    score = 0,
    tries = 3,
    fruitMovementRefreshTime = 6,
    countDown, coreInterval, delayedAppear, step;


/* MAIN */


startButton.addEventListener('click', handleStartOrReset);
stopButton.addEventListener('click', handleStop);


/* FUNCTIONS  */

// Update tries display
function updateTriesDisplay() {
    const hearts = body.querySelectorAll('.left-ui__heart');
    if (tries === 3) {
        hearts.forEach(heart => {
            heart.style.visibility = 'visible';
        })
    } else if (tries < 3) {
        hearts[tries].style.visibility = 'hidden';
    }
}

// Update Score display
function updateScoreDisplay() {
    scoreDisplay.textContent = `${score}`;
}

// Hide messages
function hideMessage(...messageElements) {
    messageElements.forEach(messageElement => {
        messageElement.style.visibility = 'hidden';
        messageElement.style.position = 'absolute'
    })
}

// Display Gameover message
function displayGameOverMessage() {
    hideMessage(startMessage, countDownMessage);
    gameOverMessage.style.visibility = 'visible';
    gameOverMessage.style.position = 'unset';
    mainBoardMessage.style.visibility = 'visible';
    gameOverScore.textContent = `${score}`
}

// Display Countdown message
function displayCountdownMessage(count) {
    hideMessage(startMessage, gameOverMessage);
    countDownMessage.style.visibility = 'visible';
    countDownMessage.style.position = 'unset';
    mainBoardMessage.style.visibility = 'visible';
    countDownMessage.textContent = `${count}`
}

// Initialize game
function initGame() {
    score = 0;
    tries = 3;
    updateTriesDisplay()
    updateScoreDisplay()
}

// Subtract try
function subtractTry() {
    tries--;
    updateTriesDisplay()
}

// Generate fruit
function generateFruit() {
    fruitImg.classList.remove('sliced');
    // Generate random index to access a fruit from the array
    const index = Math.floor(Math.random() * fruitsArray.length);
    const fruitName = fruitsArray[index];
    fruitImg.setAttribute('src', `./assets/img/${fruitName}.webp`);
    fruitImg.style.visibility = 'visible';
    // Position fruit above main board
    fruitImg.style.top = `-${fruitImg.clientHeight}px`;
    // Calculate the Ratio of the fruit width, relative to the main board
    const fruitWidthRatio = fruitImg.clientWidth / mainBoard.clientWidth;
    // Calculate a random left coordinate to position the fruit, relative to the main board
    let leftPosition = Math.floor(Math.random() * mainBoard.clientWidth);
    // Check if fruit would overflow with the generated coordinate. If it's the case, substract the fruit width from the coordinate to prevent it.
    if (leftPosition > mainBoard.clientWidth * fruitWidthRatio) {
        fruitImg.style.left = `${leftPosition - fruitImg.clientWidth}px`;
    } else {
        fruitImg.style.left = `${leftPosition}px`;
    }
}

// Set movement step
function setStep() {
    // Set the step relative to the score to increase game difficulty
    if (score < 16){
        step = 2.5;
    } else if (score < 31){
        step = 4;
    } else if (score < 41){
        step = 6.3;
    } else {
        step = 7.6;
    }
}

// Move fruit vertically
function moveFruitY() {
    fruitImg.style.top = `${fruitImg.offsetTop + step}px`;
    fruitImg.addEventListener('pointerleave', handleFruitSlice);
}

// Handle fruit pass the game board
function handleFruitPass() {
    if (fruitImg.offsetTop > mainBoard.clientHeight) {
        subtractTry();
        generateFruit()
    }
}

// Drop generated fruit vertically across the game board. Handle pass from board
function dropFruit() {
    generateFruit();
    setStep();
    coreInterval = setInterval(() => {
        if (tries < 1) {
            clearInterval(coreInterval);
            gameOver();
            displayGameOverMessage()
        } else {
            moveFruitY();
            handleFruitPass()
        }

    }, fruitMovementRefreshTime)
}

// Game Over
function gameOver() {
    playing = false;
    fruitImg.style.visibility = 'hidden';
    clearInterval(coreInterval);
    clearInterval(countDown);
    clearTimeout(delayedAppear)
}

// Game start after countdown
function gameStartCountDown() {
    let count = 3;
    displayCountdownMessage(count);
    countDown = setInterval(() => {
        count--;
        displayCountdownMessage(count);
        if (count < 1) {
            clearInterval(countDown);
            playing = true;
            startButton.textContent = 'Reset';
            hideMessage(countDownMessage);
            dropFruit()
        }
    }, 1000)
}

// Handle game start or reset
function handleStartOrReset() {
    initGame();
    if (playing) {
        gameOver();
        gameStartCountDown()
    } else {
        mainBoardMessage.style.visibility = 'hidden';
        gameStartCountDown()
    }
}

// Handle stop
function handleStop() {
    if (playing) {
        gameOver();
        displayGameOverMessage();
        startMessage.style.visibility = 'visible';
        startMessage.style.position = 'unset';
        startButton.textContent = 'Start'
    }
}

// Handle fruit slice
function handleFruitSlice() {
    clearInterval(coreInterval);
    clearTimeout(delayedAppear);
    score++;
    updateScoreDisplay();
    sliceAudio.play();
    fruitImg.classList.add('sliced');
    delayedAppear = setTimeout(() => {
        dropFruit()
    }, 1000);
    fruitImg.removeEventListener('pointerleave', handleFruitSlice)
}

}())