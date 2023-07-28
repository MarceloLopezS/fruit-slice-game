(function() {

/* DOM Elements */


const dom_body = document.querySelector('body');
const dom_scoreDisplay = dom_body.querySelector('.left-ui__box span[data-score]');
const dom_mainBoard = dom_body.querySelector('.main-board');
const dom_mainBoardMessage = dom_mainBoard.querySelector('.main-board__message');
const dom_startMessage = dom_mainBoardMessage.querySelector('p[data-message-start]');
const dom_gameOverMessage = dom_mainBoardMessage.querySelector('div[data-message-over]');
const dom_gameOverScore = dom_gameOverMessage.querySelector('span[data-score]');
const dom_countDownMessage = dom_mainBoardMessage.querySelector('p[data-message-countdown]');
const dom_fruitImg = dom_body.querySelector('.main-board__fruit');
const dom_sliceAudio = dom_body.querySelector('audio[data-slice-sound]');
const dom_startButton = dom_body.querySelector('.right-ui__button[data-start]');
const dom_stopButton = dom_body.querySelector('.right-ui__button[data-stop]');


/* CONSTANTS */


const fruitsArray = ['apple', 'banana', 'grapes', 'lemon', 'orange', 'peach', 'pear', 'pineapple', 'strawberry', 'watermelon'];


/* VARIABLES */


let playing = false,
    score = 0,
    tries = 3,
    fruitMovementRefreshTime = 6,
    countDown, fruitDropInterval, delayedAppearTimeout, step, sliceAnimationTimeout;


/* MAIN */


dom_startButton.addEventListener('click', handleStartOrReset);
dom_stopButton.addEventListener('click', handleManualStop);


/* FUNCTIONS  */


// Make element hidden
function makeElementsHidden(...elements) {
    elements.forEach(element => element.style.visibility = 'hidden')
}

// Make element visible
function makeElementsVisible(...elements) {
    elements.forEach(element => element.style.visibility = 'visible')
}

// Update tries display
function updateTriesDisplay() {
    const hearts = dom_body.querySelectorAll('.left-ui__heart');
    if (tries === 3) {
        hearts.forEach(heart => {
            makeElementsVisible(heart)
        })
    } else if (tries < 3) {
        makeElementsHidden(hearts[tries])
    }
}

// Update an element's text content
function updateElementText(element, text) {
    element.textContent = `${text}`;
}

// Update Score display
function updateScoreDisplay() {
    updateElementText(dom_scoreDisplay, score)
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

// Ensure message visibility by hidding it's siblings, showing it's parent and itself
function ensureMessageVisibility(messageElement) {
    const messageElementParent = messageElement.parentElement;
    const messageElementSiblings = Array.from(messageElementParent.children).filter(element => {
        return element === messageElement ? false : true
    })
    hideMessages(...messageElementSiblings);
    showMessages(messageElement);
    makeElementsVisible(messageElementParent)
}

// Display Gameover message
function displayGameOverMessage() {
    updateElementText(dom_gameOverScore, score);
    ensureMessageVisibility(dom_gameOverMessage)
}

// Display Countdown message
function displayCountdownMessage(count) {
    ensureMessageVisibility(dom_countDownMessage);
    updateElementText(dom_countDownMessage, count)
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
    translateElementUsingTransform(dom_fruitImg, coordinates);
    // Generate random index to access a fruit from the array
    const fruitName = getRandomArrayValue(fruitsArray);
    const imgSrc = `./assets/img/${fruitName}.webp`;
    setImageSrc(dom_fruitImg, imgSrc);
    makeElementsVisible(dom_fruitImg);
    // Calculate the Ratio of the fruit width, relative to the main board
    const fruitWidth = dom_fruitImg.clientWidth;
    const mainBoardWidth = dom_mainBoard.clientWidth;
    const fruitWidthRatio = calculateLongitudeRatio(fruitWidth, mainBoardWidth);
    // Calculate a random left offset to translate the fruit, relative to the main board
    let leftOffset = Math.floor(Math.random() * mainBoardWidth);
    // Check if fruit would overflow with the generated coordinate. If it's the case, substract the fruit width from the coordinate to prevent it.
    if (leftOffset > mainBoardWidth * fruitWidthRatio) {
        const coordinates = {
            x : leftOffset - fruitWidth,
            y : 0
        }
        translateElementUsingTransform(dom_fruitImg, coordinates)
    } else {
        const coordinates = {
            x : leftOffset,
            y : 0
        }
        translateElementUsingTransform(dom_fruitImg, coordinates)
    }
    
    dom_fruitImg.addEventListener('pointerleave', handleFruitSlice);
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
    const { coordinateX, coordinateY } = get2dTranslateCoordinates(dom_fruitImg);
    const coordinates = {
        x : coordinateX,
        y : coordinateY + step
    }
    translateElementUsingTransform(dom_fruitImg, coordinates);
}

// Handle when fruit passes the game board
function handleFruitPass() {
    const fruitCoordinateY = get2dTranslateCoordinates(dom_fruitImg).coordinateY;
    if (fruitCoordinateY > dom_mainBoard.clientHeight + dom_fruitImg.clientHeight) {
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
    makeElementsHidden(dom_fruitImg);
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
            updateElementText(dom_startButton, 'Reset');
            hideMessages(dom_countDownMessage);
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
        makeElementsHidden(dom_mainBoardMessage);
        gameStartCountDown()
    }
}

// Handle manual stop
function handleManualStop() {
    if (playing) {
        gameOver();
        displayGameOverMessage();
        showMessages(dom_startMessage);
        updateElementText(dom_startButton, 'Start')
    }
}

// Rotate element using transform
function rotateElementUsingTransform(element, degrees) {
    // To avoid transform:translate reset, the translate coordinates are required to be set
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
    sliceActionOnElement(dom_fruitImg, dom_sliceAudio);
    delayedAppearTimeout = setTimeout(() => {
        dropFruit()
    }, 1000);
    
    dom_fruitImg.removeEventListener('pointerleave', handleFruitSlice)
}

}())