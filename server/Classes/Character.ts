import { CharacterDataObject, CharacterNewObject, CharacterDBObject } from "../../types";
import { Vector4 } from "@nativewrappers/client";
import config from "../../config.json";
import { SaveCoords, UpdateCharacterDataClient } from "../functions";
import { generateUUIDv4 } from "../utils";
import NW from "../server";

export class Character {
	private static defaultCoords: Vector4 = new Vector4(config.characters.defaultCoords.x, config.characters.defaultCoords.y, config.characters.defaultCoords.z, config.characters.defaultCoords.w);
	private _source!: number;
	private _license!: string;
	private _loggedIn: boolean = false;
	private _firstName: string = "";
	private _lastName: string = "";
	private _coords: Vector4 = Character.defaultCoords;
	private _citizenId: string = "";
	private _DOB: number = 0;
	private _height: number = 0;
	private _sex: string = "";
	private _nationality: string = "";
	private _backstory: string = "";
	private _phoneNumber: number = 0;
	private _bank: number = 0;
	private _customObjects: Map<string, any> = new Map();

	constructor(source: number, license: string, newChar: boolean, data: CharacterDBObject | CharacterNewObject) {
		this._source = source;
		this._license = license;
		this.setFirstName(data.firstName);
		this.setLastName(data.lastName);
		// @ts-ignore
		const coords = data.coords ? JSON.parse(data.coords) : null;
		this.setCoords(newChar ? Character.defaultCoords : new Vector4(coords?.x || Character.defaultCoords.x, coords?.y || Character.defaultCoords.y, coords?.z || Character.defaultCoords.z, coords?.w || Character.defaultCoords.w));
		if (newChar) {
			this.setCitizenId(generateUUIDv4());
			if (data.dob) this.setDOB(new Date(data.dob).getTime());
			if (data.height) this.setHeight(data.height);
			if (data.sex) this.setSex(data.sex);
			if (data.nationality) this.setNationality(data.nationality);
			if (data.backstory) this.setBackstory(data.backstory);
			setImmediate(async () => {
				this.setPhoneNumber(await global.exports.npwd.generatePhoneNumber());
				global.exports.oxmysql.insert(
					"INSERT INTO characters (citizenId, license, firstName, lastName, dob, height, sex, bank, nationality, backstory, coords, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
					[
						this.getCitizenId(),
						license,
						data.firstName,
						data.lastName,
						this.getDOB(),
						this.getHeight(),
						this.getSex(),
						this.getBank(),
						this.getNationality(),
						this.getBackstory(),
						JSON.stringify(Character.defaultCoords),
						this.getPhoneNumber(),
					]
				);
			});
		} else {
			// @ts-ignore
			if (data.citizenId) this.setCitizenId(data.citizenId);
			if (data.dob) this.setDOB(data.dob);
			if (data.height) this.setHeight(data.height);
			if (data.sex) this.setSex(data.sex);
			if (data.nationality) this.setNationality(data.nationality);
			if (data.backstory) this.setBackstory(data.backstory);
			// @ts-ignore
			if (data.phone_number) this.setPhoneNumber(data.phone_number);
			// @ts-ignore
			if (data.bank) this.setBank(data.bank);
		}
		this.setLoggedIn(true);
	}

	public save = (playerLeft?: boolean, newPlayer?: boolean): void => {
		const inventory = global.exports.ox_inventory.Inventory(this._source);
		if (!newPlayer) {
			const ped: number = GetPlayerPed(this._source);
			const coords: number[] = GetEntityCoords(ped);
			const heading: number = GetEntityHeading(ped);
			SaveCoords(this._source, new Vector4(coords[0], coords[1], coords[2], heading));
		}

		setImmediate(async () => {
			const affectedRows = await global.exports.oxmysql.update_async(
				"UPDATE characters SET firstName = ?, lastName = ?, dob = ?, height = ?, sex = ?, bank = ?, nationality = ?, backstory = ?, coords = ?, inventory = ?, phoneNumber = ? WHERE citizenId = ?",
				[
					this._firstName,
					this._lastName,
					this._DOB,
					this._height,
					this._sex,
					this._bank,
					this._nationality,
					this._backstory,
					JSON.stringify(this._coords),
					JSON.stringify(inventory.items) || "{}",
					this._phoneNumber,
					this._citizenId,
				]
			);

			if (!playerLeft) UpdateCharacterDataClient(this._source, this._citizenId, "save", "all", this.toClientObject());

			if (affectedRows) console.log(`[id: ${this._source}] Character: ${this._firstName} ${this._lastName} was saved!`);
		});

		// Save every custom object, each custom object should implement its own save logic
		this._customObjects.forEach((obj: any) => {
			obj?.save();
		});
	};

