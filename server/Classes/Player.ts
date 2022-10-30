import * as config from "../../config.json";
import { Character } from "./Character";
import { PlayerDataObject, PlayerDBObject, JSONValue, CharacterDataObject } from "../../types";
import { UpdatePlayerDataClient, UpdateCharacterDataClient } from "../functions";

export class Player {
	private _source!: number;
	private _license!: string;
	private _name!: string;
	private _groups!: string | string[];
	private _firstLogin!: number;
	private _lastLogin!: number;
	private _playTime!: number;
	private _characters: Map<string, Character> = new Map();
	private _currentChar!: Character;
	private _sessionStartTime: number;
	private _settings: Map<string, any> = new Map();

	constructor(source: number, license: string, newPlayer: boolean, data?: PlayerDBObject) {
		this._source = source;
		this._license = license;
		const curTime = new Date().getTime();
		this._sessionStartTime = curTime;
		this.setName(GetPlayerName(source));
		if (!newPlayer && data) {
			this.setGroups(data.groups);
			this.setFirstLogin(data.firstLogin);
			this.setLastLogin(curTime);
			this.setPlayTime(data.playTime);
		} else {
			this.setGroups(config.player.defaultGroup);
			this.setFirstLogin(curTime);
			this.setLastLogin(curTime);
			this.setPlayTime(0);
		}
	}

	public save = (playerLeft?: boolean): void => {
		const previousVal: PlayerDataObject = this.toClientObject();
		const curDate = new Date();
		const curTime = curDate.getTime();
		this._playTime = this._playTime + (curTime - this._sessionStartTime);
		this._sessionStartTime = curTime;
		setImmediate(async () => {
			const affectedRows = global.exports.oxmysql.update_async(
				"UPDATE players SET name = ?, groups = ?, lastLogin = ?, playTime = ?  WHERE license = ? ",
				[this._name, this._groups, curTime, this._playTime, this._license]
			);

			if (!playerLeft) UpdatePlayerDataClient(this._source, "save", "all", this.toClientObject(), previousVal);

			if (affectedRows) console.log(`Player: ${this._name} was saved!`);
		});

		// Save current character aswell
		if (this._currentChar) this._currentChar.save(playerLeft);

			// Save every setting, each setting should implement its own save logic
			this._settings.forEach((setting: any) => {
				setting?.save();
			});
	};

	public toClientObject = (): PlayerDataObject => {
		const obj: PlayerDataObject = {
			source: this._source,
			license: this._license,
			name: this._name,
			groups: this._groups,
			firstLogin: this._firstLogin,
			lastLogin: this._lastLogin,
			playTime: this._playTime,
			character: this._currentChar ? this._currentChar.toClientObject() : undefined,
			sessionStartTime: this._sessionStartTime,
			settings: this._settings
		};

		return obj;
	};

	public toDBObject = (): PlayerDBObject => {
		const obj: PlayerDBObject = {
			license: this._license,
			name: this._name,
			groups: this._groups,
			firstLogin: this._firstLogin,
			lastLogin: this._lastLogin,
			playTime: this._playTime
		};

		return obj;
	};

	public getSource = (): number => this._source;

	public getLicense = (): string => this._license;

	public getName = (): string => this._name;

	public setName = (theName: string, updateClientData?: boolean): void => {
		const previousVal: string = this._name;
		this._name = theName;

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", "name", theName, previousVal);
	};

	public getGroups = (): string | string[] => this._groups;

	public setGroups = (groups: string | string[], updateClientData?: boolean): void => {
		const groupObj: JSONValue = config.player.groups;
		const previousVal: string | string[] = this._groups;

		if (typeof groups === "string") {
			if (groupObj[groups]) {
				this._groups = groups;

				ExecuteCommand(`add_principal player.${this._source} nw.${groups}`);
			}

			else return console.error(`Group ${groups} does not exist!`);
		} else {
			const tempGroups: string[] = [];

			groups.forEach((group: string) => {
				if (groupObj[group]) {
					tempGroups.push(group);

					ExecuteCommand(`add_principal player.${this._source} nw.${group}`);
				}
				else console.error(`Group ${group} does not exist!`);
			});

			if (tempGroups.length === 0) return;

			this._groups = tempGroups;
		}

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", "groups", this._groups, previousVal);
	};

