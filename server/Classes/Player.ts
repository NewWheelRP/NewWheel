import * as config from "../../config.json";
import { Character } from "./Character";
import { PlayerDataObject, PlayerDBObject } from "../../types";

export class Player {
	private _source!: number;
	private _license!: string;
	private _name!: string;
	private _groups!: string | string[];
	private _loggedIn: boolean = false;
	private _firstLogin!: number;
	private _lastLogin!: number;
	private _playTime!: number;
	private _characters: Map<string, Character> = new Map();
	private _currentChar!: Character;
	private _sessionStartTime: number;
	private _settings: Map<string, any> = new Map();

	constructor(source: number, license: string) {
		this._source = source;
		this._license = license;
		const curDate = new Date();
		this._sessionStartTime = curDate.getTime();
	}

	static load(source: number, data: PlayerDBObject): Player {
		const player = new Player(source, data.license);
		player.setName(GetPlayerName(source));
		player.setGroups(data.groups);
		player.setLoggedIn(true);
		player.setFirstLogin(data.firstLogin);
		player.setLastLogin(data.lastLogin);
		player.setPlayTime(data.playTime);
		return player;
	}

	static new(source: number, license: string): Player {
		const player = new Player(source, license);
		player.setName(GetPlayerName(source));
		player.setGroups(config.player.defaultGroup);
		player.setLoggedIn(true);
		const curDate = new Date();
		player.setFirstLogin(curDate.getTime());
		player.setLastLogin(curDate.getTime());
		player.setPlayTime(0);
		return player;
	}

	public save = (): void => {
		const curDate = new Date();
		const curTime = curDate.getTime();
		this._playTime = this._playTime + (curTime - this._sessionStartTime);
		this._sessionStartTime = curTime;
		setImmediate(async () => {
			const affectedRows = global.exports.oxmysql.update_async(
				"UPDATE players SET name = ?, groups = ?, lastLogin = ?, playTime = ?  WHERE license = ? ",
				[this._name, this._groups, curTime, this._playTime, this._license]
			);
			if (affectedRows) console.log(`Player: ${this._name} was saved!`);
		});

		// Save current character aswell
		if (this._currentChar) this._currentChar.save();
	};

