interface NW {
	PlayerData: any;
}

export const NW: NW = {
	PlayerData: {},
};

import "./functions";
import "./world";
import "./commands";
import "./nui";
import "./listeners";
import * as config from "./../config.json";
import { SaveCoords } from "./functions";

const playerJoiningTimeout = setTimeout(() => {
	if (NetworkIsPlayerActive(PlayerId())) {
		global.exports.spawnmanager.setAutoSpawn(true);
		DoScreenFadeOut(0);
		emitNet("NW:PlayerJoined");
		clearTimeout(playerJoiningTimeout);
	}
}, 500);

setTimeout(() => {
	SaveCoords();
}, config.characters.coordsSaveTimeout);