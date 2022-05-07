import * as config from "../../config.json";
import { Character } from "./Character";
import { PlayerDataObject } from "../../types";

interface PlayerDBObject {
	license: string;
	name: string;
	group: string;
	firstLogin: number;
	lastLogin: number;
	playTime: number;
}

export class Player {
	private _source!: number;
	private _license!: string;
	private _name!: string;
	private _group!: string;
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

	public toClientObject = () => {
		const obj: PlayerDataObject = {
			source: this._source,
			license: this._license,
			name: this._name,
			group: this._group,
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

	static load(source: number, data: PlayerDBObject): Player {
		const player = new Player(source, data.license);
		player.setName(GetPlayerName(source));
		player.setGroup(data.group);
		player.setLoggedIn(true);
		player.setFirstLogin(data.firstLogin);
		player.setLastLogin(data.lastLogin);
		player.setPlayTime(data.playTime);
		return player;
	}

	static new(source: number, license: string): Player {
		const player = new Player(source, license);
		player.setName(GetPlayerName(source));
		player.setGroup(config.player.defaultGroup);
		player.setLoggedIn(true);
		const curDate = new Date();
		player.setFirstLogin(curDate.getTime());
		player.setLastLogin(curDate.getTime());
		player.setPlayTime(0);
		const groupObject: any = config.player.groups; // workaround for error of indexing it directly
		if (
			IsPlayerAceAllowed(source.toString(), "command")
		)
			player.setGroup(groupObject[Object.keys(config.player.groups).length - 1]);
		return player;
	}

	public save = () => {
		const curDate = new Date();
		const curTime = curDate.getTime();
		this._playTime = this._playTime + (curTime - this._sessionStartTime);
		this._sessionStartTime = curTime;
		setImmediate(async () => {
			const affectedRows = global.exports.oxmysql.update_async(
				"UPDATE players SET name = ?, group = ?, lastLogin = ?, playTime = ?  WHERE license = ? ",
				[this._name, this._group, curTime, this._playTime, this._license]
			);
			if (affectedRows) console.log(`Player: ${this._name} was saved!`);
		});

		// Save current character aswell
		if (this._currentChar) this._currentChar.save();
	};

	public getSource = () => this._source;;

	public getLicense = () => this._license;

	public getName = () => this._name;

	public setName = (theName: string) => {
		this._name = theName;
	};

	public getGroup = () => this._group;

	public setGroup = (group: string) => {
		const groups: any = config.player.groups; // workaround for error of indexing it directly
		if (!groups[group]) return;
		this._group = group;
	};

	public getLoggedIn = () => this._loggedIn;

	public setLoggedIn = (value: boolean) => {
		this._loggedIn = value;
	};

	public getFirstLogin = () => this._firstLogin;

	public setFirstLogin = (login: number) => {
		this._firstLogin = login;
	};

	public getLastLogin = () => this._lastLogin;

	public setLastLogin = (login: number) => {
		this._lastLogin = login;
	};

	public getPlayTime = () => this._playTime;

	public setPlayTime = (time: number) => {
		this._playTime = time;
	};

	public setCharacters = (characters: Character[]) => {
		if (!characters) return;
		characters.map((character) => this._characters.set(character.getCitizenId(), character));
	};

	public setCharacter = (character: Character) => {
		this._characters.set(character.getCitizenId(), character);
	};

	public getCharacter = (citizenId: string) => this._characters.get(citizenId);

	public switchCharacter = (citizenId: string) => {
		this._currentChar.save();

		// handle the switch
	};

	public deleteCharacter = (citizenId: string) => {
		console.error("DELETING");
		this._characters.delete(citizenId);

		global.exports.oxmysql.query("DELETE FROM characters WHERE citizenId = ?", [citizenId], () => {
			console.log(`Player: ${this._name} deleted a character!`);
		});
	};

	public getCurrentCharacter = () => this._currentChar;

	public setCurrentCharacter = (char: Character | string) => {
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

	public setSessionStartTime = (time: number) => {
		this._sessionStartTime = time;
	};

	public getSessionStartTime = () => this._sessionStartTime;

	public setSetting = (key: string, value: any) => {
		this._settings.set(key, value);
	};

	public getSetting = (key: string) => this._settings.get(key);
}