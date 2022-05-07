import * as Cfx from "@nativewrappers/client";
import { Vector3 } from "@nativewrappers/client";
import { NW } from "./client";
import { SaveCoords } from "./functions";

RegisterCommand("car", async (_source: number, args: string[]) => {
	if (args.length < 1) {
		console.error("Please add a car to spawn");
		return;
	}

	const coords = GetEntityCoords(PlayerPedId(), true);
	const vehicle: any = await Cfx.World.createVehicle(
		new Cfx.Model(args[0]),
		new Vector3(coords[0], coords[1], coords[2]),
		4
	);

	if (!vehicle) {
		console.error("This vehicle does not exist");
		return;
	}

	Cfx.Game.PlayerPed.setIntoVehicle(vehicle, Cfx.VehicleSeat.Driver);
}, false);

RegisterCommand("repairveh", async () => {
	Cfx.Game.PlayerPed.CurrentVehicle?.repair();
}, false);

RegisterCommand("saveall", async () => {
	SaveCoords();
	emitNet("NW:SaveAll");
}, false);

RegisterCommand("dv", async () => {
	const veh = Cfx.Game.PlayerPed.CurrentVehicle;
	if (veh) {
		veh.delete();
	} else {
		const pcoords = GetEntityCoords(PlayerPedId(), true);
		const coords = new Vector3(pcoords[0], pcoords[1], pcoords[2]);
		const veh = Cfx.World.getClosestVehicle(coords);
		if (veh) veh.delete();
	}
}, false);

RegisterCommand("tp", async (_source: number, args: string[]) => {
	if (args.length < 3) {
		console.error("Please pass 3 arguments: [x] [y] [z]");
		return;
	}

	const x = parseInt(args[0]);
	const y = parseInt(args[1]);
	const z = parseInt(args[2]);

	SetEntityCoords(PlayerPedId(), x, y, z, true, false, false, false);
}, false);

RegisterCommand("tpw", async () => {
	const waypoint = GetFirstBlipInfoId(8);
	if (!waypoint) {
		console.error("There was no waypoint set");
		return;
	}

	DoScreenFadeOut(10);

	const coords = GetBlipInfoIdCoord(waypoint);

	SetEntityCoords(PlayerPedId(), coords[0], coords[1], coords[2], true, false, false, false);

	const newCoord = GetGroundZAndNormalFor_3dCoord(coords[0], coords[1], coords[2]);

	SetEntityCoords(PlayerPedId(), coords[0], coords[1], newCoord[1], true, false, false, false);

	DoScreenFadeIn(100);
}, false);

RegisterCommand("logout", async () => {
	if (!NW.PlayerData.loggedIn) return;
	emitNet("NW:LogoutPlayer");
}, false);