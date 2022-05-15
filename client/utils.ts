import { Vector4 } from "@nativewrappers/client";

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