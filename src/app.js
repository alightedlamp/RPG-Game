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

  const display = new Display();
  display.initializeDisplay();

  /* 
    Because the player elements are dynamically generated in the Display class, the event must be delegated 
    using `on`, so the event bubbles up from the dynamiclly generated `.player` element to the `players` containing div
  */
  $('#players').on('click', '.player', function playerClickHandler(e) {
    // Initialize the game and start with user's choice and set isPlaying to true
    function startRound() {
      game = new Game();
      game.startGame(choice);

      display
        .startGame()
        .animate(game, e)
        .showPlayerChoice(game.currentPlayer);
    }

    // Set the user's choice based on the element's id clicked
    let choice = $(this).attr('id');

    if (!game) {
      // If the game hasn't started once yet, start it
      startRound();
    } else if (game.enemies.length === 0 && !game.isPlaying) {
      // If the game has started once, and has been reset - DOESN'T WORK
      startRound();
    } else if (game.currentPlayer.el === choice) {
      // Offer some sort of feedback when player clicks themselves for some reason
      display.updateStatus("You're alive! You look nice, keep it up!");
    } else if (game.defender && game.isFighting && game.isPlaying) {
      // If there is a defender, you should not be able to click another characeter
      display.updateStatus('ALREADY_ATTACKING', game.defender);
    } else if (game.defender && !game.isPlaying) {
      // Try to nudge user to start a new game by highlighting reset button
      display.animate(game, event, '#reset');
    } else {
      // Set the defender
      game.setDefender(choice);
      // Update display from Game state
      display.showDefender(game.defender);
    }
  });

  $('#attack').on('click', function attackClickHandler(e) {
    if (!game.defender) {
      // If there is no defender, tell user to pick someone
      display.updateStatus('IDLE');
    } else {
      // Update health values in game and display
      let currentDefender = game.defender;
      display
        .updateStatus()
        .animate(game, e)
        .updateStatus(game.attackDefender(), currentDefender)
        .updateAttributes(
          game.currentPlayer.el,
          game.defender.el,
          game.currentPlayerHealth,
          game.defenderHealth,
          game.currentPlayerAttackPower
        );
    }
  });

  $('#reset').on('click', function resetClickHandler() {
    game.resetGame();
    display.resetDisplay().initializeDisplay();
  });
});
