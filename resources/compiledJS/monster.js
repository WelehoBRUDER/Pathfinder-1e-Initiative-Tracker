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
                this.monsters.push(new Monster(mon.fields));
            }
        });
        console.log(monsters[56].fields);
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
        this.armorClass = this.setAC(base.armor_class);
        this.initiative = base.initiative;
    }
    setAC(armor) {
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
    getLink() {
        return `https://www.d20pfsrd.com/bestiary/monster-listings/vermin/ant/${this.altname}/`;
    }
}
//# sourceMappingURL=monster.js.map