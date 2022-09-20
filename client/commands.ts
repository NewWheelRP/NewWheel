import { Vector3 } from "@nativewrappers/client";
import NW from "./client";
import { SaveCoords } from "./functions";
import { getClosestVehicle } from "./utils";
import { Delay, joaat } from "../shared/utils";

RegisterCommand("car", async (_source: number, args: string[]) => {
	if (args.length < 1) {
		console.error("Please add a car to spawn");
		return;
	}

	const hash: number = joaat(args[0]);

	if (!IsModelInCdimage(hash) || !IsModelValid(hash)) {
		console.error(`Vehicle ${args[0]} doesn't exist`);
		return;
	}

	if (!HasModelLoaded(hash)) {
		RequestModel(hash);
		while (!HasModelLoaded(hash)) {
			Delay(10);
		}
	}

	const playerPed: number = PlayerPedId();
	const coords: number[] = GetEntityCoords(playerPed, true);
	const vehicle: number = CreateVehicle(joaat(args[0]), coords[0], coords[1], coords[2], GetEntityHeading(playerPed), true, false);

	if (vehicle === 0) {
		console.error("This vehicle does not exist");
		return;
	}

	SetPedIntoVehicle(playerPed, vehicle, -1);
}, false);

RegisterCommand("repairveh", async () => {
	const veh: number = GetVehiclePedIsIn(PlayerPedId(), false);
	if (veh === 0) return;
	SetVehicleFixed(veh);
}, false);

RegisterCommand("saveall", async () => {
	SaveCoords();
	emitNet("NW:SaveAll");
}, false);

RegisterCommand("dv", async () => {
	const playerPed: number = PlayerPedId();
	const veh: number = GetVehiclePedIsIn(playerPed, false);
	if (veh !== 0) {
		SetEntityAsMissionEntity(veh, true, true);
		DeleteVehicle(veh);
	} else {
		const pcoords = GetEntityCoords(playerPed, true);
		const coords = new Vector3(pcoords[0], pcoords[1], pcoords[2]);
		const veh: number = getClosestVehicle(coords);
		if (veh !== 0) {
			SetEntityAsMissionEntity(veh, true, true);
			DeleteVehicle(veh);
		}
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

	SetEntityCoords(PlayerPedId(), x, y, z, true, false, false, false);
}, false);

const TPW = async () => {
	const waypoint: number = GetFirstBlipInfoId(8);
	if (!waypoint) {
		console.error("There was no waypoint set");
		return;
	}

	const playerPed: number = PlayerPedId();

	DoScreenFadeOut(10);

	const coords: number[] = GetBlipInfoIdCoord(waypoint);

	SetEntityCoords(playerPed, coords[0], coords[1], coords[2], true, false, false, false);

	const newCoord: [boolean, number, number[]] = GetGroundZAndNormalFor_3dCoord(coords[0], coords[1], coords[2]);

	SetEntityCoords(playerPed, coords[0], coords[1], newCoord[1], true, false, false, false);

	DoScreenFadeIn(100);
}

RegisterCommand("tpw", TPW, false);
RegisterCommand("tpm", TPW, false);

RegisterCommand("logout", async () => {
	if (!NW.CharacterData.loggedIn) return;
	emitNet("NW:LogoutPlayer");
}, false);