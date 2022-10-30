interface NW {
	Players: Map<number, Player>;
};

const NW: NW = {
	Players: new Map<number, Player>(),
};

import { Character } from "./Classes/Character";
import { Player } from "./Classes/Player";
import { getLicense } from "./utils";
import { GetPlayerFromSource, SavePlayer, SavePlayers, OnFirstJoin, SaveCoords } from "./functions";
import "./listeners";
import "./connecting";
import "./functions";
import { CharacterDataObject, PlayerDBObject, CharacterDBObject } from "../types";
import * as config from "../config.json";
import { Vector4 } from "@nativewrappers/client";

// because why not
if (GetResourceState("spawnmanager") !== "missing" || GetResourceState("spawnmanager") !== "stopped" || GetResourceState("spawnmanager") !== "stopping") {
	StopResource("spawnmanager");
}

onNet("NW:LogoutPlayer", () => {
	const player: Player | undefined = GetPlayerFromSource(global.source);
	if (!player) return;
	player.getCurrentCharacter().setLoggedIn(false); // No need to update the client here already as the next line does that already
	SavePlayer(player);
	emitNet("NW:PlayerLogout", global.source, player.toClientObject());
	emit("NW:PlayerLogout", global.source, player.toClientObject);
	loadCharacters(global.source, player.getLicense());
});

onNet("NW:PlayerJoined", () => {
	const src: number = global.source;
	const license: string | undefined = getLicense(src);
	if (!license) return;
	global.exports.oxmysql.single(
		"SELECT * FROM players WHERE license = ?",
		[license],
		(result: PlayerDBObject) => {
			if (!result) {
				firstJoin(src, license);
				return;
			}
			const player: Player = new Player(src, license, false, result);
			NW.Players.set(src, player);

			loadCharacters(src, license);
		}
	);
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
	const player: Player | undefined = NW.Players.get(source);
	const chars: Character[] = [];

	if (!player) return;

	const newChars: CharacterDataObject[] = [];
	if (result) {
		result.forEach((v: CharacterDBObject) => {
			const char = new Character(source, license, false, v);
			newChars.push(char.toClientObject());
			chars.push(char);
		});

		player.setCharacters(chars);
	}
	emitNet("NW:ShowCharacterSelection", source, newChars);
};

const firstJoin = (source: number, license: string) => {
	OnFirstJoin(source, license);
	// Welcome screen
	// Intro to server
};

setInterval(() => {
	SavePlayers();
}, 300000);

setInterval(() => {
	NW.Players.forEach((player: Player, source: number) => {
		const ped: number = GetPlayerPed(source.toString());
		const coords: number[] = GetEntityCoords(ped);
		const heading: number = GetEntityHeading(ped);
		SaveCoords(player, new Vector4(coords[0], coords[1], coords[2], heading));
	});
}, config.characters.coordsSaveTimeout);

export default NW;