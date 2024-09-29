interface CreatureBase {
	name: string;
	hp: number;
	ac: string;
	init: number;
	faction: number;
}

class Creature {
	name: string;
	hp: number;
	ac: string;
	init: number;
	faction: number;

	constructor(base: CreatureBase) {
		this.name = base.name;
		this.hp = base.hp || null;
		this.ac = base.ac || null;
		this.init = base.init || null;
		this.faction = base.faction ?? 1;
	}
}
