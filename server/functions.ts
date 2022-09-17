import { CharacterDataObject, PlayerDataObject } from "../types";
import { Player } from "./Classes/Player";
import NW, { sendCharacters } from "./server";

export const OnFirstJoin = (source: number, license: string) => {
	const player = new Player(source, license, true);
	NW.Players.set(source, player);

	let groups: string | string[] = player.getGroups();

	if (Array.isArray(groups)) {
		groups = JSON.stringify(groups);
	}

	global.exports.oxmysql.insert(
		`INSERT INTO players (license, name, groups, firstLogin, lastLogin, playTime) VALUES (?, ?, ?, ?, ?, ?)`,
		[
			player.getLicense(),
			player.getName(),
			groups,
			player.getFirstLogin(),
			player.getLastLogin(),
			player.getPlayTime(),
		],
		() => {
			UpdatePlayerDataClient(player.toClientObject());
			sendCharacters(source, license, []);
		}
	);
};

global.exports("OnFirstJoin", OnFirstJoin);

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
	let player2: Player | undefined;

	if (player instanceof Player) player2 = player;
	else player2 = GetPlayerFromSource(player);

	if (!player2 || !(player2 instanceof Player)) return;

	player2.save(true);

	if (playerLeft) NW.Players.delete(player2.getSource());
};

global.exports("SavePlayer", SavePlayer);

export const UpdatePlayerDataClient = (data?: PlayerDataObject, source?: number) => {
	if (!data && source) {
		const player = GetPlayerFromSource(source);
		if (!player) return;
		data = player.toClientObject();
	}
	if (!data) return;
	emitNet("NW:SetPlayerData", data.source, data);
	emit("NW:PlayerDataUpdated", data.source, data);
};

export const UpdateCharacterDataClient = (data?: CharacterDataObject, source?: number, citizenId?: string) => {
	if (!data && source) {
		const player = GetPlayerFromSource(source);
		if (!player) return;
		const character = player.getCurrentCharacter();
		if (character.getCitizenId() === citizenId) data = character.toClientObject();
	}
	if (!data) return;
	emitNet("NW:SetCharacterData", data.source, data);
	emit("NW:CharacterDataUpdated", data.source, data);
};