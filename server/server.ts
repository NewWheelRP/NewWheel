interface NW {
	Players: Map<number, PlayerClass>;
}

export const NW: NW = {
	Players: new Map<number, PlayerClass>(),
};

import { Character, CharacterDBObject } from "./Classes/Character";
import { Player as PlayerClass, PlayerDBObject } from "./Classes/Player";
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
		(result: PlayerDBObject) => {
			if (!result) {
				firstJoin(src, license);
				return;
			}
			const player = PlayerClass.load(src, result);
			NW.Players.set(src, player);
			loadCharacters(src, license);
		}
	);
	Player(src).state.set("playerDataUpdatedAt", 0, true);
});

const loadCharacters = (source: number, license: string) => {
	global.exports.oxmysql.query(
		"SELECT * FROM characters WHERE license = ?",
		[license],
		(result: CharacterDBObject[]) => {
			sendCharacters(source, license, result);
		}
	);
};

export const sendCharacters = (source: number, license: string, result?: CharacterDBObject[]) => {
	const player = NW.Players.get(source);
	const chars: Character[] = [];

	if (!player) return;

	const newChars: any = [];
	if (result) {
		result.forEach((v: CharacterDBObject) => {
			const char = Character.load(source, license, v);
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