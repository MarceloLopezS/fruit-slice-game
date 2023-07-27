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
    countDown, fruitDropInterval, delayedAppearTimeout, step, sliceAnimationTimeout;


/* MAIN */


startButton.addEventListener('click', handleStartOrReset);
stopButton.addEventListener('click', handleManualStop);


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
function hideMessages(...messageElements) {
    messageElements.forEach(messageElement => {
        messageElement.style.visibility = 'hidden';
        messageElement.style.position = 'absolute'
    })
}

// Show messages
function showMessages(...messageElements) {
    messageElements.forEach(messageElement => {
        messageElement.style.visibility = 'visible';
        messageElement.style.position = 'unset'
    })
}

// Make element visible
function makeElementsVisible(...elements) {
    elements.forEach(element => element.style.visibility = 'visible')
}

// Display Gameover message
function displayGameOverMessage() {
    hideMessages(startMessage, countDownMessage);
    showMessages(gameOverMessage);
    makeElementsVisible(mainBoardMessage);
    gameOverScore.textContent = `${score}`
}

// Display Countdown message
function displayCountdownMessage(count) {
    hideMessages(startMessage, gameOverMessage);
    showMessages(countDownMessage);
    makeElementsVisible(mainBoardMessage);
    countDownMessage.textContent = `${count}`
}

// Initialize game
function initGame() {
    score = 0;
    tries = 3;
    updateTriesDisplay();
    updateScoreDisplay()
}

// Subtract try
function subtractTry() {
    tries--;
    updateTriesDisplay()
}

// Get random value from an array
function getRandomArrayValue(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

// Set image source attribute
function setImageSrc(imageElement, src) {
    imageElement.setAttribute('src', src);
}

// Calculate longitude ratio
function calculateLongitudeRatio(shortestLongitude, longestLongitude) {
    return shortestLongitude / longestLongitude
}

// Apply transform: translate property to element
function translateElementUsingTransform(element, coordinates = { x : null, y : null }) {
    const { x, y } = coordinates;
    element.style.transform = `translate(${x}px, ${y}px)`
}

// Generate fruit
function generateFruit() {
    // Translate fruit to it's default position, above the main board
    const coordinates = { x : 0, y : 0 };
    translateElementUsingTransform(fruitImg, coordinates);
    // Generate random index to access a fruit from the array
    const fruitName = getRandomArrayValue(fruitsArray);
    const imgSrc = `./assets/img/${fruitName}.webp`;
    setImageSrc(fruitImg, imgSrc);
    makeElementsVisible(fruitImg);
    // Calculate the Ratio of the fruit width, relative to the main board
    const fruitWidth = fruitImg.clientWidth;
    const mainBoardWidth = mainBoard.clientWidth;
    const fruitWidthRatio = calculateLongitudeRatio(fruitWidth, mainBoardWidth);
    // Calculate a random left offset to translate the fruit, relative to the main board
    let leftOffset = Math.floor(Math.random() * mainBoardWidth);
    // Check if fruit would overflow with the generated coordinate. If it's the case, substract the fruit width from the coordinate to prevent it.
    if (leftOffset > mainBoardWidth * fruitWidthRatio) {
        const coordinates = {
            x : leftOffset - fruitWidth,
            y : 0
        }
        translateElementUsingTransform(fruitImg, coordinates)
    } else {
        const coordinates = {
            x : leftOffset,
            y : 0
        }
        translateElementUsingTransform(fruitImg, coordinates)
    }
    
    fruitImg.addEventListener('pointerleave', handleFruitSlice);
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

// Get translate X,Y coordinates
function get2dTranslateCoordinates(element) {
    const style = window.getComputedStyle(element);
    const transformMatrix =  style['transform'];

    if (transformMatrix === 'none' || typeof transformMatrix === 'undefined') {
        return {
            coordinateX: 0,
            coordinateY: 0
        }
    }

    // 2D Matrix usual representation: matrix(0, 0, 0, 0, 0, 0)
    // When 2d translate and rotate are the only transforms applied to an element; the X, Y coordinates are the 5th and 6th values respectively
    const matrixRegex = /matrix.*\((.+)\)/;
    const transformMatrixValues = transformMatrix.match(matrixRegex)[1].split(', ');
    return {
        coordinateX: parseInt(transformMatrixValues[4]),
        coordinateY: parseInt(transformMatrixValues[5])
    }
}

// Move fruit vertically
function moveFruitY() {
    const { coordinateX, coordinateY } = get2dTranslateCoordinates(fruitImg);
    const coordinates = {
        x : coordinateX,
        y : coordinateY + step
    }
    translateElementUsingTransform(fruitImg, coordinates);
}

// Handle when fruit passes the game board
function handleFruitPass() {
    const fruitCoordinateY = get2dTranslateCoordinates(fruitImg).coordinateY;
    if (fruitCoordinateY > mainBoard.clientHeight + fruitImg.clientHeight) {
        subtractTry();
        generateFruit()
    }
}

// Drop generated fruit vertically across the game board. Handle pass from board
function dropFruit() {
    generateFruit();
    setStep();
    fruitDropInterval = setInterval(() => {
        if (tries < 1) {
            clearInterval(fruitDropInterval);
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
    clearInterval(fruitDropInterval);
    clearInterval(countDown);
    clearTimeout(delayedAppearTimeout)
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
            hideMessages(countDownMessage);
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

// Handle manual stop
function handleManualStop() {
    if (playing) {
        gameOver();
        displayGameOverMessage();
        showMessages(startMessage);
        startButton.textContent = 'Start'
    }
}

// Rotate element using transform
function rotateElementUsingTransform(element, degrees) {
    // To avoid transform: translate reset, the translate coordinates are required to be set
    const { coordinateX, coordinateY } = get2dTranslateCoordinates(element);
    element.style.transform = `translate(${coordinateX}px, ${coordinateY}px) rotate(${degrees}deg)`
}

// Perform slice animation on element
function performSliceAnimation(element) {
    clearTimeout(sliceAnimationTimeout);
    rotateElementUsingTransform(element, 20);
    sliceAnimationTimeout = setTimeout(() => {
        rotateElementUsingTransform(element, 0);
    }, 200)
}

// Perform slice audiovisual action on element
function sliceActionOnElement(element, audio) {
    audio.play();
    performSliceAnimation(element);
}

// Handle fruit slice
function handleFruitSlice() {
    clearInterval(fruitDropInterval);
    clearTimeout(delayedAppearTimeout);
    score++;
    updateScoreDisplay();
    sliceActionOnElement(fruitImg, sliceAudio);
    delayedAppearTimeout = setTimeout(() => {
        dropFruit()
    }, 1000);
    fruitImg.removeEventListener('pointerleave', handleFruitSlice)
}

}())