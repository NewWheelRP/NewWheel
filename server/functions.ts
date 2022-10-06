import { Vector4 } from "@nativewrappers/client";
import { CharacterDataObject, PlayerDataObject } from "../types";
import { Character } from "./Classes/Character";
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
			player.getPlayTime()
		],
		() => {
			UpdatePlayerDataClient(source, "new", "all", player.toClientObject());
			sendCharacters(source, license);
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

export const SavePlayers = (playersLeft?: boolean) => {
	console.info("Saving all players...");
	NW.Players.forEach((player: Player) => SavePlayer(player, playersLeft));
};

global.exports("SavePlayers", SavePlayers);

export const SavePlayer = (player: Player | number, playerLeft?: boolean) => {
	let player2: Player | undefined;

	if (player instanceof Player) player2 = player;
	else player2 = GetPlayerFromSource(player);

	if (!player2 || !(player2 instanceof Player)) return;

	player2.save(playerLeft);

	if (playerLeft) {
		const playerSrc: number = player2.getSource();
		const playerClObj: PlayerDataObject = player2.toClientObject();
		emitNet("NW:PlayerLogout", playerSrc, playerClObj);
		emit("NW:PlayerLogout", playerSrc, playerClObj);
		NW.Players.delete(playerSrc);
	}
};

global.exports("SavePlayer", SavePlayer);

export const SaveCoords = (player: Player | number, coords: Vector4) => {
	let player2: Player | undefined;

	if (player instanceof Player) player2 = player;
	else player2 = GetPlayerFromSource(player);

	if (!player2 || !(player2 instanceof Player)) return;

	const character: Character | undefined = player2.getCurrentCharacter();

	if (!character) return;

	character.setCoords(coords, true);
}

global.exports("SaveCoords", SaveCoords);

export const UpdatePlayerDataClient = (source: number, type: string, changed: string, changedVal: any, previousVal?: any): void => {
	let data: undefined | PlayerDataObject;

	const player = GetPlayerFromSource(source);
	if (!player) return;
	data = player.toClientObject();

	if (!data) return;

	emitNet("NW:SetPlayerData", source, data, changed, changedVal, previousVal);
	emit("NW:PlayerDataUpdated", source, data, changed, changedVal, previousVal);
};

export const UpdateCharacterDataClient = (source: number, citizenId: string, type: string, changed: string, changedVal: any, previousVal?: any): void => {
	let data: undefined | CharacterDataObject;

	const player = GetPlayerFromSource(source);

	if (!player) return;

	const character = player.getCurrentCharacter();

	if (character.getCitizenId() === citizenId) data = character.toClientObject();

	if (!data) return;

	emitNet("NW:SetCharacterData", source, data, type, changed, changedVal, previousVal);
	emit("NW:CharacterDataUpdated", source, data, type, changed, changedVal, previousVal);
};