"use strict";
class Dice {
    roll(max = 20, min = 1) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
const diceController = new Dice();
const factions = ["hostile", "neutral", "friendly"];
const fields = [
    {
        id: "init",
        type: "number",
        rollFunc: "rollInitiative",
    },
    {
        id: "name",
        type: "text",
        search: true,
    },
    {
        id: "hp",
        type: "number",
        rollFunc: "rollHitPoints",
    },
    {
        id: "ac",
        type: "number",
    },
];
class Tracker {
    creatures;
    constructor() {
        this.creatures = [];
    }
    addNewCreature(faction = 1) {
        this.creatures.push(new Creature({
            name: "TestCreature",
            faction: faction,
            hp: null,
            maxHp: null,
            init: 0,
            ac: "10, touch 10, flat-footed 10",
            index: this.creatures.length - 1,
        }));
    }
    updateCreatureToMonster(index, monsterId) {
        const mon = monsterList.getMonster(monsterId);
        if (mon) {
            const faction = this.creatures[index].faction;
            this.creatures[index] = monsterList.getMonster(monsterId);
            this.creatures[index].faction = faction;
            this.updateBoard();
        }
        else {
            console.error(monsterId, "is an invalid id");
        }
    }
    updateBoard() {
        creatureBoard.innerHTML = "";
        /* Deploy the creatures! */
        this.creatures.forEach((creature) => {
            const creatureItem = document.createElement("div");
            creatureItem.classList.add("creature");
            console.log(creature);
            creatureItem.classList.add(factions[creature.faction]);
            fields.forEach((field) => {
                const item = document.createElement("div");
                item.classList.add("item");
                item.classList.add(field.id);
                if (field.id === "hp") {
                    const hp = document.createElement("input");
                    const maxHp = document.createElement("input");
                    const hpBarFill = document.createElement("div");
                    const hpBar = document.createElement("div");
                    const numbers = document.createElement("div");
                    const slash = document.createElement("span");
                    slash.textContent = "/";
                    hp.type = "number";
                    hp.value = creature.hp.toString();
                    maxHp.type = "number";
                    maxHp.value = creature.maxHp.toString();
                    hpBar.classList.add(`hpBar_${creature.index}`);
                    hpBar.classList.add(`bar`);
                    hpBarFill.classList.add(`hpBarFill_${creature.index}`);
                    hpBarFill.classList.add(`barFill`);
                    numbers.classList.add("numbers");
                    hpBarFill.style.width = `${creature.hpRatio()}%`;
                    hpBar.append(hpBarFill);
                    hpBar.append(numbers);
                    numbers.append(hp, slash, maxHp);
                    item.append(hpBar);
                }
                else {
                    const input = document.createElement("input");
                    input.type = field.type;
                    //@ts-ignore
                    input.value = creature[field.id];
                    if (field.rollFunc) {
                        console.log("add roll button");
                    }
                    if (field.id === "ac") {
                        const { baseArmor, flatFooted, touch } = creature.ac;
                        console.log(baseArmor, flatFooted, touch);
                        input.value = touch.toString();
                        const baseIn = document.createElement("input");
                        const flatIn = document.createElement("input");
                        baseIn.type = field.type;
                        flatIn.type = field.type;
                        baseIn.value = baseArmor.toString();
                        flatIn.value = flatFooted.toString();
                        item.append(baseIn, flatIn);
                    }
                    item.append(input);
                }
                creatureItem.append(item);
            });
            /* Initiative */
            const init = document.createElement("div");
            init.classList.add("init");
            creatureBoard.append(creatureItem);
        });
    }
}
const tracker = new Tracker();
//# sourceMappingURL=tracker.js.map