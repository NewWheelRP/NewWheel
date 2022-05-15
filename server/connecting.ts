on("playerConnecting", (name: string, _setKickReason: Function, deferrals: any) => {
	deferrals.defer();

	const player: string = global.source.toString();

	setTimeout(() => {
		deferrals.update(`Hello ${name}. Your license is being checked.`);

		let license: string = "";

		const identifierNum = GetNumPlayerIdentifiers(player);

		for (let i = 0; i < identifierNum; i++) {
			const identifier: string = GetPlayerIdentifier(player, i);
			if (identifier.includes("license:")) license = identifier;
		}

		// pretend to be a wait
		setTimeout(() => {
			if (!license || license === "") deferrals.done("You don't have a valid license.");
			else deferrals.done();
		}, 0);
	}, 0);
});