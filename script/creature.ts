interface CreatureBase {
	name: string;
	faction: number;
	hp: number | null;
	maxHp: number;
	init: number;
	ac: string;
	index: number;
}

class Creature {
	name: string;
	faction: number;
	hp: number;
	maxHp: number;
	tempHp: number;
	init: number;
	ac: armorClass | null;
	index: number;

	constructor(base: CreatureBase) {
		this.name = base.name;
		this.hp = base.hp || 0;
		this.maxHp = base.hp || 0;
		this.tempHp = 0;
		this.ac = this.setAC(base.ac);
		this.init = base.init || 0;
		this.faction = base.faction ?? 1;
		this.index = base.index ?? -1;
	}

	setAC(armor: string): armorClass {
		// Splits each type to its own cell in an array
		const armorTypes = armor.split(",");
		// Separate flat-footed to its actual number and the descriptor
		const flatString = armorTypes[2].split("(");
		// Remove characters and save the value of each type
		const baseArmor = parseInt(armorTypes[0]);
		const flatFooted = parseInt(flatString[0].replace("flat-footed", ""));
		const touch = parseInt(armorTypes[1].replace("touch", ""));
		return {
			baseArmor: baseArmor,
			flatFooted: flatFooted,
			touch: touch,
		};
	}

	setHp(amount: number) {
		this.hp = amount;
		if (this.hp > this.maxHp) {
			this.hp = this.maxHp;
		}
	}

	setMaxHp(amount: number) {
		this.maxHp = amount;
		if (this.hp > this.maxHp) {
			this.hp = this.maxHp;
		}
	}

	setTempHp(amount: number) {
		this.tempHp = amount;
	}

	hpRatio() {
		if (this.maxHp <= 0 || this.hp <= 0) return 0;
		return 100 * (this.hp / this.maxHp);
	}

	rollInitiative() {
		this.init = diceController.roll(20, 1);
	}
}
