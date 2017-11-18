// Import dependencies
import $ from 'jquery';
// import mo from 'mo-js';

// Import game data modules
import { playerMap } from './js/playerMap';
import { theme } from './js/theme';

$(document).ready(function() {
  /* 
    MODEL

    The Game class handles all the logic in the game.

  */
  class Game {
    constructor(choice) {
      // Initialize game state variables
      this.isPlaying = false;
      this.isFighting = false;

      // Set the player's choice when a new game is created
      this.playerChoice = choice;
      this.defender = '';

      // Holds element name, character name, their health, and an image
      this.playerMap = playerMap;

      // Create an array to hold onto remaining enemies
      this.enemies = this.playerMap.map(enemy => enemy.name);
    }
    startGame(choice) {
      this.playerChoice = choice;
      this.isPlaying = true;
    }
    setDefender(choice) {
      console.log('update fighting status');
      this.defender = choice;
      this.isFighting = true;
    }
    attackDefender() {
      console.log('attacking defender');
      // Add health to user's player
      // Decrement health from defender
      // Check health remaining, fork game
      // If user's health is 0 and defender is > 0, game over!
      // If user's health is > 0 and defender is <= 0, eliminateDefender
      // Can the two be equal?
    }
    eliminateDefender() {
      // Remove defender from DOM and this.enemeies
      // Check game status, fork game
      // If this.enemies.length === 0, player wins
      // Otherwise, move on
    }
    updateHealth() {
      console.log('update health');
    }
    resetGame() {
      this.isPlaying = false;
      this.playerChoice = '';
      this.defender = '';
    }
  }

  /*
    VIEW

    The Display class manages the display of the Game state.
  */
  class Display {
    constructor() {
      this.playerMap = playerMap;
    }

    initializeDisplay() {
      this.playerMap.map(player => {
        $('#players').append(`
          <div class="player" id="${player.el}">
            <h3 class="player-header">${player.name}</h3>
            <div class="image">
              <!-- <img src="./assets/${player.img}" alt="${player.name}'s Avatar" class="player-img" /> -->
              <img src="http://via.placeholder.com/150x150" alt="Player 1 Avatar" class="player-img" />
            </div>
            <div class="player-health">
              <p>${player.health}</p>
            </div>
          </div>
        `);
        $('#main-app').css('display', 'block');
        // ANIMATE SOMETHING HERE
        $('#start').hide();
      });
    }

    showPlayerChoice(choice) {
      // Move player's choice to the appropriate div
      $(`#${choice}`)
        .detach()
        .appendTo('#player-choice');

      // Move enemies to the appropriate div
      $('#players')
        .detach()
        .appendTo('#enemies');
    }

    showDefender(choice) {
      // Move chosen enemy into defender area of DOM
      $(`#${choice}`)
        .detach()
        .appendTo('#defender');
    }

    animateAttack() {
      // Make the image flash red when attacked
    }

    updateStatus(status) {
      $('#status p').text(status);
    }

    resetDisplay() {
      $('#start').show();
      $('#players').empty();
    }
  }

  /*
    CONTROLLER
     
    These are the event handlers that manages the communication between the Game and Display classes.
  */

  // Initalize game and display variables to the global scope, because I don't know a better way to use both in the Controller
  let game;
  let display;

  /*
    Initalize the game once start button is selected - this is used to make the app flexible enough to 
    easily handle other theme
  */
  $('#start').on('click', function startClickHandler() {
    game = new Game();
    display = new Display();
    display.initializeDisplay();
  });

  /* 
    Because the player elements are dynamically generated in the Display class, the event must be delegated 
    using `on`, so the event bubbles up from the dynamiclly generated `.player` element to the `players` containing div
  */
  $('#players').on('click', '.player', function playerClickHandler() {
    // Set the user's choice based on the element's id clicked
    let choice = $(this).attr('id');

    if (!game.isPlaying) {
      // Start the game with user's choice and set isPlaying to true
      game.startGame(choice);

      // Create a new display and update the game state with player's choice and move emenies to the right space
      display.showPlayerChoice(game.playerChoice);
    } else if (game.playerChoice === choice) {
      // Offer some sort of feedback when player clicks themselves for some reason
      display.updateStatus("You're alive! You look nice, keep it up!");
    } else if (game.defender) {
      // If there is a defender, you should not be able to click another characeter
      display.updateStatus("You can't pick another enemy right now!");
    } else {
      // Go into attack mode
      game.setDefender(choice);
      display.showDefender(choice);
    }
  });

  $('#attack').on('click', function attackClickHandler() {
    if (!game.defender) {
      display.updateStatus('There is no one to attack! Pick an enemy!');
    } else {
      game.attackDefender();
    }
  });

  $('#reset').on('click', function resetClickHandler() {
    if (game.isPlaying) {
      game.resetGame();
    }
  });
});
