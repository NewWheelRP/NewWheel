import { Vector4 } from "../types/types";

export const Delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const NUIOff = () => {
	SetNuiFocus(false, false);
	SendNUIMessage({
		action: "setVisible",
		data: {
			visible: false,
		}
	});
};

export const toVector4 = (coords: number[], heading: number): Vector4 => {
	const newVec: Vector4 = {
		x: coords[0],
		y: coords[1],
		z: coords[2],
		w: heading
	};
	return newVec;
}