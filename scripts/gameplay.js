// Call when page loads
$(document).ready(async () => {
    // $('#character-confirm').hide();
    await initializeGameplay();
    $('#pikachu').attr('src',PIKACHU_WATCH);
    $('#restart-btn').hide();
});

// ========================= Game states and variables =========================
let gameState = 'waiting';
let isPikachuWatching = false;
let watchInterval;
let moveInterval;
let player1Pos = 0;
let player2Pos = 0;

let gameTimer;
let timeLimit;
let timeLeft;
const PIKACHU_DONT_WATCH = "/watcher/pikachu/pikachu-dont-watch.png";
const PIKACHU_WATCH = "/watcher/pikachu/pikachu-watch.png";
const FINISH_LINE = 95;
const MOVE_SPEED = 2;
// =============================================================================
// Key controls
const keys = {
    ArrowRight: false,
    d: false
};
window.startGame = function() {
    // make this function global
    // - Initializes game state
    // - Resets player positions
    // - Starts pikachu movement and game loop
    // - Updates UI elements
    $('#difficulty').show();
    if (timeLimit === undefined) {
        $('#status').text('Please select difficulty first');
        return;
    }
    console.log("Game starting...");
    gameState = 'playing';
    player1Pos = 0;
    player2Pos = 0;
    updatePlayerPositions();
    $('#start-btn').hide();
    $('.character-selection').remove();
    $('.color-selection').hide();
    $('#status').text('Game Started!');
    $('.color-selection').hide();
    $('.game-controls').hide();
    startTimer();
    startPikachuMovement();
    startGameLoop();
}
// Sets game time limit based on chosen difficulty
function setDifficulty(level) {
    timeLimit = level === 'easy' ? 20 : 15;
    timeLeft = timeLimit;
    $('#timeDisplay').text(timeLeft);
    $('#difficulty').hide();
    startGame();
}

// Starts countdown timer based on difficulty
function startTimer() {
    timeLeft = timeLimit;
    gameTimer = setInterval(() => {
        timeLeft--;
        $('#timeDisplay').text(timeLeft);
        if (timeLeft <= 0) {
            endGame('Time\'s up! Game Over!');
            // $('#restart-btn').show
        }
    }, 1000);
}
// Stops and resets game timer
function stopTimer() {
    clearInterval(gameTimer);
    timeLeft = 0;
    $('#timeDisplay').text(timeLeft);
 }
 // Pikachu Control
function togglePikachu(isWatching) {
    let pikachu = $('#pikachu');
    if (isWatching) {
        pikachu.attr('src',PIKACHU_WATCH);
        pikachu.addClass('watching');
    } else {
        pikachu.attr('src',PIKACHU_DONT_WATCH);
        pikachu.removeClass('watching');
    }
    console.log("Toggled Pikachu:", isWatching ? "watching" : "not watching");

}
function startPikachuMovement() {
    //- Controls pikachu's watching/not watching states
    // - Toggles pikachu animation
    // - Updates status message
    // - Triggers movement checks
    // let gameStatus= $('#status');

    if (watchInterval) clearInterval(watchInterval);

    watchInterval = setInterval(() => {
        isPikachuWatching = !isPikachuWatching;
        togglePikachu(isPikachuWatching);
        $('#status').text(isPikachuWatching ? 'He is watching! 👀' : 'Moveeee! 🏃');
        
        if (isPikachuWatching) {
            setTimeout(checkMovement,5);
        }
    }, Math.random() * 2000 + 1000);
}

function checkMovement() {
// - Called when pikachu turns to watch
// - Checks if any player is moving
// - Ends game if movement detected
    if (keys.ArrowRight || keys.d) {
        const playerData = JSON.parse(localStorage.getItem('gameState'));
        const losingPlayer = keys.ArrowRight ? 
            playerData.gameData.player1.name : 
            playerData.gameData.player2.name;
        endGame(`${losingPlayer} was caught moving!`);
        // resetGame();
    }
}
// Controls player movement based on key presses when Pikachu isn't watching
function startGameLoop() {
    moveInterval = setInterval(() => {
        if (!isPikachuWatching) {
            if (keys.ArrowRight) {
                player1Pos = Math.min(player1Pos + MOVE_SPEED, FINISH_LINE);
            }
            if (keys.d) {
                player2Pos = Math.min(player2Pos + MOVE_SPEED, FINISH_LINE);
            }
            updatePlayerPositions();
            checkWinner();
        }
    }, 50);
}
// Updates visual position of players on screen
function updatePlayerPositions() {
// - Updates CSS left position of player elements
// - Moves players based on player1Pos/player2Pos values
    $('#player1').css('left', player1Pos + '%');
    $('#player2').css('left', player2Pos + '%');
}
// Detects if players move while Pikachu is watching
function checkWinner() {
    const playerData = JSON.parse(localStorage.getItem('gameState'));
    if (player1Pos >= FINISH_LINE) {
        endGame(`${playerData.gameData.player1.name} wins!`);
        // resetGame();
    } else if (player2Pos >= FINISH_LINE) {
        endGame(`${playerData.gameData.player2.name} wins!`);
        // resetGame();

    }
}

