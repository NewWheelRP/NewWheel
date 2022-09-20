import { Vector3, Vector4 } from "@nativewrappers/client";

export const Delay = (ms: number): unknown => new Promise((res) => setTimeout(res, ms));

export const NUIOff = () => {
	SetNuiFocus(false, false);
	SendNUIMessage({
		action: "setVisible",
		data: {
			visible: false,
		}
	});
};

export const toVector4 = (coords: number[], heading: number): Vector4 => new Vector4(coords[0], coords[1], coords[2], heading);

export const roundByThousands = (num: number): number => Math.round(num * 1000) / 1000;

export const getClosestVehicle = (coords: Vector3): number => {
	const vehicles = GetGamePool("CVehicle");
	let currentVeh: number = 0;
	let lastDistance: number = 9999.0;
	for (let i = 0; i < vehicles.length; i++) {
		const vehicle: number = vehicles[i];
		if (!currentVeh) {
			currentVeh = vehicle;
			const vehCoords: number[] = GetEntityCoords(vehicle, true);
			lastDistance = coords.distance(new Vector3(vehCoords[0], vehCoords[1], vehCoords[2]));
			continue;
		}

		const vehCoords: number[] = GetEntityCoords(vehicle, true);
		const distance = coords.distance(new Vector3(vehCoords[0], vehCoords[1], vehCoords[2]));
		if (distance < lastDistance) {
			currentVeh = vehicle;
			lastDistance = distance;
		}
	}

	return currentVeh;
};

export const joaat = (key: string): number => {
    const keyLowered = key.toLowerCase();
    const length = keyLowered.length;

    let hash, i;

    for (hash = i = 0; i < length; i++) {
        hash += keyLowered.charCodeAt(i);
        hash += hash << 10;
        hash ^= hash >>> 6;
    }

    hash += hash << 3;
    hash ^= hash >>> 11;
    hash += hash << 15;

    return Math.floor(hash << 0);
};