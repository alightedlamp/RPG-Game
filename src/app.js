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

      // Create an array to hold onto remaining enemies
      this.enemies = this.playerMap.map(enemy => enemy.name);
    }
    startGame(choice) {
      // Game has commenced!
      this.isPlaying = true;

      // Grab the player object from the map
      this.currentPlayer = this.playerMap[choice.slice(-1) - 1];

      // Grab player attribute values to keep object and array untouched
      this.currentPlayerHealth = this.currentPlayer.health;
      this.currentPlayerAttackPower = this.currentPlayer.attackPower;
      this.currentplayerCounterAttackPower = this.currentPlayer.counterAttackPower;

      // Then push them to a new object - this seems ridiculous, but am doing it to avoid having to pass in all these args to funcs that update game states
      this.currentPlayerAttributes = {
        health: this.currentPlayerHealth,
        attackPower: this.currentPlayerAttackPower,
        counterAttackPower: this.currentplayerCounterAttackPower
      };
    }
    setDefender(choice) {
      this.isFighting = true;

      // Grab the player object from the map
      this.defender = this.playerMap[choice.slice(-1) - 1];

      // Grab player attribute values to keep object and array untouched
      this.defenderHealth = this.defender.health;
      this.defenderAttackPower = this.defender.attackPower;
      this.defenderCounterAttackPower = this.defender.counterAttackPower;

      // Then push them to a new object - this seems ridiculous, but am doing it to avoid having to pass in all these args to funcs that update game states
      this.currentDefenderAttributes = {
        health: this.defenderHealth,
        attackPower: this.defenderAttackPower,
        counterAttackPower: this.defenderCounterAttackPower
      };
    }
    attackDefender() {
      console.log('attacking defender');
      // Add health to user's player
      this.updateHealth(currentPlayerAttributes, currentDefenderAttributes);
      // Decrement health from defender
      // Check health remaining, fork game
      // If user's health is 0 and defender is > 0, game over!
      // If user's health is > 0 and defender is <= 0, eliminateDefender
      // Can the two be equal?
    }
    eliminateDefender(player) {
      // Remove defender from DOM and this.enemeies
      // ANIMATE REMOVAL
      $(`#${player}`).remove();
      this.enemies.splice(this.enemies.indexOf(player), 1);

      // If there are no more enemies left, the game is over!
      if (this.enemies === 0) {
        // Update status bar
      } else {
        this.isFighting = false;
        this.defender = '';
      }
    }
    updateHealth(player, defender) {
      console.log('update health');
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
    }
    resetGame() {
      this.isPlaying = false;
      this.playerChoice = '';
      this.defender = '';

      this.initializePlayerAttriutes();
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
        $('#main-app').css('display', 'block');
        // ANIMATE SOMETHING HERE
        $('#start').hide();
        $('#status p').empty();
      });
    }
    showPlayerChoice(choice) {
      // Move player's choice to the appropriate div
      $(`#${choice.el}`)
        .detach()
        .appendTo('#player-choice');

      // Move enemies to the appropriate div
      $('#players')
        .detach()
        .appendTo('#enemies');
    }
    showDefender(choice) {
      // Move chosen enemy into defender area of DOM
      $(`#${choice.el}`)
        .detach()
        .appendTo('#defender');
    }
    // THIS DOESN'T WORK
    animate(event) {
      let parentEl;
      if (game && game.defender) {
        parentEl = `#${game.defender.el}`;
      } else {
        parentEl = '#main-app';
      }
      const burst = new mojs.Burst({
        left: 0,
        top: 0,
        parent: parentEl
      });
      burst.tune({ x: event.clientX, y: event.clientY }).replay();
    }
    updateStatus(status) {
      $('#status p').text(status);
    }
    resetDisplay() {
      $('#main-app').css('display', 'none');
      $('#start').show();
      $('#player-choice').empty();
      $('#defender').empty();
      $('#enemies').empty();
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
  $('#start').on('click', function startClickHandler(e) {
    game = new Game();
    display = new Display();
    display.initializeDisplay();
    display.animate(e);
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
      display.showPlayerChoice(game.currentPlayer);
    } else if (game.currentPlayer.el === choice) {
      // Offer some sort of feedback when player clicks themselves for some reason
      display.updateStatus("You're alive! You look nice, keep it up!");
    } else if (game.defender) {
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
      game.attackDefender();
      display.animate(e);
    }
  });

  $('#reset').on('click', function resetClickHandler() {
    if (game.isPlaying) {
      game.resetGame();
      display.resetDisplay();
    }
  });
});