	public addGroups = (groups: string | string[], updateClientData?: boolean): void => {
		const groupObj: JSONValue = config.player.groups;
		const previousVal: string | string[] = this._groups;

		if (typeof groups === "string") {
			if (!groupObj[groups]) return console.error(`Group ${groups} does not exist!`);

			if (typeof this._groups === "string") {
				const currentGroup: string = this._groups;

				this._groups = [currentGroup, groups];

				ExecuteCommand(`add_principal player.${this._source} nw.${groups}`);
			} else {
				this._groups.push(groups);

				ExecuteCommand(`add_principal player.${this._source} nw.${groups}`);
			}
		} else {
			groups.forEach((group: string) => {
				if (groupObj[group]) {
					if (typeof this._groups === "string") {
						const currentGroup: string = this._groups;

						this._groups = [currentGroup, group];

						ExecuteCommand(`add_principal player.${this._source} nw.${group}`);
					} else {
						this._groups.push(group);

						ExecuteCommand(`add_principal player.${this._source} nw.${group}`);
					}
				} else console.error(`Group ${group} does not exist!`);
			});
		}

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", "groups", this._groups, previousVal);
	};

	public removeGroups = (groups: string | string[], updateClientData?: boolean): void => {
		const groupObj: JSONValue = config.player.groups;
		const previousVal: string | string[] = this._groups;

		if (typeof groups === "string") {
			if (!groupObj[groups]) return console.error(`Group ${groups} does not exist!`);

			if (typeof this._groups === "string") this._groups = config.player.defaultGroup;
			else this._groups.filter((group: string) => {
				if (group !== groups) return group;

				ExecuteCommand(`remove_principal player.${this._source} nw.${groups}`);
			});
		} else {
			if (typeof this._groups === "string") {
				ExecuteCommand(`remove_principal player.${this._source} nw.${this._groups}`);

				this._groups = config.player.defaultGroup;
			}
			else {
				groups.forEach((group: string) => {
					if (!groupObj[group]) console.error(`Group ${group} does not exist!`);

					if (Array.isArray(this._groups)) this._groups.filter((_group: string) => {
						if (_group !== group) return _group;

						ExecuteCommand(`remove_principal player.${this._source} nw.${group}`);
					});
				});
			}
		}

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", "groups", this._groups, previousVal);
	};

	public getFirstLogin = (): number => this._firstLogin;

	public setFirstLogin = (login: number, updateClientData?: boolean): void => {
		const previousVal: number = this._firstLogin;
		this._firstLogin = login;

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", "firstLogin", login, previousVal);
	};

	public getLastLogin = (): number => this._lastLogin;

	public setLastLogin = (login: number, updateClientData?: boolean): void => {
		const previousVal: number = this._lastLogin;
		this._lastLogin = login;

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", "lastLogin", login, previousVal);
	};

	public getPlayTime = (): number => this._playTime;

	public setPlayTime = (time: number, updateClientData?: boolean): void => {
		const previousVal: number = this._playTime;
		this._playTime = time;

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", "playTime", time, previousVal);
	};

	public setCharacters = (characters: Character[], updateClientData?: boolean): void => {
		if (!characters) return;
		const previousVal: Map<string, Character> = this._characters;
		characters.map((character) => this._characters.set(character.getCitizenId(), character));

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", "characters", this._characters, previousVal);
	};

	public setCharacter = (character: Character, updateClientData?: boolean): void => {
		const previousVal: Character | undefined = this._characters.get(character.getCitizenId());
		this._characters.set(character.getCitizenId(), character);

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", "character", character, previousVal);
	};

	public getCharacter = (citizenId: string): Character | undefined  => this._characters.get(citizenId);

