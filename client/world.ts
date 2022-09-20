import config from "../config.json";
import { joaat } from "../shared/utils";

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
		SetRelationshipBetweenGroups(1, joaat("AMBIENT_GANG_HILLBILLY"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("AMBIENT_GANG_BALLAS"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("AMBIENT_GANG_MEXICAN"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("AMBIENT_GANG_FAMILY"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("AMBIENT_GANG_MARABUNTE"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("AMBIENT_GANG_SALVA"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("GANG_1"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("GANG_2"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("GANG_9"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("GANG_10"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("FIREMAN"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("MEDIC"), joaat("PLAYER"));
		SetRelationshipBetweenGroups(1, joaat("COP"), joaat("PLAYER"));
	}

	if (config.world.disableDistantSirens) DistantCopCarSirens(!config.world.disableDistantSirens);
});