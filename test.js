while (true) {
	let alarm = 0;
	let button = 1;
	let lamp = 0;
	let siren = 0;
	let blink = 0;

	if (alarm) {
		lamp = 1;
		siren = 1;
		if (!button) {
			siren = 0;
			blink = 1;
		} else {
			siren = 0;
		}
	}
}
