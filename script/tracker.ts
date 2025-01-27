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

	clear(): void {
		const confirmation = confirm("Are you sure you want to clear the board?");
		if (confirmation) {
			this.creatures = [];
			this.updateBoard();
		}
	}

	addNewCreature(faction: number = 1): void {
		this.creatures.push(
			new Creature({
				name: "",
				faction: faction,
				hp: null,
				maxHp: null,
				init: 0,
				ac: "10, touch 10, flat-footed 10",
				index: this.creatures.length,
			})
		);
		this.updateBoard();
	}

	rollInitiativeForAll(options?: { onlyHostile: boolean }) {
		this.creatures.forEach((creature: Monster | Creature) => {
			if (options?.onlyHostile && creature.faction === 2) return;
			creature.rollInitiative();
		});
		this.updateBoard();
	}

	rollHpForAll() {
		this.creatures.forEach((creature: Monster | Creature) => {
			// Prevent attempting to roll hp for players
			if ("hpRoll" in creature) {
				creature.hpRoll();
				this.updateCreatureHP(creature);
			}
		});
	}

	updateCreatureHP(creature: Monster | Creature) {
		const bar = document.querySelector(`.hpBar_${creature.index}`);
		const fill: HTMLDivElement = bar.querySelector(".barFill");
		// These two are identical, but always in this order so we can differentiate them
		const hp: HTMLInputElement = bar.querySelectorAll(".hp-num")[0] as HTMLInputElement;
		const maxHp: HTMLInputElement = bar.querySelectorAll(".hp-num")[1] as HTMLInputElement;
		console.log(hp, maxHp);
		hp.value = creature.hp.toString();
		maxHp.value = creature.maxHp.toString();
		fill.style.width = `${creature.hpRatio()}%`;
	}

	// Sorts all creatures in the current table in order of initiative
	sortCreatures() {
		this.creatures = this.creatures.sort((a: Creature | Monster, b: Creature | Monster) => {
			if (a.init > b.init) return -1;
			else if (b.init > a.init) return 1;
			// When initiatives are equal, compare factions
			if (a.init === b.init) {
				// Player faction (2) should always be ranked above neutral (1) and hostile (0)
				if (a.faction > b.faction) return -1;
				else if (b.faction > a.faction) return 1;
			}
			return 0;
		});
		this.updateBoard();
	}

	updateCreatureToMonster(index: number, monsterId: string): void {
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

	createInput(): HTMLInputElement {
		const input: HTMLInputElement = document.createElement("input");
		input.type = "text";
		return input;
	}

	createEmbeddedButton(img: string): HTMLButtonElement {
		const btn: HTMLButtonElement = document.createElement("button");
		const bg: HTMLImageElement = document.createElement("img");
		btn.classList.add("embedded-button");
		bg.src = `../../resources/img/${img}.png`;
		btn.append(bg);
		return btn;
	}

	createEmbeddedLink(link: string): HTMLAnchorElement {
		const anchor: HTMLAnchorElement = document.createElement("a");
		const img: HTMLImageElement = document.createElement("img");
		img.src = "../../resources/img/link.png";
		anchor.classList.add("embedded-button");
		anchor.target = "_blank";
		anchor.href = link;
		anchor.append(img);
		return anchor;
	}

	updateBoard(): void {
		creatureBoard.innerHTML = "";
		// Create top layer
		const headerItems: FixedLengthArray<[string, string, string], 4> = [
			["init", "Initiative", "Initiative, both current and bonus"],
			["name", "Name", "Creature's name / type"],
			["hp", "Hit Points", "HP bar that shows both current and max health"],
			["ac", "AC/Touch/Flat", "Armor Class, Touch AC and Flat-footed AC"],
		];
		const headerBar = document.createElement("div");
		headerBar.classList.add("creature");
		headerBar.classList.add("header-bar");
		headerItems.forEach(([key, val, title]: [string, string, string]) => {
			const item = document.createElement("div");
			item.classList.add("item");
			item.classList.add(key);
			item.textContent = val;
			item.title = title;
			item.style.userSelect = "none";
			headerBar.append(item);
		});

		creatureBoard.append(headerBar);
		/* Deploy the creatures! */
		this.creatures.forEach((creature: Creature | Monster) => {
			const creatureItem = document.createElement("div");
			creatureItem.classList.add("creature");
			creatureItem.classList.add(factions[creature.faction]);

			// Create each cell within the creature element
			creatureItem.appendChild(this.createInitiative(creature));
			creatureItem.appendChild(this.createName(creature));
			creatureItem.appendChild(this.createHitPoints(creature));
			creatureItem.appendChild(this.createAC(creature));

			creatureBoard.append(creatureItem);
		});
	}

	createInitiative(creature: Creature | Monster): HTMLDivElement {
		const initiative = document.createElement("div");
		initiative.classList.add("item");
		initiative.classList.add("init");
		const input = this.createInput();
		input.value = creature.getInit();
		// Create roll button for initiative
		const rollBtn: HTMLButtonElement = this.createEmbeddedButton("dice-twenty-faces-twenty");
		rollBtn.title = "Roll initiative";
		initiative.append(input, rollBtn);

		rollBtn.addEventListener("click", () => {
			creature.rollInitiative();
			input.value = creature.getInit();
		});

		input.addEventListener("keyup", (e) => {
			if (e.key === "Enter") {
				const num: number = parseInt(input.value);
				if (!isNaN(num)) {
					creature.init = num;
				}
			}
		});
		return initiative;
	}

	createName(creature: Creature | Monster): HTMLDivElement {
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
			const link: HTMLAnchorElement = this.createEmbeddedLink(creature.getLink());
			const altlink: HTMLAnchorElement = this.createEmbeddedLink(creature.getLinkAlt());
			link.title = "Primary link, goes straight to its source";
			altlink.title = "Alternative link that navigates through category. In case primary link doesn't work.";
			creatureName.append(link, input, altlink);
		} else {
			creatureName.append(input);
		}

		return creatureName;
	}

	createHitPoints(creature: Creature | Monster): HTMLDivElement {
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
		hpBarFill.style.animationDuration = `${Math.random() * 2 + 2}s`;
		hpBarFill.style.animationDelay = `${Math.random()}s`;
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

		/* Add a roll button for HP if possible */
		if ("hpRoll" in creature) {
			const hpRoll = this.createEmbeddedButton("dice-twenty-faces-twenty");
			hpRoll.title = `Roll HP (${creature.hitDice})`;
			hpRoll.addEventListener("click", () => {
				creature.hpRoll();
				hp.value = creature.hp.toString();
				maxHp.value = creature.maxHp.toString();
				hpBarFill.style.width = `${creature.hpRatio()}%`;
			});
			numbers.append(hpRoll);
		}

		return hitPoints;
	}

	createAC(creature: Creature | Monster): HTMLDivElement {
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
