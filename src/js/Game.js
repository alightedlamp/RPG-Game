import { playerMap } from './playerMap';

export default class Game {
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

    // Save health to new variable because value changes throughout game
    this.defenderHealth = this.defender.health;

    return this;
  }
  attackDefender() {
    // Add health to user's player, decrement health from defender
    this.defenderHealth -= this.currentPlayerAttackPower; // Decrease defender health by my current attack power
    this.currentPlayerHealth -= this.defender.counterAttackPower; // Decrease my defender's counter attack power
    this.currentPlayerAttackPower += this.currentPlayer.attackPower; // Increase by base attack power

    // Check health remaining, fork game
    if (this.currentPlayerHealth <= 0) {
      this.isPlaying = false;
      return 'GAME_OVER_LOSER';
    } else if (this.currentPlayerHealth > 0 && this.defenderHealth <= 0) {
      // Remove the enemy from gameplay
      this.enemies.splice(this.enemies.indexOf(this.defender.el), 1);
      // If there are no more enemies left, the game is over!
      if (this.enemies.length === 0) {
        this.isPlaying = false;
        return 'GAME_OVER_WINNER';
      } else {
        this.isFighting = false;
        this.defender = '';
        return 'ELIMINATED';
      }
    } else if (this.currentPlayerHealth > 0 && this.defenderHealth > 0) {
      return '';
    } else {
      return 'ERROR';
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
    this.enemies = [];

    this.initializePlayerAttriutes();
    return this;
  }
}
