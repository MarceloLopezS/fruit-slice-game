# Fruit Slice Lite

This is a lite Fruit Slice Game (similar to Fruit Ninja) developed with HTML, CSS and Vanilla JavaScript.

The app is intended to present a simple, yet intuitive, user interface and experience across desktop and mobile devices. For this, the latest CSS technologies are used in conjunction with the HTML code and the core functionality is handled by JavaScript.

The JavaScript code is the core part that is responsible for the game logic. The aproach is driven towards Functional Programming and it's center on clean, readable code with good practices. It's divided in four section for better readability: DOM Elements, Constants, Variables, Main and Functions.

The DOM Elements section stores the elements that will be manipulated to achieve the game's visual functionallity and interactivity.

The Variables section contains the initialized variables in the highest scope so they can easily be accessed and modified inside different functions.

The Constants section contains the fruits array set in the highest scope.

The Main section sets the event listeners for the main controls, which are the Start and Stop button.

The Functions section contains all the necessary functions for the game to work. These are:

- `updateTriesDisplay`: Updates the display of the player’s remaining tries by showing or hiding heart icons.
- `updateScoreDisplay`: Updates the display of the player’s score.
- `hideMessage`: Hides the message displayed, on the game board, by the element or elements that are passed as arguments.
- `displayGameOverMessage`: Displays the game over message on the game board and shows the player’s final score.
- `displayCountdownMessage`: Displays the countdown message on the game board.
- `initGame`: Initializes the game by setting the score to 0 and tries to 3, and updating their respective displays.
- `subtractTry`: Subtracts one try from the player’s remaining tries and updates their display.
- `generateFruit`: Generates a random fruit and sets its position on the game board.
- `setStep`: Sets the step value for moving the fruit based on the player’s current score.
- `moveFruitY`: Moves the fruit down along the Y-axis by adding step value to its current position.
- `dropFruit`: This function generates a new fruit and moves it down along the Y-axis at a set interval until it reaches the bottom of the game board or is sliced by the player.
- `handleFruitPass`: This function checks if the fruit has reached the bottom of the game board. If it has, it subtracts one try from the player’s remaining tries and generates a new fruit.
- `gameOver`: This function stops all intervals and timeouts, hides the fruit, and sets playing to false to indicate that the game is over.
- `gameStartCountDown`: This function starts a countdown before starting a new game. When it reaches 0, it starts dropping fruits.
- `handleStartOrReset`: This function handles clicks on the start button. If a game is currently being played, it resets it. Otherwise, it starts a new game with a countdown.
- `handleStop`: This function handles clicks on the stop button. If a game is currently being played, it stops it and displays a game over message.
- `handleFruitSlice`: This function handles when a player slices a fruit. It stops all intervals and timeouts, increases the player’s score by one, plays a slice sound, adds a sliced class to fruitImg element, removes pointerleave event listener from fruitImg element and generates a new fruit after 1 second delay.

This code is mainly a use example of CSS for responsiveness across devices and JavaScript for interactivity by implementing DOM manipulation, Event Listeners, Intervals and Timeouts using the latest ECMAScript features such as template strings, arrow functions, etc.