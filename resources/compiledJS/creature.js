"use strict";
class Creature {
    name;
    hp;
    ac;
    init;
    faction;
    constructor(base) {
        this.name = base.name;
        this.hp = base.hp || null;
        this.ac = base.ac || null;
        this.init = base.init || null;
        this.faction = base.faction ?? 1;
    }
}
//# sourceMappingURL=creature.js.map