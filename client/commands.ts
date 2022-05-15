import { Game, World, Vehicle, VehicleSeat, Model } from "@nativewrappers/client";
import { Vector3 } from "@nativewrappers/client";
import { NW } from "./client";
import { SaveCoords } from "./functions";

RegisterCommand("car", async (_source: number, args: string[]) => {
	if (args.length < 1) {
		console.error("Please add a car to spawn");
		return;
	}

	const coords: number[] = GetEntityCoords(Game.PlayerPed.Handle, true);
	const vehicle: Vehicle | null = await World.createVehicle(
		new Model(args[0]),
		new Vector3(coords[0], coords[1], coords[2]),
		GetEntityHeading(Game.PlayerPed.Handle),
		true
	);

	if (!vehicle) {
		console.error("This vehicle does not exist");
		return;
	}

	Game.PlayerPed.setIntoVehicle(vehicle, VehicleSeat.Driver);
}, false);

RegisterCommand("repairveh", async () => {
	Game.PlayerPed.CurrentVehicle?.repair();
}, false);

RegisterCommand("saveall", async () => {
	SaveCoords();
	emitNet("NW:SaveAll");
}, false);

RegisterCommand("dv", async () => {
	const veh: Vehicle | null = Game.PlayerPed.CurrentVehicle;
	if (veh) veh.delete();
	else {
		const pcoords = GetEntityCoords(Game.PlayerPed.Handle, true);
		const coords = new Vector3(pcoords[0], pcoords[1], pcoords[2]);
		const veh = World.getClosestVehicle(coords);
		if (veh) veh.delete();
	}
}, false);

RegisterCommand("tp", async (_source: number, args: string[]) => {
	if (args.length < 3) {
		console.error("Please pass 3 arguments: [x] [y] [z]");
		return;
	}

	const x: number = parseInt(args[0]);
	const y: number = parseInt(args[1]);
	const z: number = parseInt(args[2]);

	SetEntityCoords(Game.PlayerPed.Handle, x, y, z, true, false, false, false);
}, false);

RegisterCommand("tpw", async () => {
	const waypoint: number = GetFirstBlipInfoId(8);
	if (!waypoint) {
		console.error("There was no waypoint set");
		return;
	}

	DoScreenFadeOut(10);

	const coords: number[] = GetBlipInfoIdCoord(waypoint);

	SetEntityCoords(Game.PlayerPed.Handle, coords[0], coords[1], coords[2], true, false, false, false);

	const newCoord: [boolean, number, number[]] = GetGroundZAndNormalFor_3dCoord(coords[0], coords[1], coords[2]);

	SetEntityCoords(Game.PlayerPed.Handle, coords[0], coords[1], newCoord[1], true, false, false, false);

	DoScreenFadeIn(100);
}, false);

RegisterCommand("logout", async () => {
	if (!NW.PlayerData.loggedIn) return;
	emitNet("NW:LogoutPlayer");
}, false);