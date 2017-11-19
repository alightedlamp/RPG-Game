// Import dependencies
import $ from 'jquery';
import mo from 'mo-js';

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
      // Initialize game state values
      this.isPlaying = false;
      this.isFighting = false;

      this.initializePlayerAttriutes();

      // Holds element name, character name, their health, and an image
      this.playerMap = playerMap;
    }
    startGame(choice) {
      // Game has commenced!
      this.isPlaying = true;

      // Grab the player object from the map
      this.currentPlayer = this.playerMap[choice.slice(-1) - 1];

      // Create an array to hold onto remaining enemies
      this.enemies = this.playerMap.filter(
        enemy => enemy.el !== this.currentPlayer.el
      );

      // Save to new variables because values change throughout game
      this.currentPlayerHealth = this.currentPlayer.health;
      this.currentPlayerAttackPower = this.currentPlayer.attackPower;

      return this;
    }
    setDefender(choice) {
      this.isFighting = true;

      // Grab the player object from the map
      this.defender = this.playerMap[choice.slice(-1) - 1];
      this.defenderHealth = this.defender.health;

      return this;
    }
    attackDefender() {
      // Add health to user's player, decrement health from defender
      this.defenderHealth -= this.currentPlayerAttackPower;
      this.currentPlayerHealth -= this.defender.counterAttackPower;
      this.currentPlayerAttackPower += this.defender.attackPower;

      // Check health remaining, fork game
      // If user's health is 0 and defender is > 0, game over!
      if (this.currentPlayerHealth <= 0 && this.defenderHealth > 0) {
        return 'Game over, you lose!';
      } else if (this.currentPlayerHealth > 0 && this.defenderHealth <= 0) {
        return this.eliminateDefender(this.defender);
      } else if (this.currentPlayerHealth > 0 && this.defenderHealth > 0) {
        return '';
      } else {
        return 'Well, this is awkward';
      }
      return this;
    }
    eliminateDefender(player) {
      // Remove defender from DOM and this.enemeies
      $(`#${player.el}`).remove();
      this.enemies.splice(this.enemies.indexOf(player.el), 1);

      // If there are no more enemies left, the game is over!
      if (this.enemies.length === 0) {
        return 'You win!';
      } else {
        this.isFighting = false;
        this.defender = '';
        return '';
      }
      return this;
    }
    initializePlayerAttriutes() {
      this.currentPlayer = '';
      this.currentPlayerHealth = 0;
      this.currentPlayerAttackPower = 0;
      this.currentplayerCounterAttackPower = 0;

      this.defender = '';
      this.defenderHealth = 0;
      this.defenderAttackPower = 0;
      this.defenderCounterAttackPower = 0;
      return this;
    }
    resetGame() {
      this.isPlaying = false;
      this.playerChoice = '';
      this.defender = '';

      this.initializePlayerAttriutes();
      return this;
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
            <div class="image" style="background-image: url('${player.image}'); background-size: cover; background-position: center">
            </div>
            <div class="player-health">
              <p>${player.health}</p>
            </div>
          </div>
        `);
      });
      return this;
    }
    startGame() {
      $('#main-app').css('display', 'flex');
      $('#start').hide();
      $('#status p').empty();
      return this;
    }
    showPlayerChoice(choice) {
      // Remove the pick a player heading
      $('#players-container h2').remove();

      // Change the image sizes once a characeter has been selected and game started
      $('.player').addClass('in-play');
      // Move player's choice to the appropriate div
      $(`#${choice.el}`)
        .detach()
        .appendTo('#player-choice');

      // Move enemies to the appropriate div
      $('#players')
        .detach()
        .appendTo('#enemies');
      return this;
    }
    showDefender(choice) {
      // Move chosen enemy into defender area of DOM
      $(`#${choice.el}`)
        .detach()
        .appendTo('#defender');
      return this;
    }
    animate(event, el) {
      let parentEl;
      if (el) {
        parentEl = el;
      } else if (game && game.defender) {
        parentEl = `#${game.defender.el}`;
      } else {
        parentEl = '#main-app';
      }
      const burst = new mojs.Burst({
        left: 40,
        top: 60,
        parent: parentEl
      });
      burst.replay();
      return this;
    }
    updateStatus(status) {
      if (arguments.length > 0 && arguments[0].length > 0) {
        $('#status')
          .append(`<div class="status-text">${status}</div>`)
          .css('display', 'block')
          .animate({ opacity: 1 }, 250, 'linear', function() {
            // After two seconds, make the status modal go away
            setTimeout(
              () =>
                $(this).animate({ opacity: 0 }, 250, 'linear', () =>
                  $(this)
                    .css('display', 'none')
                    .empty()
                ),
              750
            );
          });
      } else {
        $('#status').empty();
      }
      return this;
    }
    updateAttributes(playerEl, defenderEl, playerHealth, defenderHealth) {
      $(`#${playerEl} .player-health`).text(playerHealth);
      $(`#${defenderEl} .player-health`).text(defenderHealth);
    }
    resetDisplay() {
      $('#main-app').css('display', 'none');
      $('#players').append('<h2>Pick a player!</h2>');
      $('#player-choice').empty();
      $('#defender').empty();
      $('#enemies').empty();
      $('#players').empty();
      return this;
    }
  }

  /*
    CONTROLLER
     
    These are the event handlers that manages the communication between the Game and Display classes.
  */

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
        .animate(e)
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
        .animate(e)
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
