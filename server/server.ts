interface NW {
	Functions: any;
	Players: Map<string, Player>;
}

export const NW: NW = {
	Functions: undefined!,
	Players: undefined!,
};

import { Character } from "./Classes/Character";
import { Player } from "./Classes/Player";
import { getLicense } from "./utils";
import "./listeners";
import "./connecting";
import "./functions";

NW.Players = new Map<string, Player>();

onNet("NW:LogoutPlayer", () => {
	const player = NW.Functions.GetPlayerFromSource(global.source.toString());
	NW.Functions.SavePlayer(player);
	emitNet("NW:PlayerLogout", global.source);
	loadCharacters(global.source, player.license);
});

onNet("NW:PlayerJoined", () => {
	const src = global.source;
	const license = getLicense(src);
	if (!license) return;
	global.exports.oxmysql.single(
		"SELECT * FROM players WHERE license = ?",
		[license],
		(result: any) => {
			if (!result) {
				firstJoin(src.toString(), license);
				return;
			}
			const player = Player.Load(src, result);
			NW.Players.set(license, player);
			loadCharacters(src, license);
		}
	);
});

const loadCharacters = (source: number, license: string) => {
	global.exports.oxmysql.query(
		"SELECT * FROM characters WHERE license = ?",
		[license],
		(result: any) => {
			sendCharacters(source, license, result);
		}
	);
};

export const sendCharacters = (source: number, license: string, result?: any) => {
	const player = NW.Players.get(license);
	const chars: Character[] = [];

	if (!player) return;

	const newChars: any = [];
	if (result) {
		result.forEach((v: any) => {
			const char = Character.Load(source, license, v);
			newChars.push(char.toClientObject());

			chars.push(char);
		});

		player.setCharacters(chars);
	}
	emitNet("NW:ShowCharacterSelection", source, newChars);
};

const firstJoin = (source: string, license: string) => {
	// Create player
	NW.Functions.OnFirstJoin(source, license);
	// Welcome screen
	// Intro to server
};

setTimeout(() => {
	NW.Functions.SavePlayers();
}, 300000);
