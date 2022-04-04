import { Character } from "./Classes/Character";
import { Player } from "./Classes/Player";
import { getLicense } from "./utils";
import { NW } from "./server";
import { CharacterNewObject, Vector4 } from "../types/types";

onNet("NW:SetCurrentChar", (id: string) => {
	const _source = source;
	const _license = getLicense(_source);
	if (!_license) {
		console.error("No license was found");
		return;
	}
	const player = NW.Players.get(_license);
	if (!player) {
		console.error("No player was found");
		return;
	}
	const char = player.getCharacter(id);
	if (!char) return;
	player.setCurrentCharacter(char);
	emit("NW:CharacterChosen", _source);
	emitNet("NW:PlayerLoaded", source, player);
	emitNet("NW:Spawn", _source, char.getCoords());
});

onNet("NW:CreateNewCharacter", (data: CharacterNewObject) => {
	const player = NW.Functions.GetPlayerFromSource(source);
	if (!player) return;
	const character = Character.New(source, player.license, data);
	player.setCharacter(character);
	player.currentCharacter = character;
	player.save();
	emit("NW:CharacterChosen", source);
	emitNet("NW:PlayerLoaded", source, player);
	emitNet("NW:Spawn", source, character.getCoords());
});

onNet("NW:DeleteCharacter", (data: string) => {
	const player = NW.Functions.GetPlayerFromSource(source);
	if (!player) return;
	player.deleteCharacter(data);
});

onNet("NW:UpdateCharCoords", (data: Vector4) => {
	const player = NW.Functions.GetPlayerFromSource(source);
	const character = player.getCurrentCharacter();
	if (character) character.coords = data;
});

on("playerDropped", (_reason: string) => {
	const player = NW.Functions.GetPlayerFromSource(global.source);
	NW.Functions.SavePlayer(player, true);
	emitNet("NW:PlayerLogout", global.source);
});

onNet("NW:SaveAll", () => {
	NW.Functions.SavePlayers();
});

on("onResourceStop", () => {
	NW.Functions.SavePlayers();
	emitNet("NW:PlayerLogout", -1);
});