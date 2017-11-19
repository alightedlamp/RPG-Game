import $ from 'jquery';
import { playerMap } from './playerMap';

export default class Display {
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
  animate(game, event, el) {
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
