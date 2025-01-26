type FixedLengthArray<T, N extends number> = [T, ...T[]] & { length: N };
class Dice {
	roll(max: number = 20, min: number = 1) {
		return Math.floor(Math.random() * (max - min) + min);
	}
}

const diceController = new Dice();

const factions = ["hostile", "neutral", "friendly"];

const fields = [
	{
		id: "initiative",
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
	creatures: Array<Creature | Monster>;

	constructor() {
		this.creatures = [];
	}

	addNewCreature(faction: number = 1) {
		this.creatures.push(
			new Creature({
				name: "TestCreature",
				faction: faction,
				hp: null,
				maxHp: null,
				init: 0,
				ac: "10, touch 10, flat-footed 10",
				index: this.creatures.length - 1,
			})
		);
	}

	updateCreatureToMonster(index: number, monsterId: string) {
		const mon = monsterList.getMonster(monsterId);
		if (mon) {
			const faction = this.creatures[index].faction;
			this.creatures[index] = monsterList.getMonster(monsterId);
			this.creatures[index].faction = faction;
			this.creatures[index].index = index;
			this.updateBoard();
		} else {
			console.error(monsterId, "is an invalid id");
		}
	}

	createInput() {
		const input = document.createElement("input");
		input.type = "text";
		return input;
	}

	updateBoard() {
		creatureBoard.innerHTML = "";
		// Create top layer
		const headerItems: FixedLengthArray<[string, string], 4> = [
			["init", "Init"],
			["name", "Creature"],
			["hp", "Hit Points"],
			["ac", "AC/Touch/Flat"],
		];
		const headerBar = document.createElement("div");
		headerBar.classList.add("creature");
		headerBar.classList.add("header-bar");
		headerItems.forEach(([key, val]: [string, string]) => {
			const item = document.createElement("div");
			item.classList.add("item");
			item.classList.add(key);
			item.textContent = val;
			headerBar.append(item);
		});

		creatureBoard.append(headerBar);
		/* Deploy the creatures! */
		this.creatures.forEach((creature: Creature | Monster) => {
			const creatureItem = document.createElement("div");
			creatureItem.classList.add("creature");
			creatureItem.classList.add(factions[creature.faction]);

			creatureItem.appendChild(this.createInitiative(creature));
			creatureItem.appendChild(this.createName(creature));
			creatureItem.appendChild(this.createHitPoints(creature));
			creatureItem.appendChild(this.createAC(creature));

			/* Initiative */
			const init = document.createElement("div");
			init.classList.add("init");

			creatureBoard.append(creatureItem);
		});
	}

	createInitiative(creature: Creature | Monster) {
		const initiative = document.createElement("div");
		initiative.classList.add("item");
		initiative.classList.add("init");
		const input = this.createInput();
		input.value = "0";
		initiative.append(input);
		return initiative;
	}

	createName(creature: Creature | Monster) {
		const creatureName = document.createElement("div");
		creatureName.classList.add("item");
		creatureName.classList.add("name");

		/* Add name input and logic */
		const input = this.createInput();
		input.value = creature.name;
		input.addEventListener("input", () => {
			searchMonster.summon(input);
			searchMonster.search(input.value, creature.index);
		});
		input.addEventListener("focusout", () => {
			searchMonster.remove();
		});

		/* Add link to creature stat block if it exists */
		// Unfortunately, the links are inconsistent, so sometimes this will lead to a 404
		// But usually the correct stat block can be found as the first recommendation on that page
		if ("altname" in creature) {
			const link = document.createElement("a");
			const altlink = document.createElement("a");
			link.href = creature.getLink();
			link.target = "_blank";
			link.textContent = "l";
			altlink.href = creature.getLinkAlt();
			altlink.target = "_blank";
			altlink.textContent = "a";
			creatureName.append(link, altlink);
		}

		creatureName.append(input);
		return creatureName;
	}

	createHitPoints(creature: Creature | Monster) {
		/* Create base element */
		const hitPoints = document.createElement("div");
		hitPoints.classList.add("item");
		hitPoints.classList.add("hp");

		/* Create a ton of elements */
		const hp = this.createInput();
		const maxHp = this.createInput();
		const hpBarFill = document.createElement("div");
		const hpBar = document.createElement("div");
		const numbers = document.createElement("div");
		const slash = document.createElement("span");

		/* Set values */
		slash.textContent = "/";
		hp.value = creature.hp.toString();
		maxHp.value = creature.maxHp.toString();

		/* Handle class lists */
		hp.classList.add("hp-num");
		maxHp.classList.add("hp-num");
		hpBar.classList.add(`hpBar_${creature.index}`);
		hpBar.classList.add(`bar`);
		hpBarFill.classList.add(`hpBarFill_${creature.index}`);
		hpBarFill.classList.add(`barFill`);
		numbers.classList.add("numbers");

		/* Set bar ratio and append everything together */
		hpBarFill.style.width = `${creature.hpRatio()}%`;
		hpBar.append(hpBarFill);
		hpBar.append(numbers);
		numbers.append(hp, slash, maxHp);
		hitPoints.append(hpBar);

		/* Add event listeners and handle logic */
		hp.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				const value: number = handleEvent(hp.value);
				if (isNaN(value)) {
					hp.value = creature.hp.toString();
				} else {
					creature.setHp(value);
					hp.value = value.toString();
				}
				hpBarFill.style.width = `${creature.hpRatio()}%`;
			}
		});

		maxHp.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				const value: number = handleEvent(maxHp.value);
				if (isNaN(value)) {
					maxHp.value = creature.maxHp.toString();
				} else {
					creature.setMaxHp(value);
					hp.value = creature.hp.toString();
					maxHp.value = value.toString();
				}
				hpBarFill.style.width = `${creature.hpRatio()}%`;
			}
		});
		const handleEvent = (val: string) => {
			if (val.match("^[^a-zA-Z]*[+-/*][^a-zA-Z]*$")) {
				return Math.floor(eval(val));
			}
			return parseInt(val);
		};
		return hitPoints;
	}

	createAC(creature: Creature | Monster) {
		const armorClass = document.createElement("div");
		armorClass.classList.add("item");
		armorClass.classList.add("ac");
		const { baseArmor, flatFooted, touch } = creature.ac;
		const acEditable = document.createElement("div");
		acEditable.contentEditable = "true";
		acEditable.textContent = `${baseArmor} / ${flatFooted} / ${touch}`;
		armorClass.append(acEditable);
		return armorClass;
	}
}

const tracker = new Tracker();
