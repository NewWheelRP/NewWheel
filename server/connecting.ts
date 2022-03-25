on("playerConnecting", (name: string, _setKickReason: Function, deferrals: any) => {
	deferrals.defer();

	const player: any = global.source;

	setTimeout(() => {
		deferrals.update(`Hello ${name}. Your license is being checked.`);

		let license: string = "";

		for (let i = 0; i < GetNumPlayerIdentifiers(player); i++) {
			const identifier = GetPlayerIdentifier(player, i);
			if (identifier.includes("license:")) license = identifier;
		}

		// pretend to be a wait
		setTimeout(() => {
			if (license === "") deferrals.done("You don't have a valid license.");
			else deferrals.done();
		}, 0);
	}, 0);
});