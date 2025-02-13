$(document).ready(() => {

    // $(".players-container").hide();
    // $(".players-container").show();
    // $(".character-grid").hide();
    // $(".character-grid").show();
    $("#game-container").hide();
    // $("#game-container").show();
    // Configuration
    const CONFIG = {
        POKEMON_API_URL: 'https://pokeapi.co/api/v2/pokemon/',
        SQUID_CHARACTERS_PATH: '../package.json/squid-game-characters.json',
        POKEMON_NAMES: ['Charizard', 'Dragonite', 'Eevee', 'Gyarados'],
        SKIN_COLORS:['#fff632','#ffe6e2','#ff9808','#fd1124', '#12deed'],
        DEFAULT_PROFILES: {
            player1: {
                type: 'squid',
                id: 1,  // First squid character
            },
            player2: {
                type: 'pokemon',
                name: 'Dragonite',
            }
        }
    };

    // Player Profile Management, it is used to set player profile img
    const PlayerProfiles = {
        async setProfile(playerId, type, character) {
            //Sets player image based on character type (pokemon/squid)
            const profileImg = $(`#${playerId}Image`);
            try {
                // set profile img
                if (type === 'pokemon') {
                    const imgUrl = await fetchPokemonImg([character]); // fetch a signle pokemon name
                    // set src 
                    profileImg.attr('src', imgUrl[0]);
                } else if (type === 'squid') {
                    const characters = await LoadCharacters(CONFIG.SQUID_CHARACTERS_PATH);
                    // set src 
                    profileImg.attr('src', characters[character].imageUrl);
                }
            } catch (error) {
                console.error(`Error setting ${playerId} profile:`, error);
                profileImg.attr('src', '../images/default-profile.png');
            }
        },

        async resetProfiles() {
            //Resets both players to default profiles
            const player1 = CONFIG.DEFAULT_PROFILES.player1;
            const player2 = CONFIG.DEFAULT_PROFILES.player2;
            await this.setProfile('player1', player1.type, player1.id);
            await this.setProfile('player2', player2.type, player2.name);
        }
    };

    // Game State Management
    const GameState = {
        selectedCharacters: { //Updates character selection and profile image
            player1: null,
            player2: null
        },
        playerSkins: { 
            player1: null,
            player2: null
        },
        // This method set the player or update player profile (change profile image, type of character squid or pokemon), and skin
        setSelectedCharacter(playerId, characterType, characterNameOrId) {
            // updates object in selectedCharacters.
            this.selectedCharacters[playerId] = { 
                type: characterType, 
                character: characterNameOrId, 
                skin: '#ffffff'};
            // Update img profile of the specified player => change the profile image of the player
            PlayerProfiles.setProfile(playerId, characterType, characterNameOrId);
            this.saveState();
        },
        setPlayerSkin(playerId, skinColor){ //Updates player color selection
            this.playerSkins[playerId] = skinColor;
            $(`#${playerId}Image`).css('backgroundColor', skinColor);
            this.saveState();
        },
        // using slider to set time
        setDuration(){

        },
        /* Usage:
            If setting a Pokemon character, use name
            setSelectedCharacter('player1', 'pokemon', 'pikachu');

            If setting a Squid Game character, use number
            setSelectedCharacter('player2', 'squid', 0);
         */
        // save current state to local storage
        saveState() {// Saves current game state to localStorage
            const gameState = {
                // save current state of player
                selectedCharacters: this.selectedCharacters,
                // save skin color
                playerSkins: this.playerSkins,
                // included their previous infor (name, age)
                gameData: JSON.parse(localStorage.getItem('gameData'))
            };
            // save to local Storage
            localStorage.setItem('gameState', JSON.stringify(gameState));
        },

        loadState() { // get previous saved state from localstorage
            const savedState = localStorage.getItem('gameState');
            if (savedState) {
                // converts json string to js obj
                const state = JSON.parse(savedState);
                this.selectedCharacters = state.selectedCharacters;
                
                // Restore profiles if they exist
                Object.entries(this.selectedCharacters).forEach(([playerId, data]) => {
                    if (data) {
                        PlayerProfiles.setProfile(playerId, data.type, data.character);
                    }
                });
            }
        }
    };

    // This uses to fetch Pokemon images from PokeAPI
    async function fetchPokemonImg(pokemonNames) {
        try {
            const imgPromises = pokemonNames.map(async (name) => {
                const response = await fetch(`${CONFIG.POKEMON_API_URL}${name.toLowerCase()}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch Pokemon ${name}`);
                }
                const data = await response.json();
                // return img url
                return data.sprites.front_default;
            });
            return await Promise.all(imgPromises);
        } catch (error) {
            console.error('Error fetching Pokemon images:', error);
            return [];
        }
    }
    // Load the path of the character img
    async function LoadCharacters(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error('Network error');
            }
            const data = await response.json();
            return data.characters;
        } catch (error) {
            console.error('Error loading characters:', error);
            throw error;
        }
    }

    // Sets up Pokemon character images in grid
    async function setSourceForCharacters(pokemonNames, imgElements) {
        try {
            imgElements.each((_, img) => $(img).addClass('loading'));
            const imgUrls = await fetchPokemonImg(pokemonNames);
            
            imgElements.each((index, img) => {
                $(img).removeClass('loading');
                if (imgUrls[index]) {
                    $(img).attr('src', imgUrls[index]);
                }
            });
        } catch (error) {
            console.error('Error setting Pokemon images:', error);
            imgElements.each((_, img) => $(img).removeClass('loading'));
        }
    }
    // Sets up Squid Game character images in grid
    async function setSourceForSquidCharacters(imgElements) {
        try {
            const characters = await LoadCharacters(CONFIG.SQUID_CHARACTERS_PATH);
            
            imgElements.each((index, img) => {
                if (characters[index]) {
                    $(img).attr('src', characters[index].imageUrl);
                }
            });
        } catch (error) {
            console.error('Error setting squid characters:', error);
            imgElements.each((_, img) => $(img).removeClass('loading'));
        }
    }

    // Main setup function - loads data, sets up grids, profiles
    async function initializeGame() {
        try {
            // Load game data
            const gameData = JSON.parse(localStorage.getItem('gameData'));
            if (gameData) {
                $('#player1Name').text(gameData.player1.name);
                $('#player1Age').text(gameData.player1.age);
                $('#player2Name').text(gameData.player2.name);
                $('#player2Age').text(gameData.player2.age);
            }

            // Set up character grids
            const pokemonImgSelections = $('.pokemon-characters .character-item img');
            const squidImgSelections = $('.squid-characters .character-item img');
            // load all characters for selection
            await Promise.all([
                setSourceForCharacters(CONFIG.POKEMON_NAMES, pokemonImgSelections),
                setSourceForSquidCharacters(squidImgSelections)
            ]);

            // Set default profiles
            await PlayerProfiles.resetProfiles();

            // Load saved state
            GameState.loadState();
            initializeCharacterSelection();

        } catch (error) {
            console.error('Error initializing game:', error);
        }
    }
    //Manages character selection flow
    function initializeCharacterSelection() {
        let currentPlayer = 'player1';
        updateTurnDisplay(currentPlayer);
        //Sets up click handlers for character selection
        function setupCharacterSelection() {
            // $('.color-selection').hide();
            // Clear previous handlers
            $('.character-item').off('click');
            $('#character-confirm').off('click');
    
            // Handle character click
            $('.character-item').click(function() {
                const characterType = $(this).closest('.pokemon-characters').length ? 'pokemon' : 'squid';
                const characterId = $(this).index();
                
                // Highlight selected character
                $('.character-item').removeClass('selected');
                $(this).addClass('selected');
    
                // Save selection temporarily
                const selection = {
                    type: characterType,
                    character: characterType === 'pokemon' ? CONFIG.POKEMON_NAMES[characterId] : characterId
                };
    
                // Handle confirm button
                $('#character-confirm').click(function() {
                    if (!$('.character-item.selected').length) {
                        showError(currentPlayer);
                        return;
                    }
    
                    // Save character and proceed to skin selection
                    GameState.setSelectedCharacter(
                        currentPlayer,
                        selection.type,
                        selection.character
                    );
    
                    // Show skin selection
                    showSkinSelection();
                });
            });
        }
        // Displays color selection UI
        function showSkinSelection() {
            $('.character-grid').fadeOut(400, function () {
                const colorGrid = $('<div>', { class: 'color-selection' });
                $('#select-turn').text(`Choose color skin for Player ${currentPlayer === 'player1' ? '1' : '2'}`);
        
                CONFIG.SKIN_COLORS.forEach(color => {
                    const colorBox = $('<div>', {
                        class: 'color-item',
                        css: { backgroundColor: color }
                    });
        
                    colorBox.click(function () {
                        $('.color-item').removeClass('selected');
                        $(this).addClass('selected');
                        $(`#${currentPlayer}Image`).css('backgroundColor', color);
        
                        $('#character-confirm').off('click').click(function () {
                            const selectedColor = $('.color-item.selected').css('backgroundColor');
                            if (!selectedColor) {
                                showError(currentPlayer, 'color');
                                return;
                            }
        
                            // Save the selected color
                            GameState.setPlayerSkin(currentPlayer, selectedColor);
                            $('.color-selection').remove();
                            showCharacterSelection();
                            // Handle transitions
                            if (currentPlayer === 'player1') {
                                currentPlayer = 'player2';
                                $('.color-selection').remove();
                                showCharacterSelection();
                                updateTurnDisplay(currentPlayer);
                                
                                
                            } else {
                                finishSelection();
                            }
                        });
                    });
        
                    colorGrid.append(colorBox);
                });
        
                $('.color-selection').remove(); // Clean up any existing color grid
                $('.game-phase-container').append(colorGrid.fadeIn(300));
            });
        }
        
        
    
        // Shows character grid for selection
        function showCharacterSelection() {

            // $('.color-selection').fadeOut(400, function() {
            $('.character-grid').fadeIn(300);
            setupCharacterSelection(); // Re-initialize character click handlers
            // });
        }
        //Completes selection process, transitions to game
        function finishSelection() {
            $('#select-turn').html('All set! Ready to play!');
            $('#character-confirm')
                .text('Play')
                .off('click')
                .click(function() {
                    // Save final state
                    GameState.saveState();
                    
                    // Hide selection screen
                    $('.character-grid').fadeOut(400);
                    $('.players-container').fadeOut(400);
                    $('.color-selection').remove();
                    
                    // Show game interface
                    $("#game-container").fadeIn(400);
                    $(".character-selection").fadeOut(400);

                    
                    // Initialize gameplay
                    initializeGameplay();  // New function to set up game
                });
        }
    
        // Start the selectio n process
        setupCharacterSelection();
    }
    // Displays error messages during selection (not work yet)
    function showError(playerId, type = 'character') {
        const playerNumber = playerId === 'player1' ? '1' : '2';
        const message = type === 'color' 
            ? `Must choose color for Player ${playerNumber}`
            : `Must choose character for Player ${playerNumber}`;
        $('#select-turn').html(`<p style="color: red;">${message}</p>`);
    }
    // Updates UI to show current player's turn
    function updateTurnDisplay(playerId) {
        const playerNumber = playerId === 'player1' ? '1' : '2';
        $('#select-turn').html(`Select character for <strong>Player ${playerNumber}</strong>`);
    }
    // Start the game
    initializeGame();
});

