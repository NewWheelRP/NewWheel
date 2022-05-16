import { PlayerDataObject, CharacterDataObject } from "../types";

interface NW {
	PlayerData: PlayerDataObject,
	CharacterData: CharacterDataObject
}

// This consists of placeholders until the player has been created
const NW: NW = {
	PlayerData: {
		source: -1,
		license: "placeholderLicense",
		name: "placeholderName",
		groups: "placeholderGroup",
		loggedIn: false,
		firstLogin: -1,
		lastLogin: -1,
		playTime: -1,
		sessionStartTime: -1,
	},
	CharacterData: {
		source: -1,
		license: "placeholderLicense",
		firstName: "placeholderFirstName",
		lastName: "placeholderLastName",
		coords: undefined,
	}
};

import "./functions";
import "./world";
import "./commands";
import "./nui";
import "./listeners";
import * as config from "./../config.json";
import { Game } from "@nativewrappers/client";
import { SaveCoords } from "./functions";

const playerJoiningTimeout = setTimeout(() => {
	if (NetworkIsPlayerActive(Game.Player.Handle)) {
		global.exports.spawnmanager.setAutoSpawn(true);
		DoScreenFadeOut(0);
		emitNet("NW:PlayerJoined");
		clearTimeout(playerJoiningTimeout);
	}
}, 500);

setTimeout(() => {
	SaveCoords();
}, config.characters.coordsSaveTimeout);

export default NW;