	public toClientObject = (): CharacterDataObject => {
		const obj: CharacterDataObject = {
			source: this._source,
			license: this._license,
			loggedIn: this._loggedIn,
			citizenId: this._citizenId,
			firstName: this._firstName,
			lastName: this._lastName,
			dob: this._DOB,
			height: this._height,
			sex: this._sex,
			nationality: this._nationality,
			backstory: this._backstory,
			coords: this._coords,
			customObjects: this._customObjects
		};

		return obj;
	};

	public toDBObject = (): CharacterDBObject => {
		const obj: CharacterDBObject = {
			source: this._source,
			license: this._license,
			firstName: this._firstName,
			lastName: this._lastName,
			coords: JSON.stringify(this._coords),
			citizenId: this._citizenId,
			dob: this._DOB,
			height: this._height,
			sex: this._sex,
			nationality: this._nationality,
			backstory: this._backstory,
			phone_number: this._phoneNumber,
			bank: this._bank
		};

		return obj;
	};

	public getSource = (): number => this._source;

	public getLicense = (): string => this._license;

	public getLoggedIn = (): boolean => this._loggedIn;

	public setLoggedIn = (value: boolean, updateClientData?: boolean): void => {
		const previousVal: boolean = this._loggedIn;
		this._loggedIn = value;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "loggedIn", value, previousVal);
	};

	public setCitizenId = (id: string, updateClientData?: boolean): void => {
		const previousVal: string = this._citizenId;
		this._citizenId = id;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "citizenId", id, previousVal);
	};

	public getCitizenId = (): string => this._citizenId;

	public setFirstName = (name: string, updateClientData?: boolean): void => {
		const previousVal: string = this._citizenId;
		this._firstName = name;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "firstName", name, previousVal);
	};

	public getFirstName = (): string => this._firstName;

	public setLastName = (name: string, updateClientData?: boolean): void => {
		const previousVal: string = this._lastName
		this._lastName = name;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "lastName", name, previousVal);
	};

	public getLastName = (): string => this._lastName;

	public getFullName = (): string => {
		return this._firstName + " " + this._lastName;
	};

	public setDOB = (dob: number, updateClientData?: boolean): void => {
		const previousVal: number = this._DOB;
		this._DOB = dob;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "DOB", dob, previousVal);
	};

	public getDOB = (): number => this._DOB;

	public getHeight = (): number => this._height;

	public setHeight = (value: number, updateClientData?: boolean): void => {
		const previousVal: number = this._height;
		this._height = value;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "height", value, previousVal);
	};

	public getSex = (): string => this._sex;

	public setSex = (value: string, updateClientData?: boolean): void => {
		const previousVal: string = this._sex;
		this._sex = value;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "sex", value, previousVal);
	};

	public getNationality = (): string => this._nationality;

	public setNationality = (value: string, updateClientData?: boolean): void => {
		const previousVal: string = this._nationality;
		this._nationality = value;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "nationality", value, previousVal);
	};

	public getBackstory = (): string => this._backstory;

	public setBackstory = (value: string, updateClientData?: boolean): void => {
		const previousVal: string = this._backstory;
		this._backstory = value;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "backstory", value, previousVal);
	};

	public getCoords = (): Vector4 => this._coords;

	public setCoords = (value: Vector4, updateClientData?: boolean): void => {
		const previousVal: Vector4 = this._coords;
		this._coords = value;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "coords", value, previousVal);
	};

	public setObject = (key: string, value: any, updateClientData?: boolean): void => {
		const previousVal = this._customObjects.get(key);
		this._customObjects.set(key, value);

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", `customObjects_${key}`, value, previousVal);
	};

	public removeObject = (key: string, updateClientData?: boolean): void => {
		const previousVal = this._customObjects.get(key);
		this._customObjects.delete(key);

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", `customObjects_${key}`, null, previousVal);
	};

	public getObject = (key: string): any => this._customObjects.get(key);

	public getCash = (): number => {
		const money = global.exports.ox_inventory.GetItem(this._source, "money", null, false);
		if (!money) return 0;
		return money.count;
	};

	public setCash = (amount: number, updateClientData?: boolean): void => {
		let moneyAmount: number = 0;
		let previousVal: number = 0;
		if (config.characters.handleMoney) {
			if (config.characters.inventory === "ox_inventory") {
				const money = global.exports.ox_inventory.GetItem(this._source, "money", null, false);
				previousVal = money.count;

				if (!money) {
					global.exports.ox_inventory.AddItem(this._source, "money", amount);
					moneyAmount = amount;
				} else if (money.count > amount) {
					const newAmount = money.count - amount;
					global.exports.ox_inventory.RemoveItem(this._source, "money", newAmount);
					moneyAmount = newAmount;
				} else {
					const newAmount = amount - money.count;
					global.exports.ox_inventory.AddItem(this._source, "money", newAmount);
					moneyAmount = newAmount;
				}
			}
		}

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "cash", moneyAmount, previousVal);
	};

	public addCash = (amount: number, updateClientData?: boolean): void => {
		let moneyAmount: number = 0;
		let previousVal: number = 0;
		if (config.characters.handleMoney) {
			if (config.characters.inventory === "ox_inventory") {
				const money = global.exports.ox_inventory.GetItem(this._source, "money", null, false);
				global.exports.ox_inventory.AddItem(this._source, "money", amount);
				previousVal = money.count;
				moneyAmount = previousVal + amount;
			}
		}

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "cash", moneyAmount, previousVal);
	};

	public removeCash = (amount: number, updateClientData?: boolean): void => {
		let moneyAmount: number = 0;
		let previousVal: number = 0;
		if (config.characters.handleMoney) {
			if (config.characters.inventory === "ox_inventory") {
				const money = global.exports.ox_inventory.GetItem(this._source, "money", null, false);

				if (!money) return;

				if (money.count < amount) {
					global.exports.ox_inventory.RemoveItem(this._source, "money", money.count);
				} else {
					global.exports.ox_inventory.RemoveItem(this._source, "money", amount);
					previousVal = money.count;
					moneyAmount = previousVal - amount;
				}
			} else {
				// Other inventories here
			}
		}

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "cash", moneyAmount, previousVal);
	};

	public setBank = (money: number, updateClientData?: boolean): void => {
		let previousVal: number | undefined
		if (config.characters.handleMoney) {
			previousVal = this._bank;
			this._bank = money;
		}

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "bank", money, previousVal);
	};

	public addBank = (money: number, updateClientData?: boolean): void => {
		let previousVal: number | undefined
		if (config.characters.handleMoney) {
			previousVal = this._bank;
			this._bank += money;
		}

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "bank", this._bank, previousVal);
	};

	public removeBank = (money: number, updateClientData?: boolean): void => {
		let previousVal: number | undefined;
		if (config.characters.handleMoney) {
			previousVal = this._bank;
			this._bank -= money;
		}

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "bank", this._bank, previousVal);
	};

	public getBank = (): number => {
		if (config.characters.handleMoney) {
			return this._bank;
		}

		return 0;
	};

	public getPhoneNumber = (): number => this._phoneNumber;

	public setPhoneNumber = (phone: number, updateClientData?: boolean): void => {
		const previousVal: number = this._phoneNumber;
		this._phoneNumber = phone;

		if (updateClientData) UpdateCharacterDataClient(this._source, this._citizenId, "update", "phoneNumber", phone, previousVal);
	};

	public loadInventory = (): void => {
		const player = NW.Players.get(this._source);
		if (config.characters.inventory === "ox_inventory") {
			global.exports.ox_inventory.setPlayerInventory({
				source: this._source,
				identifier: this._citizenId,
				name: `${this._firstName} ${this._lastName}`,
				sex: this._sex.toString(),
				dateofbirth: this._DOB.toLocaleString(),
				groups: player?.getGroups(),
			});
		}
	};

	public loadPhone = (): void => {
		if (config.characters.phone === "npwd") {
			global.exports.npwd.newPlayer({
				source: this._source,
				identifier: this._citizenId,
				phoneNumber: this._phoneNumber,
				firstName: this._firstName,
				lastName: this._lastName,
			});
		}
	};
}