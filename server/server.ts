interface NW {
	Players: Map<number, Player>;
}

export const NW: NW = {
	Players: new Map<number, Player>(),
};

import { Character } from "./Classes/Character";
import { Player } from "./Classes/Player";
import { getLicense } from "./utils";
import { GetPlayerFromSource, SavePlayer, SavePlayers, OnFirstJoin } from "./functions";
import "./listeners";
import "./connecting";
import "./functions";

onNet("NW:LogoutPlayer", () => {
	const player = GetPlayerFromSource(global.source);
	if (!player) return;
	SavePlayer(player);
	emitNet("NW:PlayerLogout", global.source);
	loadCharacters(global.source, player.getLicense());
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
				firstJoin(src, license);
				return;
			}
			const player = Player.Load(src, result);
			NW.Players.set(src, player);
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
	const player = NW.Players.get(source);
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

const firstJoin = (source: number, license: string) => {
	// Create player
	OnFirstJoin(source, license);
	// Welcome screen
	// Intro to server
};

setTimeout(() => {
	SavePlayers();
}, 300000);
