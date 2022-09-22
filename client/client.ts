import { PlayerDataObject, CharacterDataObject } from "../types";

interface NW {
	PlayerData: PlayerDataObject,
	CharacterData: CharacterDataObject
};

// This consists of placeholders until the player has been created
const NW: NW = {
	PlayerData: {
		source: -1,
		license: "placeholderLicense",
		name: "placeholderName",
		groups: "placeholderGroup",
		firstLogin: -1,
		lastLogin: -1,
		playTime: -1,
		sessionStartTime: -1,
	},
	CharacterData: {
		source: -1,
		license: "placeholderLicense",
		loggedIn: false,
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
import { Vector4 } from "@nativewrappers/client";
import { SaveCoords } from "./functions";
import { joaat } from "../shared/utils";

let joined: boolean = false;
let spawning: boolean = false;
let diedAt: number = -1;
const defaultPedHash: number = joaat(config.characters.defaultPed);
const defaultCoords: Vector4 = new Vector4(config.characters.defaultCoords.x, config.characters.defaultCoords.y, config.characters.defaultCoords.z, config.characters.defaultCoords.w);
export const playerId: number = PlayerId();

// casually borrowing from spawnmanager
setInterval(() => {
	let playerPed: number = PlayerPedId();
	if (!joined && NetworkIsPlayerActive(playerId)) {
		joined = true;
		DoScreenFadeOut(0);
		emitNet("NW:PlayerJoined");
	} else if (joined) {
		if (diedAt !== -1 && Math.abs(GetGameTimer() - diedAt) > 2000 && !spawning) {
			spawning = true;
			DoScreenFadeOut(500);
			while (true) {
				if (IsScreenFadedOut()) break;
			}

			SetPlayerControl(playerId, false, 0);
			if (IsEntityVisible(playerPed)) {
				SetEntityVisible(playerPed, false, false);
			}

			SetEntityCollision(playerPed, false, false);
			FreezeEntityPosition(playerPed, true);
			SetPlayerInvincible(playerId, true);

			if (!IsPedFatallyInjured(playerPed)) {
				ClearPedTasksImmediately(playerPed);
			}

			RequestModel(defaultPedHash);
			while (true) {
				if (HasModelLoaded(defaultPedHash)) break;
			}

			SetPlayerModel(playerId, defaultPedHash);
			SetModelAsNoLongerNeeded(defaultPedHash);
			RequestCollisionAtCoord(defaultCoords.x, defaultCoords.y, defaultCoords.z);

			playerPed = PlayerPedId();

			SetEntityCoords(playerPed, defaultCoords.x, defaultCoords.y, defaultCoords.z, false, false, false, true);
			NetworkResurrectLocalPlayer(defaultCoords.x, defaultCoords.y, defaultCoords.z, defaultCoords.w, true, true);
			ClearPedTasksImmediately(playerPed);
			RemoveAllPedWeapons(playerPed, true);
			ClearPlayerWantedLevel(playerId);

			const time = GetGameTimer();
			while (true) {
				if (HasCollisionLoadedAroundEntity(playerPed) || GetGameTimer() - time > 5000) break;
			}

			ShutdownLoadingScreen();
			ShutdownLoadingScreenNui();
			if (IsScreenFadedOut()) {
				DoScreenFadeIn(500);
				while (true) {
					if (IsScreenFadedIn()) break;
				}
			}

			SetPlayerControl(playerId, true, 0);
			if (!IsEntityVisible(playerPed)) {
				SetEntityVisible(playerPed, true, false);
			}

			if (!IsPedInAnyVehicle(playerPed, false)) {
				SetEntityCollision(playerPed, true, false);
			}

			FreezeEntityPosition(playerPed, false);
			SetPlayerInvincible(playerId, false);

			if (!IsPedFatallyInjured(playerPed)) {
				ClearPedTasksImmediately(playerPed);
			}

			emit("playerSpawned");
			spawning = false;
		}

		if (IsEntityDead(playerPed)) {
			if (diedAt === -1) {
				diedAt = GetGameTimer();
			}
		} else {
			diedAt = -1;
		}
	}
}, 500);

setInterval(() => {
	SaveCoords();
}, config.characters.coordsSaveTimeout);

export default NW;