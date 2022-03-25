import { Character } from "./Classes/Character";
import { Player } from "./Classes/Player";
import { getLicense } from "./utils";
import { NW } from "./server";
import { FormCharacterObject, Vector4 } from "../types/types";

onNet("NW:SetCurrentChar", (id: string) => {
	const _source = source;
	const _license = getLicense(_source.toString());
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
	emitNet("NW:PlayerLoaded", source, player);
	emitNet("NW:Spawn", _source, char.getCoords());
});

onNet("NW:CreateNewCharacter", (data: FormCharacterObject) => {
	const player = NW.Functions.GetPlayerFromSource(source.toString());
	if (!player) return;
	const character = Character.New(source.toString(), player.license, data);
	player.setCharacter(character);
	player.currentCharacter = character;
	player.save();
	emitNet("NW:PlayerLoaded", source, player);
	emitNet("NW:Spawn", source, character.getCoords());
});

onNet("NW:DeleteCharacter", (data: string) => {
	const player = NW.Functions.GetPlayerFromSource(source.toString());
	if (!player) return;
	player.deleteCharacter(data);
});

onNet("NW:UpdateCharCoords", (data: Vector4) => {
	const player = NW.Functions.GetPlayerFromSource(source.toString());
	const character = player.getCurrentCharacter();
	if (character) character.coords = data;
});

on("playerDropped", (_reason: string) => {
	const player = NW.Functions.GetPlayerFromSource(global.source.toString());
	NW.Functions.SavePlayer(player, true);
	emitNet("NW:PlayerLogout", global.source);
});

onNet("NW:SaveAll", () => {
	NW.Functions.SavePlayers();
});
