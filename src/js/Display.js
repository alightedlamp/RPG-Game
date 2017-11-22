import $ from 'jquery';
import { playerMap } from './playerMap';

export default class Display {
  constructor() {
    this.playerMap = playerMap;
  }

  initializeDisplay() {
    $('#controls').css('display', 'none');

    this.playerMap.map(player => {
      $('#players').append(`
          <div class="player selection-screen" id="${player.el}">
            <h3 class="player-header">${player.name}</h3>
            <div class="image" style="background-image: url('${
              player.image
            }'); background-size: cover; background-position: center">
            </div>
            <div class="player-attributes">
              <div class="player-health">
                <p>HP: ${player.health}</p>
              </div>
            </div>
          </div>
        `);
    });
    return this;
  }
  startGame() {
    $('#main-app').css({
      display: 'flex',
      justifyContent: 'center'
    });
    $('#controls').css('display', 'block');
    $('#start').hide();
    $('#reset')
      .text('Reset')
      .show();
    $('#enemies').show();
    $('#defender').show();
    $('#status p').empty();
    return this;
  }
  showPlayerChoice(choice) {
    // Remove the pick a player heading
    $('#players-container h2').remove();

    // Change the image sizes once a characeter has been selected and game started
    $('.player')
      .removeClass('selection-screen')
      .addClass('in-play');
    // Move player's choice to the appropriate div
    $(`#${choice.el}`)
      .detach()
      .appendTo('#player-choice');

    // Move enemies to the appropriate div
    $('#players')
      .detach()
      .appendTo('#enemies');

    // Hide attack button when there is no defender
    $('#attack').hide();
    return this;
  }
  showDefender(choice) {
    // Clear attack status and replace attack button
    $('#attack-status').empty();
    $('#attack').show();
    // Move chosen enemy into defender area of DOM
    $(`#${choice.el}`)
      .detach()
      .appendTo('#defender');
    return this;
  }
  displayAttackValue(defender, attackValue) {
    $('#attack-status').html(
      `You attacked ${defender.name} for ${attackValue} points!`
    );
    return this;
  }
  clearAttackValue() {
    $('#attack-status').empty();
    return this;
  }
  animateBurst(game, event, el) {
    let parentEl = '';
    let children = '';

    if (el) {
      parentEl = el;
    } else if (game && game.defender) {
      parentEl = `#${game.defender.el}`;
      children = {
        content: [game.currentPlayerAttackPower] // This doesn't work, but is a neat idea - should show current player's current attack power on the enemy when attacked
      };
      // $(`#${game.defender.el}`);
    } else {
      parentEl = '#main-app';
    }
    const burst = new mojs.Burst({
      parent: parentEl,
      children: children
    });
    burst.replay();
    return this;
  }
  updateStatus(status, player) {
    if (arguments.length > 0 && arguments[0].length > 0) {
      let message;

      switch (status) {
        case 'IDLE':
          message = 'There is no one to attack! Pick an enemy!';
          break;
        case 'SELF':
          message = "You're alive! You look nice, keep it up!";
          break;
        case 'ELIMINATED':
          $(`#${player.el}`).remove();
          $('#attack').hide();
          break;
        case 'ALREADY_ATTACKING':
          message = `You can't pick another enemy right now! Attack ${
            player.name
          }!`;
          break;
        case 'GAME_OVER_LOSER':
          message = 'Game over, you lose!';
          $('#attack').hide();
          $('#reset').text('Play Again');
          break;
        case 'GAME_OVER_WINNER':
          message = 'You win!';
          $('#attack').hide();
          $('#enemies').hide();
          $('#reset').text('Play Again');
          break;
        default:
          message = 'Well, this is awkward';
      }
      if (message && message.length > 0) {
        this.displayMessage(message);
      }
    } else {
      $('#status-message').empty();
    }
    return this;
  }
  displayMessage(message) {
    $('#status-text').text(message);
    $('#status')
      .css('display', 'block')
      .animate({ opacity: 1 }, 250, 'linear', function() {
        // Hide the status modal go away after a slight delay
        setTimeout(
          () =>
            $(this).animate({ opacity: 0 }, 250, 'linear', () => {
              $(this).css('display', 'none');
              $('#status-text').empty();
            }),
          750
        );
      });
  }
  updateAttributes(
    playerEl,
    defenderEl,
    playerHealth,
    defenderHealth,
    currentPlayerAttackPower
  ) {
    $(`#${playerEl} .player-attributes .player-health`).html(
      `<p><em>HP:</em> ${playerHealth}</p>`
    );
    $(`#${defenderEl} .player-attributes  .player-health`).html(
      `<p><em>HP:</em> ${defenderHealth}</p>`
    );
  }
  resetDisplay() {
    $('#players-container').prepend('<h2>Pick a player!</h2>');
    $('#main-app').css('display', 'none');
    $('#player-choice').empty();
    $('#defender').empty();
    $('#players')
      .empty()
      .detach()
      .appendTo('#players-container');
    $('#enemies').empty();
    $('#attack').hide();
    $('#reset').hide();

    return this;
  }
}
