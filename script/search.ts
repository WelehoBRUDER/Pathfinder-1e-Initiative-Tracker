class SearchMonster {
	private searchList: HTMLDivElement = document.querySelector(".search-list");
	private monsters: HTMLUListElement = document.querySelector(".search-list .monsters");
	private searchFor: string;

	summon(elem: HTMLElement) {
		const area = elem.parentElement.getBoundingClientRect();
		this.searchList.style.width = `${area.width}px`;
		this.searchList.style.top = `${area.height}px`;
		elem.parentElement.append(this.searchList);
	}

	remove() {
		this.searchList.style.display = "none";
		this.monsters.innerHTML = "";
	}

	search(item: string, creatureIndex: number) {
		this.searchFor = item.toLowerCase();
		if (this.searchFor.trim().length === 0) return this.remove();
		this.searchList.style.display = "flex";

		const results = monsterList.monsters
			.filter((monster: Monster) => {
				return monster.name.toLowerCase().includes(this.searchFor);
			})
			.sort((a: Monster, b: Monster) => {
				if (a.name.toLowerCase().indexOf(this.searchFor) < b.name.toLowerCase().indexOf(this.searchFor)) return -1;
				if (a.name.toLowerCase().indexOf(this.searchFor) > b.name.toLowerCase().indexOf(this.searchFor)) return 1;
				return 0;
			});

		this.monsters.innerHTML = "";
		results.forEach((result: Monster) => {
			const li = document.createElement("li");
			li.innerHTML = result.name;
			li.addEventListener("mousedown", () => {
				tracker.updateCreatureToMonster(creatureIndex, result.altname);
			});
			this.monsters.append(li);
		});
	}
}

const searchMonster = new SearchMonster();