function endGame(message) {
// - Stops game loops and intervals
// - Updates status with win/lose message  
// - Shows play again button
// - Sets game state to 'ended'
    timeLimit = undefined;
    gameState = 'ended';
    $('.game-controls').show();

    stopTimer();
    clearInterval(watchInterval);
    clearInterval(moveInterval);
    $('#status').text(message);
    $('#start-btn').show();
    // modal.style.display = 'flex';
}

function resetGame() {
    // Resets all game states, positions, timers, and UI to initial state

    // Clear timers and intervals
    clearInterval(gameTimer);
    clearInterval(watchInterval);
    clearInterval(moveInterval);
    
    // Reset game state
    gameState = 'waiting';
    isPikachuWatching = false;
    player1Pos = 0;
    player2Pos = 0;
    timeLeft = 0;
    
    // Reset UI
    updatePlayerPositions();
    $('#timeDisplay').text('0');
    $('#status').text('Press Start to begin!');
    $('#pikachu').attr('src', PIKACHU_DONT_WATCH);
    $('#difficulty').show();
    $('#start-btn').show();
    // $('#restart-btn').show();
}

// Event Listeners
document.addEventListener('keydown', (event) => {
    if (gameState === 'playing' && (event.key === 'ArrowRight' || event.key === 'd')) {
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'd') {
        keys[event.key] = false;
    }
});

// startBtn.addEventListener('click', startGame);
// Fetches character images from API or local storage
async function getCharacterImage(playerData) {
    try {
        // Log the incoming data to debug
        console.log("Getting image for:", playerData);

        if (playerData.type === 'pokemon') {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${playerData.character.toLowerCase()}`);
            const data = await response.json();
            return data.sprites.front_default;
        } else {
            const response = await fetch('../package.json/squid-game-characters.json');
            const data = await response.json();
            
            // Make sure we have valid data
            if (!data.characters) {
                console.error("No characters found in JSON");
                return null;
            }

            // Convert character to number if it's a string
            const characterIndex = parseInt(playerData.character);
            console.log("Character index:", characterIndex);

            // Check if character exists at this index
            if (data.characters[characterIndex]) {
                console.log("Found character:", data.characters[characterIndex]);
                return data.characters[characterIndex].imageUrl;
            } else {
                console.error("No character found at index:", characterIndex);
                return null;
            }
        }
    } catch (error) {
        console.error('Error getting character image:', error);
        return null;
    }
}

// Initializes player characters and skins from saved state
async function initializeGameplay() {
    $('#character-confirm')
    const gameState = JSON.parse(localStorage.getItem('gameState'));
    if (gameState) {
        // Set player 1 character
        const player1Data = gameState.selectedCharacters.player1;
        const player1Skin = gameState.playerSkins.player1;
        const player1Img = $('#player1 img');
        
        // Get and set player 1 image
        const player1ImgSrc = await getCharacterImage(player1Data);
        player1Img.attr('src', player1ImgSrc);
        $('#player1').css('backgroundColor', player1Skin);

        // Set player 2 character
        const player2Data = gameState.selectedCharacters.player2;
        const player2Skin = gameState.playerSkins.player2;
        const player2Img = $('#player2 img');
        
        // Get and set player 2 image
        const player2ImgSrc = await getCharacterImage(player2Data);
        player2Img.attr('src', player2ImgSrc);
        $('#player2').css('backgroundColor', player2Skin);
        $('.game-container').show();  // Add this div in your HTML

    }
}
function hideGameControls() {
    $('.game-controls').fadeOut();
 }
 
 function showGameControls() {
    $('.game-controls').fadeIn();
 }