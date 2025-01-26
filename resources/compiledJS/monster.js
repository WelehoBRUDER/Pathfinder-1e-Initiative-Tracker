"use strict";
class MonsterList {
    monsters;
    abilities;
    constructor() {
        this.monsters = [];
        this.abilities = [];
        this.loadData();
    }
    async loadData() {
        const data = await fetch("/data/monsters.json");
        const monsters = await data.json();
        monsters.forEach((mon) => {
            if (mon.model === "srd20.monster") {
                this.monsters.push({ ...mon.fields, ac: mon.fields.armor_class });
            }
        });
        tracker.updateCreatureToMonster(0, "goblin");
        tracker.updateCreatureToMonster(1, "ettin");
        tracker.updateCreatureToMonster(2, "sea-serpent");
    }
    getMonster(id) {
        const mon = this.monsters.find((monster) => monster.altname === id);
        if (mon) {
            return new Monster(mon);
        }
    }
}
const monsterList = new MonsterList();
class Monster extends Creature {
    altname;
    hitDice;
    armorClass;
    initiative;
    constructor(base) {
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
        let hp = 0;
        const full = this.hitDice.split("(")[1].replace(")", "");
        const [dice, rawFlat] = full.split("+");
        const [amnt, die] = dice.split("d");
        const flat = parseInt(rawFlat?.split(";")[0]) || 0;
        for (let i = 0; i < +amnt; i++) {
            hp += diceController.roll(+die);
        }
        this.hp = hp + flat;
    }
    damage(amount) {
        this.hp -= amount;
    }
    getLink() {
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
//# sourceMappingURL=monster.js.map