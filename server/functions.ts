import { Player } from "./Classes/Player";
import { NW, sendCharacters } from "./server";
import { getLicense } from "./utils";

export const OnFirstJoin = (source: number, license: string) => {
	const player = Player.new(source, license);
	NW.Players.set(source, player);

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
		() => {
			sendCharacters(source, license, []);
		}
	);
};

global.exports("OnFirstJoin", OnFirstJoin);

global.exports("GetLicense", getLicense);

export const GetPlayerFromSource = (source: number): Player | undefined => NW.Players.get(source);

global.exports("GetPlayerFromSource", GetPlayerFromSource);

export const GetPlayerFromLicense = (license: string): Player | undefined => {
	NW.Players.forEach((player: Player) => {
		if (player.getLicense() === license) return player;
	})
	return;
};

global.exports("GetPlayerFromLicense", GetPlayerFromLicense);

export const SavePlayers = () => {
	console.info("Saving all players...");
	NW.Players.forEach((player: Player) => SavePlayer(player));
};

global.exports("SavePlayers", SavePlayers);

export const SavePlayer = (player: Player | number, playerLeft?: boolean) => {
	let player2: any;

	if (player instanceof Player) {
		player2 = player;
	} else {
		player2 = GetPlayerFromSource(player);
	}

	if (player2! instanceof Player) return;

	player2.save();
	if (playerLeft) NW.Players.delete(player2.getSource());
};

global.exports("SavePlayer", SavePlayer);