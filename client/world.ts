import config from "../config.json";

setImmediate(() =>{
	const playerPed: number = PlayerPedId();
	if (config.world.disableWantedLevel) {
		ClearPlayerWantedLevel(playerPed);
		SetMaxWantedLevel(0);
	}

	if (config.world.enablePvP) {
		SetCanAttackFriendly(playerPed, true, false);
		NetworkSetFriendlyFireOption(true);
	}

	if (config.world.calmAI) {
		SetRelationshipBetweenGroups(1, GetHashKey("AMBIENT_GANG_HILLBILLY"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("AMBIENT_GANG_BALLAS"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("AMBIENT_GANG_MEXICAN"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("AMBIENT_GANG_FAMILY"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("AMBIENT_GANG_MARABUNTE"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("AMBIENT_GANG_SALVA"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("GANG_1"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("GANG_2"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("GANG_9"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("GANG_10"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("FIREMAN"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("MEDIC"), GetHashKey("PLAYER"));
		SetRelationshipBetweenGroups(1, GetHashKey("COP"), GetHashKey("PLAYER"));
	}

	if (config.world.disableDistantSirens) DistantCopCarSirens(!config.world.disableDistantSirens);
});