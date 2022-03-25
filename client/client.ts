interface NW {
	Functions: any;
	PlayerData: any;
}

export let NW: NW = {
	Functions: undefined!,
	PlayerData: {},
};

import "./functions";
import "./world";
import "./commands";
import "./nui";
import "./listeners";

const playerJoiningTimeout = setTimeout(() => {
	if (NetworkIsPlayerActive(PlayerId())) {
		global.exports.spawnmanager.setAutoSpawn(true);
		DoScreenFadeOut(0);
		emitNet("NW:PlayerJoined");
		clearTimeout(playerJoiningTimeout);
	}
}, 500);

setTimeout(() => {
	NW.Functions.SaveCoords();
}, 120000);