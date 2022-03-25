import { Vector4 } from "../types/types";
import { NW } from "./client";
import { toVector4 } from "./utils";

NW.Functions = {};

NW.Functions.Teleport = (coords: Vector4) => {
	const ped = PlayerPedId();
	SetEntityCoords(ped, coords.x, coords.y, coords.z, true, false, false, false);
	SetEntityHeading(ped, coords.w ? coords.w : 120.0);
};

global.exports("Teleport", NW.Functions.Teleport);

NW.Functions.SaveCoords = () => {
	const ped = PlayerPedId();
	const coords = GetEntityCoords(ped, true);
	coords[0] = Math.round(coords[0] * 1000) / 1000;
	coords[1] = Math.round(coords[1] * 1000) / 1000;
	coords[2] = Math.round((coords[2] - 1) * 1000) / 1000;
	const heading = Math.round(GetEntityHeading(ped) * 1000) / 1000;
	emitNet("NW:UpdateCharCoords", toVector4(coords, heading));
};
global.exports("SaveCoords", NW.Functions.SaveCoords);
