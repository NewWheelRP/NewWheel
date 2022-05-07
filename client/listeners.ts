import { NW } from "./client";
import { Vector3, Vector4 } from "../types/types";
import { Teleport } from "./functions"; 

onNet("NW:Spawn", (coords: Vector3) => {
	Teleport(coords);
});

onNet("NW:ShowCharacterSelection", (characters: any[]) => {
	SetNuiFocus(true, true);
	SendNUIMessage({
		action: "setVisible",
		data: {
			visible: true,
			route: "/characters/list",
			data: {
				characters: characters,
			},
		},
	});
});

onNet("NW:PlayerLoaded", (data: any) => {
	NW.PlayerData = data;
});

onNet("NW:SetPlayerData", (playerData: any) => {
	NW.PlayerData = playerData;
});