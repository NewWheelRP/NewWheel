import { CharacterDataObject, PlayerDataObject } from "../types";
import { Player } from "./Classes/Player";
import NW, { sendCharacters } from "./server";
import { Delay } from "../shared/utils";

let delayOn: boolean = false;

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
			UpdatePlayerDataClient(source);
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

	player2.save(true);

	if (playerLeft) {
		emitNet("NW:PlayerLogout", player2.getSource(), player2.toClientObject());
		emit("NW:PlayerLogout", player2.getSource(), player2.toClientObject());
		NW.Players.delete(player2.getSource());
	}
};

global.exports("SavePlayer", SavePlayer);

export const UpdatePlayerDataClient = (source: number) => {
	if (delayOn) return;
	delayOn = true;
	Delay(200);

	let data: undefined | PlayerDataObject;

	const player = GetPlayerFromSource(source);
	if (!player) return;
	data = player.toClientObject();

	if (!data) return;

	emitNet("NW:SetPlayerData", source, data);
	emit("NW:PlayerDataUpdated", source, data);
	delayOn = false;
};

export const UpdateCharacterDataClient = (source: number, citizenId: string) => {
	if (delayOn) return;
	delayOn = true;
	Delay(200);

	let data: undefined | CharacterDataObject;

	const player = GetPlayerFromSource(source);

	if (!player) return;

	const character = player.getCurrentCharacter();

	if (character.getCitizenId() === citizenId) data = character.toClientObject();

	if (!data) return;
	emitNet("NW:SetCharacterData", source, data);
	emit("NW:CharacterDataUpdated", source, data);
	delayOn = false;
};