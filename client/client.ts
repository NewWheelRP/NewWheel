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
		coords: new Vector4(config.characters.defaultCoords.x, config.characters.defaultCoords.y, config.characters.defaultCoords.z, config.characters.defaultCoords.w),
	}
};

import "./functions";
import "./world";
import "./commands";
import "./nui";
import "./listeners";
import * as config from "./../config.json";
import { Vector4 } from "@nativewrappers/client";
import { joaat, Delay } from "../shared/utils";

let joined: boolean = false;
let spawning: boolean = false;
let diedAt: number = -1;
let forceRespawn: boolean = false;
const defaultPedHash: number = joaat(config.characters.defaultPed);
let spawnCoords: Vector4 = new Vector4(config.characters.defaultCoords.x, config.characters.defaultCoords.y, config.characters.defaultCoords.z, config.characters.defaultCoords.w);
export const playerId: number = PlayerId();

export const setSpawnCoords = (coords: Vector4) => {
	spawnCoords = coords;
};

export const setForceRespawn = (respawn: boolean) => {
	forceRespawn = respawn;
};

// casually borrowing from spawnmanager
setInterval(async () => {
	let playerPed: number = PlayerPedId();
	if (!joined && NetworkIsPlayerActive(playerId)) {
		joined = true;
		DoScreenFadeOut(0);
		emitNet("NW:PlayerJoined");
	} else if (joined) {
		if ((diedAt !== -1 && Math.abs(GetGameTimer() - diedAt) > 2000 && !spawning) || forceRespawn) {
			forceRespawn = false;
			spawning = true;
			DoScreenFadeOut(500);
			while (!IsScreenFadedOut()) {
				await Delay(0);
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
			while (!HasModelLoaded(defaultPedHash)) {
				await Delay(0);
			}

			SetPlayerModel(playerId, defaultPedHash);
			SetModelAsNoLongerNeeded(defaultPedHash);
			RequestCollisionAtCoord(spawnCoords.x, spawnCoords.y, spawnCoords.z);

			playerPed = PlayerPedId();

			SetEntityCoords(playerPed, spawnCoords.x, spawnCoords.y, spawnCoords.z, false, false, false, true);
			NetworkResurrectLocalPlayer(spawnCoords.x, spawnCoords.y, spawnCoords.z, spawnCoords.w, true, true);
			ClearPedTasksImmediately(playerPed);
			RemoveAllPedWeapons(playerPed, true);
			ClearPlayerWantedLevel(playerId);

			const time = GetGameTimer();
			while (!HasCollisionLoadedAroundEntity(playerPed) && GetGameTimer() - time < 5000) {
				await Delay(0);
			}

			ShutdownLoadingScreen();
			ShutdownLoadingScreenNui();
			if (IsScreenFadedOut()) {
				DoScreenFadeIn(500);
				while (!IsScreenFadedIn()) {
					await Delay(0);
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

export default NW;