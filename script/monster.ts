class MonsterList {
	monsters: Array<any>;
	abilities: Array<any>;

	constructor() {
		this.monsters = [];
		this.abilities = [];
		this.loadData();
	}

	async loadData() /**:void*/ {
		const data = await fetch("/data/monsters.json");
		const monsters = await data.json();
		monsters.forEach((mon: any) => {
			if (mon.model === "srd20.monster") {
				this.monsters.push({ ...mon.fields, ac: mon.fields.armor_class });
			}
		});
		tracker.updateCreatureToMonster(1, "ettin");
	}

	getMonster(id: string) {
		const mon = this.monsters.find((monster) => monster.altname === id);
		if (mon) {
			return new Monster(mon);
		}
	}
}

const monsterList = new MonsterList();

interface armorClass {
	baseArmor: number;
	flatFooted: number;
	touch: number;
}

class Monster extends Creature {
	altname: string;
	hitDice: string;
	armorClass: armorClass;
	initiative: number;

	constructor(base: any) {
		super(base);
		this.name = base.name;
		this.altname = base.altname;
		this.hitDice = base.hit_points;
		this.hp = this.hpMax();
		this.maxHp = this.hpMax();
		this.armorClass = this.setAC(base.armor_class);
		this.initiative = base.initiative;

		this.ac = this.armorClass;
	}

	hpMax() {
		return parseInt(this.hitDice.split("(")[0]);
	}

	hpRoll() {
		let hp: number = 0;
		const full = this.hitDice.split("(")[1].replace(")", "");
		const [dice, rawFlat] = full.split("+");
		const [amnt, die] = dice.split("d");
		const flat = parseInt(rawFlat?.split(";")[0]) || 0;

		for (let i = 0; i < +amnt; i++) {
			hp += diceController.roll(+die);
		}
		this.hp = hp + flat;
	}

	getLink(): string {
		return `https://www.d20pfsrd.com/bestiary/monster-listings/vermin/ant/${this.altname}/`;
	}

	rollInitiative() {
		const roll = diceController.roll(20, 1);
		this.init = roll + this.initiative;
	}
}

tracker.addNewCreature();
tracker.addNewCreature(0);
tracker.addNewCreature(2);
tracker.updateBoard();
