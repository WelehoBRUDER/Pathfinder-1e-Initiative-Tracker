class MonsterList {
	monsters: Array<any>;
	abilities: Array<any>;

	constructor() {
		this.monsters = [];
		this.abilities = [];
		this.loadData();
	}

	async loadData() /**:void*/ {
		const data = await fetch("./data/monsters.json");
		const monsters = await data.json();
		monsters.forEach((mon: any) => {
			if (mon.model === "srd20.monster") {
				this.monsters.push({ ...mon.fields, ac: mon.fields.armor_class });
			}
		});
		tracker.loadPreviousBoard();
	}

	getMonster(id: string) {
		const mon = this.monsters.find((monster) => monster.altname === id);
		if (mon) {
			return new Monster(mon);
		}
	}

	getMonsterRaw(id: string) {
		return this.monsters.find((monster) => monster.altname === id);
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
	type: string;
	subtypes: string;

	constructor(base: any) {
		super(base);
		this.name = base.name;
		this.altname = base.altname;
		this.hitDice = base.hit_points ?? base.hitDice;
		this.hp = this.hpMax();
		this.maxHp = this.hpMax();
		this.armorClass = this.setAC(base.armor_class);
		this.initiative = base.initiative;
		this.type = base.type;
		this.subtypes = base.subtypes;

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
		this.maxHp = this.hp;
	}

	damage(amount: number) {
		this.hp -= amount;
	}

	getLink(): string {
		return `https://www.d20pfsrd.com/bestiary/monster-listings/${this.type}s/${this.altname}/`;
	}

	getLinkAlt(): string {
		return `https://www.d20pfsrd.com/bestiary/monster-listings/${this.type}s/${this.subtypes}s/${this.altname}/`;
	}

	rollInitiative() {
		super.rollInitiative();
		this.init += this.initiative;
	}

	getInit(): string {
		const num = super.getInit();
		return `${num} (${this.initiative >= 0 ? "+" : ""}${this.initiative})`;
	}
}
