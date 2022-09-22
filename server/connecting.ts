import { getLicense } from "./utils";

on("playerConnecting", (name: string, _setKickReason: Function, deferrals: any) => {
	deferrals.defer();

	const player: string = global.source.toString();

	deferrals.update(`Hello ${name}. Your license is being checked.`);

	const license: string | undefined = getLicense(Number(player));

	if (!license) deferrals.done("You don't have a valid license.");
	else deferrals.done();
});