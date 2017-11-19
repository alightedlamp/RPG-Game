// Import dependencies
import $ from 'jquery';
import mo from 'mo-js';

// Import game data modules
import { playerMap } from './js/playerMap';
import { theme } from './js/theme';

import Game from './js/Game';
import Display from './js/Display';

$(document).ready(function() {
  // Initalize game and display variables to the global scope, because I don't know a better way to use both in the Controller
  let game;
  let display;

  display = new Display();
  display.initializeDisplay();

  /* 
    Because the player elements are dynamically generated in the Display class, the event must be delegated 
    using `on`, so the event bubbles up from the dynamiclly generated `.player` element to the `players` containing div
  */
  $('#players').on('click', '.player', function playerClickHandler(e) {
    // Set the user's choice based on the element's id clicked
    let choice = $(this).attr('id');

    if (!game) {
      // Initialize the game and start with user's choice and set isPlaying to true
      game = new Game();
      game.startGame(choice);
      // Display game state change
      display
        .startGame()
        .animate(game, e)
        // Create a new display and update the game state with player's choice and move emenies to the right space
        .showPlayerChoice(game.currentPlayer);
    } else if (game.currentPlayer.el === choice) {
      // Offer some sort of feedback when player clicks themselves for some reason
      display.updateStatus("You're alive! You look nice, keep it up!");
    } else if (game.defender && game.isFighting) {
      // If there is a defender, you should not be able to click another characeter
      display.updateStatus(
        `You can't pick another enemy right now! Attack ${game.defender.name}!`
      );
    } else {
      // Set the defender
      game.setDefender(choice);
      // Update display from Game state
      display.showDefender(game.defender);
    }
  });

  $('#attack').on('click', function attackClickHandler(e) {
    if (!game.defender) {
      display.updateStatus('There is no one to attack! Pick an enemy!');
    } else {
      display
        .updateStatus()
        .animate(game, e)
        .updateStatus(game.attackDefender())
        .updateAttributes(
          game.currentPlayer.el,
          game.defender.el,
          game.currentPlayerHealth,
          game.defenderHealth
        );
    }
  });

  $('#reset').on('click', function resetClickHandler() {
    if (game.isPlaying) {
      game.resetGame();
      display.resetDisplay();
    }
  });
});
