import { Vector4 } from "../types/types";
import { NW } from "./client";
import { roundByThousands, toVector4 } from "./utils";

NW.Functions = {};

NW.Functions.Teleport = (coords: Vector4) => {
	const ped = PlayerPedId();
	SetEntityCoords(ped, coords.x, coords.y, coords.z, true, false, false, false);
	SetEntityHeading(ped, coords.w ? coords.w : 120.0);
}

global.exports("Teleport", NW.Functions.Teleport);

NW.Functions.SaveCoords = () => {
	const ped = PlayerPedId();
	const coords = GetEntityCoords(ped, true);
	coords[0] = roundByThousands(coords[0]);
	coords[1] = roundByThousands(coords[1]);
	coords[2] = roundByThousands(coords[2] - 1);
	const heading = roundByThousands(GetEntityHeading(ped));
	emitNet("NW:UpdateCharCoords", toVector4(coords, heading));
}

global.exports("SaveCoords", NW.Functions.SaveCoords);

NW.Functions.GetPlayerData = () => NW.PlayerData;

global.exports("GetPlayerData", NW.Functions.GetPlayerData);