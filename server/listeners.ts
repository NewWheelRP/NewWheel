import { Character } from "./Classes/Character";
import { Player } from "./Classes/Player";
import NW from "./server";
import * as config from "../config.json";
import { CharacterNewObject, PlayerDataObject } from "../types";
import { Vector4 } from "@nativewrappers/client";
import { GetPlayerFromSource, SavePlayer, SavePlayers, UpdateCharacterDataClient, UpdatePlayerDataClient } from "./functions";

onNet("NW:SetCurrentChar", (id: string) => {
	const source: number = global.source;
	const player: Player | undefined = NW.Players.get(source);
	if (!player) {
		console.error("No player was found");
		return;
	}
	const char: Character | undefined = player.getCharacter(id);
	if (!char) return;
	player.setCurrentCharacter(char);
	const clientObject: PlayerDataObject = player.toClientObject();
	emit("NW:CharacterChosen", source, char.getCitizenId());
	UpdatePlayerDataClient(clientObject);
	UpdateCharacterDataClient(char.toClientObject());
	emitNet("NW:PlayerLoaded", source, clientObject);
	emitNet("NW:Spawn", source, char.getCoords());
});

onNet("NW:CreateNewCharacter", (data: CharacterNewObject) => {
	const source: number = global.source;
	const player: Player | undefined = GetPlayerFromSource(source);
	if (!player) return;
	const character: Character = Character.new(source, player.getLicense(), data);
	player.setCharacter(character);
	player.setCurrentCharacter(character);
	player.save();
	const clientObject: PlayerDataObject = player.toClientObject();
	emit("NW:CharacterChosen", source);
	UpdatePlayerDataClient(clientObject);
	UpdateCharacterDataClient(character.toClientObject());
	emitNet("NW:PlayerLoaded", source, clientObject);
	emitNet("NW:Spawn", source, character.getCoords());
});

onNet("NW:DeleteCharacter", (data: string) => {
	const player: Player | undefined = GetPlayerFromSource(source);
	if (!player) return;
	player.deleteCharacter(data);
});

onNet("NW:UpdateCharCoords", (data: Vector4) => {
	const player: Player | undefined = GetPlayerFromSource(source);
	if (!player) return;
	const character: Character = player.getCurrentCharacter();
	if (character) character.setCoords(data, true);
});

on("playerDropped", () => {
	const player: Player | undefined = GetPlayerFromSource(global.source);
	if (!player) return;
	const groups: string | string[] = player.getGroups();
	if (Array.isArray(groups)) {
		groups.forEach((group: string) => {
			ExecuteCommand(`remove_principal player.${player.getSource()} nw.${group}`);
		});
	} else {
		ExecuteCommand(`remove_principal player.${player.getSource()} nw.${groups}`);
	}
	SavePlayer(player, true);
});

onNet("NW:SaveAll", () => {
	SavePlayers();
});

on("onResourceStop", (resource: string) => {
	if (resource === "NewWheel") {
		SavePlayers(true);
	} else if (resource === config.characters.inventory) {
		SavePlayers();
	}
});

on("onServerResourceStart", (resource: string) => {
	if (resource !== "ox_inventory" || config.characters.inventory !== "ox_inventory") return;
	NW.Players.forEach((player: Player) => player.getCurrentCharacter()?.loadInventory(true));
});