import { Game, Vector3 } from "@nativewrappers/client";
import { PlayerDataObject } from "../types";
import { NW } from "./client";
import { roundByThousands, toVector4 } from "./utils";

export const Teleport = (coords: Vector3, heading?: number): void => {
	const ped: number = Game.PlayerPed.Handle;
	SetEntityCoords(ped, coords.x, coords.y, coords.z, true, false, false, false);
	SetEntityHeading(ped, heading ?? 90.0);
}

global.exports("Teleport", Teleport);

export const SaveCoords = (): void => {
	const ped: number = Game.PlayerPed.Handle;
	const coords: number[] = GetEntityCoords(ped, true);
	coords[0] = roundByThousands(coords[0]);
	coords[1] = roundByThousands(coords[1]);
	coords[2] = roundByThousands(coords[2]);
	const heading: number = roundByThousands(GetEntityHeading(ped));
	emitNet("NW:UpdateCharCoords", toVector4(coords, heading));
}

global.exports("SaveCoords", SaveCoords);

export const GetPlayerData = (): PlayerDataObject => NW.PlayerData;

global.exports("GetPlayerData", GetPlayerData);