"use strict";
class MonsterList {
    monsters;
    abilities;
    constructor() {
        this.monsters = [];
        this.abilities = [];
        this.loadData();
    }
    loadData() {
        // @ts-ignore
        monsters_raw_data.forEach((mon) => {
            if (mon.model === "srd20.monster") {
                this.monsters.push({ ...mon.fields, ac: mon.fields.armor_class });
            }
        });
    }
    getMonster(id) {
        const mon = this.monsters.find((monster) => monster.altname === id);
        if (mon) {
            return new Monster(mon);
        }
    }
    getMonsterRaw(id) {
        return this.monsters.find((monster) => monster.altname === id);
    }
}
const monsterList = new MonsterList();
class Monster extends Creature {
    altname;
    hitDice;
    armorClass;
    initiative;
    type;
    subtypes;
    constructor(base) {
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
        let hp = 0;
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
    damage(amount) {
        this.hp -= amount;
    }
    getLink() {
        return `https://www.d20pfsrd.com/bestiary/monster-listings/${this.type}s/${this.getAltName()}/`;
    }
    getLinkAlt() {
        return `https://www.d20pfsrd.com/bestiary/monster-listings/${this.type}s/${this.subtypes}s/${this.getAltName()}/`;
    }
    getAltName() {
        return this.altname;
    }
    rollInitiative() {
        super.rollInitiative();
        this.init += this.initiative;
    }
    getInit() {
        const num = super.getInit();
        return `${num} (${this.initiative >= 0 ? "+" : ""}${this.initiative})`;
    }
}
//# sourceMappingURL=monster.js.map