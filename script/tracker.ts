class Dice {
	roll(max: number = 20, min: number = 1) {
		return Math.floor(Math.random() * (max - min) + min);
	}
}

const diceController = new Dice();
