"use strict";
class Dice {
    roll(max = 20, min = 1) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
const diceController = new Dice();
//# sourceMappingURL=tracker.js.map