	public switchCharacter = (citizenId: string, updateClientData?: boolean): void => {
		const previousVal: CharacterDataObject = this._currentChar.toClientObject();
		this._currentChar.save();

		const newChar: Character | undefined = this.getCharacter(citizenId);
		if (!newChar) return;

		this.setCurrentCharacter(newChar);

		if (updateClientData) {
			UpdatePlayerDataClient(this._source, "switch", "character", newChar.toClientObject(), previousVal);
			UpdateCharacterDataClient(this._source, this._currentChar.getCitizenId(), "switch", "character", newChar.toClientObject(), previousVal);
		}

		// Do some camera stuff to make switching characters look cool
	};

	private _extraTables: {[key: string]: string} = { // extra tables to delete the player from

	};

	private _npwdTables: {[key: string]: string} = { // tables from npwd to delete the player from
		"npwd_calls": "identifier",
		"npwd_marketplace_listings": "identifier",
		"npwd_match_profiles": "identifier",
		"npwd_match_views": "identifier",
		"npwd_messages": "user_identifier",
		"npwd_notes": "identifier",
		"npwd_phone_contacts": "identifier",
		"npwd_phone_gallery": "identifier",
		"npwd_twitter_profiles": "identifier",
		"npwd_twitter_tweets": "identifier"
	};

	public deleteCharacter = (citizenId: string): void => {
		console.log(`Delete character ${citizenId} from player ${this._name}`);

		this._characters.delete(citizenId);

		global.exports.oxmysql.query("DELETE FROM characters WHERE citizenId = ?", [citizenId], () => {
			console.log(`Player: ${this._name} deleted a character!`);
		});

		if (Object.keys(this._extraTables).length > 0) {
			for (const table in this._extraTables) {
				global.exports.oxmysql.query(`DELETE FROM ${table} WHERE ${this._extraTables[table]} = ?`, [citizenId]);
			};
		}

		if (config.characters.phone === "npwd") {
			for (const table in this._npwdTables) {
				global.exports.oxmysql.query(`DELETE FROM ${table} WHERE ${this._npwdTables[table]} = ?`, [citizenId]);
			};
		}
	};

	public getCurrentCharacter = (): Character => this._currentChar;

	public setCurrentCharacter = (char: Character | string, updateClientData?: boolean): void => {
		if (char instanceof Character) {
			const previousVal: CharacterDataObject | null = this._currentChar?.toClientObject();
			this._currentChar = char;
			char.loadInventory();
			char.loadPhone();

			if (updateClientData) {
				UpdatePlayerDataClient(this._source, "switch", "character", char.toClientObject(), previousVal);
				UpdateCharacterDataClient(this._source, this._currentChar.getCitizenId(), "switch", "character", char.toClientObject(), previousVal);
			}

			return;
		}

		const newChar: Character | undefined = this._characters.get(char);

		if (!newChar) return;

		const previousVal: CharacterDataObject | null = this._currentChar?.toClientObject();
		this._currentChar = newChar;
		newChar.loadInventory();
		newChar.loadPhone();

		if (updateClientData) {
			UpdatePlayerDataClient(this._source, "switch", "character", newChar.toClientObject(), previousVal);
			UpdateCharacterDataClient(this._source, this._currentChar.getCitizenId(), "switch", "character", newChar.toClientObject(), previousVal);
		}
	};

	public getSessionStartTime = (): number => this._sessionStartTime;

	public setSessionStartTime = (time: number, updateClientData?: boolean): void => {
		const previousVal: number = this._sessionStartTime;
		this._sessionStartTime = time;

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", "sessionStartTime", time, previousVal);
	};

	public getSetting = (key: string): any => this._settings.get(key);

	public setSetting = (key: string, value: any, updateClientData?: boolean): void => {
		const previousVal: any = this._settings.get(key);
		this._settings.set(key, value);

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", `setting_${key}`, value, previousVal);
	};

	public removeSetting = (key: string, updateClientData?: boolean): void => {
		const previousVal: any = this._settings.get(key);
		this._settings.delete(key);

		if (updateClientData) UpdatePlayerDataClient(this._source, "update", `setting_${key}`, null, previousVal);
	};
}