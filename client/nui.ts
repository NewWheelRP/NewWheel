import { NUIOff } from "./utils";

RegisterNuiCallbackType("setCharacter");
on("__cfx_nui:setCharacter", async (data: unknown, cb: Function) => {
	NUIOff();

	DoScreenFadeIn(200);
	// Load the character
	emitNet("NW:SetCurrentChar", data);

	cb({});
});

RegisterNuiCallbackType("createCharacter");
on("__cfx_nui:createCharacter", async (data: unknown, cb: Function) => {
	NUIOff();

	DoScreenFadeIn(200);

	emitNet("NW:CreateNewCharacter", data);

	cb({});
});

RegisterNuiCallbackType("deleteCharacter");
on("__cfx_nui:deleteCharacter", async (data: string, cb: Function) => {
	emitNet("NW:DeleteCharacter", data);
	cb({});
});