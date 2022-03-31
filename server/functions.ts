import { Player } from "./Classes/Player";
import { NW, sendCharacters } from "./server";
import { getLicense } from "./utils";

NW.Functions = {};

NW.Functions.OnFirstJoin = (source: number, license: string) => {
	let player = Player.New(source, license);
	NW.Players.set(license, player);

	global.exports.oxmysql.insert(
		`INSERT INTO players (license, name, groupName, firstLogin, lastLogin, playTime) VALUES (?, ?, ?, ?, ?, ?)`,
		[
			player.getLicense(),
			player.getName(),
			player.getGroup(),
			player.getFirstLogin(),
			player.getLastLogin(),
			player.getPlayTime(),
		],
		(id: any) => {
			sendCharacters(source, license, []);
		}
	);
};

global.exports("OnFirstJoin", NW.Functions.OnFirstJoin);

NW.Functions.GetLicense = (source: number): string | undefined => {
	return getLicense(source);
};

global.exports("GetLicense", NW.Functions.GetLicense);

NW.Functions.GetPlayerFromSource = (source: string | number): Player | undefined => {
	if (Number.isInteger(source)) source = source.toString();
	const license = NW.Functions.GetLicense(source);
	const player = NW.Players.get(license);
	if (!player) {
		console.error(`There was no player with id ${license}`);
		return;
	}
	return player;
};

global.exports("GetPlayerFromSource", NW.Functions.GetPlayerFromSource);

NW.Functions.SavePlayers = () => {
	console.info("Saving all players...");
	NW.Players.forEach((player: Player) => {
		NW.Functions.SavePlayer(player);
	});
};

global.exports("SavePlayers", NW.Functions.SavePlayers);

NW.Functions.SavePlayer = (player: Player, playerLeft?: boolean) => {
	player.save();
	if (playerLeft) NW.Players.delete(player.getLicense());
};

global.exports("SavePlayer", NW.Functions.SavePlayer);
