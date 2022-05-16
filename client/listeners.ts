import NW from "./client";
import { PlayerDataObject, CharacterDataObject } from "../types";
import { Vector3 } from "@nativewrappers/client";
import { Teleport } from "./functions";

onNet("NW:Spawn", (coords: Vector3) => {
	Teleport(coords);
});

onNet("NW:ShowCharacterSelection", (characters: CharacterDataObject[]) => {
	SetNuiFocus(true, true);
	SendNUIMessage({
		action: "setVisible",
		data: {
			visible: true,
			route: "/characters/list",
			data: {
				characters: characters
			}
		},
	});
});

onNet("NW:SetPlayerData", (playerData: PlayerDataObject, characterData: CharacterDataObject | undefined) => {
	if (GetInvokingResource() !== GetCurrentResourceName()) return;
	NW.PlayerData = playerData;
	if (characterData) NW.CharacterData = characterData;
	else if (playerData.character) NW.CharacterData = playerData.character;
});