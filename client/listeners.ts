import NW, { setForceRespawn, setSpawnCoords } from "./client";
import { PlayerDataObject, CharacterDataObject } from "../types";
import { Vector4 } from "@nativewrappers/client";

onNet("NW:Spawn", (coords: Vector4) => {
	setSpawnCoords(coords);
	setForceRespawn(true);
});

onNet("NW:ShowCharacterSelection", (characters: CharacterDataObject[]) => {
	setTimeout(() => {
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
	}, 3000);
});

onNet("NW:SetPlayerData", (playerData: PlayerDataObject, type: string, changed: string, changedVal: any, previousVal?: any) => {
	const invokingResource: string | null = GetInvokingResource();
	if (invokingResource && invokingResource !== GetCurrentResourceName()) return;
	NW.PlayerData = playerData;
	emit("NW:PlayerDataUpdated", playerData, type, changed, changedVal, previousVal);
});

onNet("NW:SetCharacterData", (characterData: CharacterDataObject, type: string, changed: string, changedVal: any, previousVal?: any) => {
	const invokingResource: string | null = GetInvokingResource();
	if (invokingResource && invokingResource !== GetCurrentResourceName()) return;
	NW.CharacterData = characterData;
	emit("NW:CharacterDataUpdated", characterData, type, changed, changedVal, previousVal);
});