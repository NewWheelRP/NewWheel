import { Crypto } from "@nativewrappers/client";

export const getLicense = (player: number) => {
	for (let i = 0; i < GetNumPlayerIdentifiers(player.toString()); i++) {
		const identifier = GetPlayerIdentifier(player.toString(), i);
		if (identifier.includes("license:")) return identifier;
	}
};

export const generateUUIDv4 = () => {
	return Crypto.uuidv4();
};

global.exports("generateUUIDv4", generateUUIDv4);
