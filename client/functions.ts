import { Vector3 } from "@nativewrappers/client";
import { CharacterDataObject, PlayerDataObject } from "../types";
import NW from "./client";

export const Teleport = (coords: Vector3, heading?: number): void => {
	const ped: number = PlayerPedId();
	SetEntityCoords(ped, coords.x, coords.y, coords.z, true, false, false, false);
	SetEntityHeading(ped, heading ?? 90.0);
}

global.exports("Teleport", Teleport);

export const GetPlayerData = (): PlayerDataObject => NW.PlayerData;

global.exports("GetPlayerData", GetPlayerData);

export const GetCharacterData = (): CharacterDataObject => NW.CharacterData;

global.exports("GetCharacterData", GetCharacterData);