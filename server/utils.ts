import { Crypto } from "@nativewrappers/client";

export const getLicense = (player: number): string | undefined => {
	const playerSrc: string = player.toString();
	const numIdentifiers: number = GetNumPlayerIdentifiers(playerSrc);
	for (let i = 0; i < numIdentifiers; i++) {
		const identifier = GetPlayerIdentifier(playerSrc, i);
		if (identifier.includes("license:")) return identifier;
	}
};

export const generateUUIDv4 = (): string => Crypto.uuidv4();

global.exports("generateUUIDv4", generateUUIDv4);