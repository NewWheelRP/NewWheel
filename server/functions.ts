import { Player } from "./Classes/Player";
import { NW, sendCharacters } from "./server";
import { getLicense } from "./utils";

export const OnFirstJoin = (source: number, license: string) => {
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
		() => {
			sendCharacters(source, license, []);
		}
	);
};

global.exports("OnFirstJoin", OnFirstJoin);

global.exports("GetLicense", getLicense);

export const GetPlayerFromSource = (source: string | number): Player | undefined => {
	if (Number.isInteger(source)) source = source.toString();
	const license = getLicense(source);
	if (!license) return;
	const player = NW.Players.get(license);
	if (!player) {
		console.error(`There was no player with id ${license}`);
		return;
	}
	return player;
};

global.exports("GetPlayerFromSource", GetPlayerFromSource);

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
	if (playerLeft) NW.Players.delete(player2.getLicense());
};

global.exports("SavePlayer", SavePlayer);