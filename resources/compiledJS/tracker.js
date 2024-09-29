"use strict";
class Dice {
    roll(max = 20, min = 1) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
const diceController = new Dice();
const tableFields = [
    {
        id: "init",
        name: "Initiative",
        roll: true,
    },
    {
        id: "name",
        name: "Name",
        search: true,
    },
    {
        id: "hp",
        name: "HP",
        roll: true,
    },
    {
        id: "ac",
        name: "AC",
        roll: true,
    },
    {
        id: "notes",
        name: "Custom Notes",
    },
];
const factions = ["hostile", "neutral", "friendly"];
class Tracker {
    creatures;
    constructor() {
        this.creatures = [];
    }
    addNewCreature(faction = 1) {
        this.creatures.push({
            name: "",
            faction: faction,
            hp: null,
            init: null,
            ac: null,
        });
    }
    updateTable() {
        creatureTable.innerHTML = "";
        //* Create the table header */
        const tableHeader = document.createElement("tr");
        tableHeader.classList.add("table-header");
        tableHeader.classList.add("table-item");
        tableFields.forEach(({ id, name }) => {
            const field = document.createElement("th");
            field.classList.add(id);
            field.classList.add("field");
            field.textContent = name;
            tableHeader.append(field);
        });
        creatureTable.append(tableHeader);
        /* Deploy the creatures! */
        this.creatures.forEach((creature) => {
            console.log(creature);
            const creatureItem = document.createElement("tr");
            creatureItem.classList.add("table-item");
            creatureItem.classList.add(factions[creature.faction]);
            tableFields.forEach((item) => {
                const field = document.createElement("th");
                field.classList.add(item.id);
                field.classList.add("field");
                field.textContent = creature[item.id];
                creatureItem.append(field);
            });
            creatureTable.append(creatureItem);
        });
    }
}
const tracker = new Tracker();
tracker.addNewCreature();
tracker.updateTable();
//# sourceMappingURL=tracker.js.map