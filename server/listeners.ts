import { Character } from "./Classes/Character";
import { Player } from "./Classes/Player";
import { NW } from "./server";
import * as config from "../config.json";
import { CharacterNewObject, PlayerDataObject, Vector4 } from "../types";
import { GetPlayerFromSource, SavePlayer, SavePlayers, UpdatePlayerDataClient } from "./functions";

onNet("NW:SetCurrentChar", (id: string) => {
	const source = global.source;
	const player = NW.Players.get(source);
	if (!player) {
		console.error("No player was found");
		return;
	}
	const char = player.getCharacter(id);
	if (!char) return;
	player.setCurrentCharacter(char);
	const clientObject: PlayerDataObject = player.toClientObject();
	emit("NW:CharacterChosen", source);
	emitNet("NW:PlayerLoaded", source, clientObject);
	UpdatePlayerDataClient(clientObject);
	emitNet("NW:Spawn", source, char.getCoords());
});

onNet("NW:CreateNewCharacter", (data: CharacterNewObject) => {
	const source = global.source;
	const player = GetPlayerFromSource(source);
	if (!player) return;
	const character = Character.new(source, player.getLicense(), data);
	player.setCharacter(character);
	player.setCurrentCharacter(character);
	player.save();
	const clientObject: PlayerDataObject = player.toClientObject();
	emit("NW:CharacterChosen", source);
	emitNet("NW:PlayerLoaded", source, clientObject);
	UpdatePlayerDataClient(clientObject);
	emitNet("NW:Spawn", source, character.getCoords());
});

onNet("NW:DeleteCharacter", (data: string) => {
	const player = GetPlayerFromSource(source);
	if (!player) return;
	player.deleteCharacter(data);
});

onNet("NW:UpdateCharCoords", (data: Vector4) => {
	const player = GetPlayerFromSource(source);
	if (!player) return;
	const character = player.getCurrentCharacter();
	if (character) character.setCoords(data);
});

on("playerDropped", (_reason: string) => {
	const player = GetPlayerFromSource(global.source);
	if (!player) return;
	SavePlayer(player, true);
	emitNet("NW:PlayerLogout", global.source);
});

onNet("NW:SaveAll", () => {
	SavePlayers();
});

on("onResourceStop", (resource: string) => {
	if (resource === "NewWheel") {
		SavePlayers();
		emitNet("NW:PlayerLogout", -1);
	} else if (resource === config.characters.inventory) {
		SavePlayers();
	}
});

on("onResourceStart", (resource: string) => {
	if (resource !== "ox_inventory" || config.characters.inventory !== "ox_inventory") return;
	NW.Players.forEach((player: Player) => player.getCurrentCharacter()?.loadInventory());
});