import { Crypto } from "@nativewrappers/client";

export const getLicense = (player: string) => {
	for (let i = 0; i < GetNumPlayerIdentifiers(player); i++) {
		const identifier = GetPlayerIdentifier(player, i);
		if (identifier.includes("license:")) return identifier;
	}
};

export const generateUUIDv4 = () => {
	return Crypto.uuidv4();
};

global.exports("generateUUIDv4", generateUUIDv4);
