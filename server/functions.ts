import { PlayerDataObject } from "../types";
import { Player as PlayerClass } from "./Classes/Player";
import { NW, sendCharacters } from "./server";
import { getLicense } from "./utils";

export const OnFirstJoin = (source: number, license: string) => {
	const player = PlayerClass.new(source, license);
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

export const GetPlayerFromSource = (source: number): PlayerClass | undefined => NW.Players.get(source);

global.exports("GetPlayerFromSource", GetPlayerFromSource);

export const GetPlayerFromLicense = (license: string): PlayerClass | undefined => {
	NW.Players.forEach((player: PlayerClass) => {
		if (player.getLicense() === license) return player;
	})
	return;
};

global.exports("GetPlayerFromLicense", GetPlayerFromLicense);

export const SavePlayers = () => {
	console.info("Saving all players...");
	NW.Players.forEach((player: PlayerClass) => SavePlayer(player));
};

global.exports("SavePlayers", SavePlayers);

export const SavePlayer = (player: PlayerClass | number, playerLeft?: boolean) => {
	let player2: PlayerClass | undefined;

	// @ts-ignore
	if (player instanceof Player) player2 = player;

	//@ts-ignore
	else player2 = GetPlayerFromSource(player);

	if (!player2 || player2! instanceof Player) return;

	// @ts-ignore
	player2.save();

	// @ts-ignore
	if (playerLeft) NW.Players.delete(player2.getSource());
};

global.exports("SavePlayer", SavePlayer);

export const UpdatePlayerDataClient = (data: PlayerDataObject) => {
	emitNet("NW:SetPlayerData", data.source, data);
	Player(data.source).state.set("playerDataUpdatedAt", new Date().getTime(), true);
};