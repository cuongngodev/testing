"use strict"
$(document).ready(() => {
    $('.warning').hide(); // turn off all warning
    let isTwoPlayers = true;
    const player1Container= $('#player1Container');
    const player2Container = $('#player2Container');
    player2Container.show();

    const toggleBtn = $('#togglePlayer2');
    const startBtn = $('#submitButton');
    
    // toggle for option choosing 1 or 2 player, now focusing on working with 2 player first
    // Toggle player 2
    toggleBtn.on('click',()=> {
        $('.warning').hide();
        isTwoPlayers=!isTwoPlayers;
        if(isTwoPlayers===false) {
            player2Container.hide();
        }
        else {player2Container.show()}
        // change content btn
        isTwoPlayers? toggleBtn.text('Remove Player 2') : toggleBtn.text('Add Player 2')
    })

    startBtn.on('click', (event) => {
        event.preventDefault();
        handleSubmit();
    })
    function showWarningMessage(eleId,show)
    {
        show? $(`#${eleId}`).show(): $(`#${eleId}`).hide()
    }
    function isNotValidName(name){
        return name.trim().length === 0
    }
    function isNotValidAge(age){
        // age = parseInt(age)
        return age < 10 && age > 99 || age.trim().length === 0
    }

    function handleSubmit() {
        let isValid = true;
        //Player 1
        const player1Container= $('#player1Container');
        // User Input
        const player1Name = $('#player1Name');
        const player1Age=$('#player1Age');
        // Player 2
        // User Input
        const player2Name = $('#player2Name');
        const player2Age=$('#player2Age');

        // handle player 1
        if (isNotValidName(player1Name.val())){
            $('#player1NameWarningMessage').show();
            isValid = false;
        }
        // handle when age is out of valid range
        if (isNotValidAge(player1Age.val())){
            $('#player1AgeWarningMessageValue').show()
            isValid = false;
        }
        // handle player 2 
        if (isNotValidName(player2Name.val())){
            $('#player2NameWarningMessage').show();
            isValid = false;
        }
        // handle when age is out of valid range
        if (isNotValidAge(player2Age.val())){
            $('#player2AgeWarningMessageValue').show()
            isValid = false;
        }
        RemoveWarningWhenKeyDown(player1Name,$('#player1NameWarningMessage'))
        RemoveWarningWhenKeyDown(player1Age,$('#player1AgeWarningMessageValue'))
        RemoveWarningWhenKeyDown(player2Name,$('#player2NameWarningMessage'))
        RemoveWarningWhenKeyDown(player2Age,$('#player2AgeWarningMessageValue'))

        // submit successfully
        if (isValid===true)
        {
            // get player data
            const player1Data = {
                name: player1Name.val(),
                age: player1Age.val()
            };
            const player2Data = {
                name: player2Name.val(),
                age: player2Age.val()
            };
            // save data to localStorage and redirect to next page
            const gameData = {
                isTwoPlayers,
                player1: player1Data,
                player2: isTwoPlayers? player2Data : null
            };
            localStorage.setItem('gameData', JSON.stringify(gameData));

            console.log("Form Submitted successfully");
            window.location.href = './pages/characters.html';
        }
    }
    /* RemoveWarningWhenKeyDown function is used to turn off warningError message in the event user type key down, it takes the the id of the input and the error message id as the 2nd para */
    function RemoveWarningWhenKeyDown(element, errorElement ){
            element.on('keydown', () => {
                errorElement.hide()
            })
        }
});