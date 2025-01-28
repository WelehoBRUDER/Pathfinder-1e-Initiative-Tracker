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
	public creatures: Array<Creature | Monster> = [];
	public round: number = 0;
	public turn: number = -1;
	public roundCounter: HTMLDivElement = document.querySelector(".round-counter");
	private roundCounterValue: HTMLParagraphElement = document.querySelector(".round-counter .counter");

	moveTurn(by: number) {
		this.turn += by;
		if (this.turn > this.creatures.length - 1) {
			this.turn = -1;
			this.round += 1;
		}
		if (this.turn < -1) {
			this.turn = -1;
		}
		this.updateTurn();
	}

	updateTurn() {
		// Clear current effects
		try {
			document.querySelector(".current").classList.remove("current");
		} catch {
			console.warn("Trying to remove current from nothing");
		}

		const base: HTMLDivElement = document.querySelector(`.c${this.turn}`);
		if (base) {
			base.classList.add("current");
			this.saveCurrentBoard();
		}

		this.roundCounterValue.textContent = `Round: ${this.round}`;
	}

	resetRounds() {
		this.round = 0;
		this.roundCounterValue.textContent = `Round: ${this.round}`;
		this.saveCurrentBoard();
	}

	saveCurrentBoard() {
		const save = {
			creatures: JSON.stringify(this.creatures),
			round: this.round,
			turn: this.turn,
		};
		localStorage.setItem("PF1ESRD-Tracker-current", JSON.stringify(save));
	}

	loadPreviousBoard() {
		const save = localStorage.getItem("PF1ESRD-Tracker-current");
		const board = JSON.parse(save);
		const creatures = JSON.parse(board.creatures);

		this.round = parseInt(board.round);
		this.turn = parseInt(board.turn) ?? -1;

		creatures.forEach((creature: any) => {
			if ("hitDice" in creature) {
				// this is a monster
				const monster = new Monster(monsterList.getMonster(creature.altname));
				monster.ac = creature.ac;
				monster.hp = creature.hp;
				monster.maxHp = creature.maxHp;
				monster.init = creature.init;
				monster.faction = creature.faction;
				this.creatures.push(monster);
			} else {
				// this is not a monster
				console.log(creature);
				const being = new Creature({ ...creature });
				being.ac = creature.ac;
				being.hp = creature.hp;
				being.maxHp = creature.maxHp;
				being.init = creature.init;
				this.creatures.push(being);
			}
		});

		this.sortCreatures();
		this.updateTurn();
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

		this.creatures.forEach((creature: Monster | Creature, index: number) => {
			this.creatures[index].index = index;
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
		bg.src = `./resources/img/${img}.png`;
		btn.append(bg);
		return btn;
	}

	createVisibleButton(img: string): HTMLButtonElement {
		const btn: HTMLButtonElement = document.createElement("button");
		const bg: HTMLImageElement = document.createElement("img");
		btn.classList.add("visible-button");
		bg.src = `./resources/img/${img}.png`;
		btn.append(bg);
		return btn;
	}

	createEmbeddedLink(link: string): HTMLAnchorElement {
		const anchor: HTMLAnchorElement = document.createElement("a");
		const img: HTMLImageElement = document.createElement("img");
		img.src = "./resources/img/link.png";
		anchor.classList.add("embedded-button");
		anchor.target = "_blank";
		anchor.href = link;
		anchor.append(img);
		return anchor;
	}

	updateBoard(): void {
		this.saveCurrentBoard();
		creatureBoard.innerHTML = "";
		// Create top layer
		const headerItems: FixedLengthArray<[string, string, string], 5> = [
			["init", "Initiative", "Initiative, both current and bonus"],
			["name", "Name", "Creature's name / type"],
			["hp", "Hit Points", "HP bar that shows both current and max health"],
			["ac", "AC/Touch/Flat", "Armor Class, Touch AC and Flat-footed AC"],
			["mng", "Manage", "Copy or delete creatures"],
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
			creatureItem.classList.add("c" + creature.index);

			// Create each cell within the creature element
			creatureItem.appendChild(this.createInitiative(creature));
			creatureItem.appendChild(this.createName(creature));
			creatureItem.appendChild(this.createHitPoints(creature));
			creatureItem.appendChild(this.createAC(creature));
			creatureItem.appendChild(this.createManage(creature));

			creatureBoard.append(creatureItem);
			this.checkIfDefeated(creature);
		});
	}

	checkIfDefeated(creature: Creature | Monster, delay: number = 0) {
		const creatureItem: HTMLDivElement = document.querySelector(`.c${creature.index}`);
		if (creatureItem) {
			setTimeout(() => {
				if (creature.hp <= 0 && creature.maxHp !== 0) {
					if (!creatureItem.classList.contains("defeated")) {
						creatureItem.classList.add("defeated");
					}
				} else {
					if (creatureItem.classList.contains("defeated")) {
						creatureItem.classList.remove("defeated");
					}
				}
			}, delay);
		}
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
			this.saveCurrentBoard();
		});

		const initEvent = () => {
			const num: number = parseInt(input.value);
			if (!isNaN(num)) {
				creature.init = num;
				this.saveCurrentBoard();
			}
		};

		input.addEventListener("keyup", (e) => {
			if (e.key === "Enter") {
				initEvent();
			}
		});

		input.addEventListener("focusout", initEvent);
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
			creature.name = input.value;
			this.saveCurrentBoard();
		});

		input.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				creature.name = input.value;
				this.saveCurrentBoard();
				searchMonster.remove();
			}
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
		hpBarFill.style.animationDuration = `${Math.random() * 4 + 6}s`;
		hpBarFill.style.animationDelay = `${Math.random()}s`;
		numbers.classList.add("numbers");

		/* Set bar ratio and append everything together */
		hpBarFill.style.width = `${creature.hpRatio()}%`;
		hpBar.append(hpBarFill);
		hpBar.append(numbers);
		numbers.append(hp, slash, maxHp);
		hitPoints.append(hpBar);

		const hpEvent = () => {
			const prevRatio = creature.hpRatio();
			const value: number = handleEvent(hp.value);
			if (isNaN(value)) {
				hp.value = creature.hp.toString();
			} else {
				creature.setHp(value);
				hp.value = value.toString();
			}
			this.saveCurrentBoard();
			const currentRatio = creature.hpRatio();
			/* Changes how the bar is drained during a heavy hit (>50% hp gone at once) */
			if (prevRatio - currentRatio > 50) {
				hpBarFill.style.transition = "0.4s cubic-bezier(1, 0, 0, 1.5)";
			} else {
				hpBarFill.style.transition = "0.4s ease-out";
			}
			let delay: number = 0;
			if (prevRatio > currentRatio) delay = 350;
			hpBarFill.style.width = `${creature.hpRatio()}%`;
			this.checkIfDefeated(creature, delay);
		};

		const maxHpEvent = () => {
			const prevRatio = creature.hpRatio();
			const value: number = handleEvent(maxHp.value);
			if (isNaN(value)) {
				maxHp.value = creature.maxHp.toString();
			} else {
				creature.setMaxHp(value);
				hp.value = creature.hp.toString();
				maxHp.value = value.toString();
			}
			this.saveCurrentBoard();
			const currentRatio = creature.hpRatio();
			/* Changes how the bar is drained during a heavy hit (>50% hp gone at once) */
			if (prevRatio - currentRatio > 50) {
				hpBarFill.style.transition = "0.4s cubic-bezier(1, 0, 0, 1.5)";
			} else {
				hpBarFill.style.transition = "0.4s ease-out";
			}
			hpBarFill.style.width = `${creature.hpRatio()}%`;
		};

		/* Add event listeners and handle logic */
		hp.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				hpEvent();
			}
		});

		hp.addEventListener("focusout", hpEvent);
		maxHp.addEventListener("focusout", maxHpEvent);

		maxHp.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				maxHpEvent();
			}
		});
		const handleEvent = (val: string) => {
			if (val.match("^-?([0-9][+-/*]?)+[0-9]$")) {
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
				this.saveCurrentBoard();
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
		const acEditable = this.createInput();
		acEditable.value = `${baseArmor} / ${touch} / ${flatFooted}`;

		const acEvent = () => {
			const values = acEditable.value.split("/");
			try {
				const [base, touch, flat] = values.map((a) => parseInt(a));
				console.log("base", base, "touch", touch, "flat", flat);
				if (!base || !touch || !flat) return;
				creature.ac.baseArmor = base;
				creature.ac.touch = touch;
				creature.ac.flatFooted = flat;
				this.saveCurrentBoard();
			} catch {
				console.log("Invalid values in AC of ", creature.name);
			}
		};

		acEditable.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				acEvent();
			}
		});

		acEditable.addEventListener("focusout", acEvent);

		armorClass.append(acEditable);
		return armorClass;
	}

	createManage(creature: Creature | Monster): HTMLDivElement {
		const manage = document.createElement("div");
		manage.classList.add("item");
		manage.classList.add("mng");

		const copyBtn: HTMLButtonElement = this.createVisibleButton("copy");
		const deleteBtn: HTMLButtonElement = this.createVisibleButton("trash-can");
		copyBtn.classList.add("blue");
		deleteBtn.classList.add("red");

		copyBtn.title = "Copy this creature";
		deleteBtn.title = "Remove this creature";

		copyBtn.addEventListener("click", () => {
			if ("hitDice" in creature) {
				const monster = new Monster(monsterList.getMonster(creature.altname));
				monster.ac = creature.ac;
				monster.hp = creature.hp;
				monster.maxHp = creature.maxHp;
				monster.init = creature.init;
				monster.faction = creature.faction;
				this.creatures.push(monster);
			} else {
				// @ts-ignore
				const being = new Creature({ ...creature });
				being.ac = creature.ac;
				being.hp = creature.hp;
				being.maxHp = creature.maxHp;
				being.init = creature.init;
				this.creatures.push(being);
			}
			this.sortCreatures();
		});

		deleteBtn.addEventListener("click", () => {
			this.creatures.splice(creature.index, 1);
			this.sortCreatures();
		});
		manage.append(copyBtn, deleteBtn);
		return manage;
	}
}

const tracker = new Tracker();
tracker.loadPreviousBoard();
const resetBtn = tracker.createEmbeddedButton("cycle");
resetBtn.title = "Reset round counter to 0";
resetBtn.addEventListener("click", () => {
	tracker.resetRounds();
});
tracker.roundCounter.append(resetBtn);