	public toClientObject = (): PlayerDataObject => {
		const obj: PlayerDataObject = {
			source: this._source,
			license: this._license,
			name: this._name,
			groups: this._groups,
			loggedIn: this._loggedIn,
			firstLogin: this._firstLogin,
			lastLogin: this._lastLogin,
			playTime: this._playTime,
			character: this._currentChar.toClientObject(),
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

	public setName = (theName: string): void => {
		this._name = theName;
	};

	public getGroups = (): string | string[] => this._groups;

	public setGroups = (groups: string | string[]): void => {
		const groupObj: any = config.player.groups; // workaround for error of indexing it directly

		if (typeof groups === "string") {
			if (groupObj[groups]) {
				this._groups = groups;

				ExecuteCommand(`add_principal identifier.${this._license} nw.${groups}`);
			}

			else return console.error(`Group ${groups} does not exist!`);
		} else {
			const tempGroups: string[] = [];

			groups.forEach((group: string) => {
				if (groupObj[group]) {
					tempGroups.push(group);

					ExecuteCommand(`add_principal identifier.${this._license} nw.${group}`);
				}
				else console.error(`Group ${group} does not exist!`);
			});

			if (tempGroups.length === 0) return;

			this._groups = tempGroups;
		}
	};

	public addGroups = (groups: string | string[]): void => {
		const groupObj: any = config.player.groups; // workaround for error of indexing it directly

		if (typeof groups === "string") {
			if (!groupObj[groups]) return console.error(`Group ${groups} does not exist!`);

			if (typeof this._groups === "string") {
				const currentGroup: string = this._groups;

				this._groups = [currentGroup, groups];

				ExecuteCommand(`add_principal identifier.${this._license} nw.${groups}`);
			} else {
				this._groups.push(groups);

				ExecuteCommand(`add_principal identifier.${this._license} nw.${groups}`);
			}
		} else {
			groups.forEach((group: string) => {
				if (groupObj[group]) {
					if (typeof this._groups === "string") {
						const currentGroup: string = this._groups;

						this._groups = [currentGroup, group];

						ExecuteCommand(`add_principal identifier.${this._license} nw.${group}`);
					} else {
						this._groups.push(group);

						ExecuteCommand(`add_principal identifier.${this._license} nw.${group}`);
					}
				} else console.error(`Group ${group} does not exist!`);
			});
		}
	};

	public removeGroups = (groups: string | string[]): void => {
		const groupObj: any = config.player.groups; // workaround for error of indexing it directly
		if (typeof groups === "string") {
			if (!groupObj[groups]) return console.error(`Group ${groups} does not exist!`);

			if (typeof this._groups === "string") this._groups = config.player.defaultGroup;
			else this._groups.filter((group: string) => {
				if (group !== groups) return group;

				ExecuteCommand(`remove_principal identifier.${this._license} nw.${groups}`);
			});
		} else {
			if (typeof this._groups === "string") {
				ExecuteCommand(`remove_principal identifier.${this._license} nw.${this._groups}`);

				this._groups = config.player.defaultGroup;
			}
			else {
				groups.forEach((group: string) => {
					if (!groupObj[group]) console.error(`Group ${group} does not exist!`);

					if (Array.isArray(this._groups)) this._groups.filter((_group: string) => {
						if (_group !== group) return _group;

						ExecuteCommand(`remove_principal identifier.${this._license} nw.${group}`);
					});
				});
			}
		}
	};

	public getLoggedIn = (): boolean => this._loggedIn;

	public setLoggedIn = (value: boolean): void => {
		this._loggedIn = value;
	};

	public getFirstLogin = (): number => this._firstLogin;

	public setFirstLogin = (login: number): void => {
		this._firstLogin = login;
	};

	public getLastLogin = (): number => this._lastLogin;

	public setLastLogin = (login: number): void => {
		this._lastLogin = login;
	};

	public getPlayTime = (): number => this._playTime;

	public setPlayTime = (time: number): void => {
		this._playTime = time;
	};

	public setCharacters = (characters: Character[]): void => {
		if (!characters) return;
		characters.map((character) => this._characters.set(character.getCitizenId(), character));
	};

	public setCharacter = (character: Character): void => {
		this._characters.set(character.getCitizenId(), character);
	};

	public getCharacter = (citizenId: string): Character | undefined  => this._characters.get(citizenId);

	public switchCharacter = (citizenId: string): void => {
		this._currentChar.save();

		const newChar: Character | undefined = this.getCharacter(citizenId);
		if (!newChar) return;

		this.setCharacter(newChar);

		// Do some camera stuff to make switching characters look cool
	};

	public deleteCharacter = (citizenId: string): void => {
		console.log(`Delete character ${citizenId} from player ${this._name}`);

		this._characters.delete(citizenId);

		global.exports.oxmysql.query("DELETE FROM characters WHERE citizenId = ?", [citizenId], () => {
			console.log(`Player: ${this._name} deleted a character!`);
		});
	};

	public getCurrentCharacter = (): Character => this._currentChar;

	public setCurrentCharacter = (char: Character | string): void => {
		if (char instanceof Character) {
			this._currentChar = char;
			char.loadInventory();
			char.loadPhone();
			return;
		}

		const newChar = this._characters.get(char);

		if (!newChar) return;

		this._currentChar = newChar;
		newChar.loadInventory();
		newChar.loadPhone();
	};

	public getSessionStartTime = (): number => this._sessionStartTime;

	public setSessionStartTime = (time: number): void => {
		this._sessionStartTime = time;
	};

	public getSetting = (key: string): any => this._settings.get(key);

	public setSetting = (key: string, value: any): void => {
		this._settings.set(key, value);
	};
}