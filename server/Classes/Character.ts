import { CharacterDataObject, CharacterNewObject, CharacterDBObject } from "../../types";
import { Vector4 } from "@nativewrappers/client";
import config from "../../config.json";
import { Crypto } from "@nativewrappers/client";

export class Character {
	private static defaultCoords: Vector4 = new Vector4(config.characters.defaultCoords.x, config.characters.defaultCoords.y, config.characters.defaultCoords.z, config.characters.defaultCoords.w);
	private _source!: number;
	private _license!: string;
	private _firstName: string = "";
	private _lastName: string = "";
	private _coords: Vector4 | undefined = Character.defaultCoords;
	private _citizenId: string = "";
	private _DOB: number = 0;
	private _height: number = 0;
	private _sex: string = "";
	private _nationality: string = "";
	private _backstory: string = "";
	private _phoneNumber: number = 0;
	private _bank: number = 0;
	private _customObjects: Map<string, any> = new Map();

	static load = (source: number, license: string, data: CharacterDBObject): Character => {
		const character = new Character(source, license);
		character.setFirstName(data.firstName);
		character.setLastName(data.lastName);
		character.setCoords(JSON.parse(data.coords));
		if (data.citizenId) character.setCitizenId(data.citizenId);
		if (data.dob) character.setDOB(data.dob);
		if (data.height) character.setHeight(data.height);
		if (data.sex) character.setSex(data.sex);
		if (data.nationality) character.setNationality(data.nationality);
		if (data.backstory) character.setBackstory(data.backstory);
		if (data.phone_number) character.setPhoneNumber(data.phone_number);
		if (data.bank) character.setBank(data.bank);
		return character;
	};

	static new = (source: number, license: string, data: CharacterNewObject): Character => {
		const character = new Character(source, license);
		let phoneNumber = 0;
		if (config.characters.phone === "npwd") phoneNumber = global.exports["npwd"].generatePhoneNumber();

		character.setFirstName(data.firstName);
		character.setLastName(data.lastName);
		character.setCoords(Character.defaultCoords);
		character.setCitizenId(Crypto.uuidv4());
		if (data.dob) character.setDOB(new Date(data.dob).getTime());
		if (data.height) character.setHeight(data.height);
		if (data.sex) character.setSex(data.sex);
		if (data.nationality) character.setNationality(data.nationality);
		if (data.backstory) character.setBackstory(data.backstory);
		if (phoneNumber !== 0) character.setPhoneNumber(phoneNumber);
		global.exports.oxmysql.insert(
			"INSERT INTO characters (citizenId, license, firstName, lastName, dob, height, sex, nationality, backstory, coords, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				character.getCitizenId(),
				character.getLicense(),
				character.getFirstName(),
				character.getLastName(),
				character.getDOB(),
				character.getHeight(),
				character.getSex(),
				character.getNationality(),
				character.getBackstory(),
				JSON.stringify(character.getCoords()),
				character.getPhoneNumber(),
			]
		);
		return character;
	};

	constructor(source: number, license: string) {
		this._source = source;
		this._license = license;
	}

	public save = (): void => {
		const inventory = global.exports["ox_inventory"].Inventory(this._source);
		console.log(JSON.stringify(inventory.items));

		setImmediate(async () => {
			const affectedRows = global.exports.oxmysql.update_async(
				"UPDATE characters SET firstName = ?, lastName = ?, dob = ?, height = ?, sex = ? , nationality = ? , backstory = ? , coords = ?, inventory = ?, phone_number = ? WHERE citizenId = ? ",
				[
					this._firstName,
					this._lastName,
					this._DOB,
					this._height,
					this._sex,
					this._nationality,
					this._backstory,
					JSON.stringify(this._coords),
					JSON.stringify(inventory.items) || "{}",
					this._phoneNumber,
					this._citizenId,
				]
			);
			if (affectedRows) console.log(`[id: ${this._source}] Character: ${this._firstName} ${this._lastName} was saved!`);
		});

		// Save every custom object, each custom object should implement its own save logic
		this._customObjects.forEach((obj: any) => {
			obj.save();
		});
	};

	public toClientObject = (): CharacterDataObject => {
		const obj: CharacterDataObject = {
			source: this._source,
			license: this._license,
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

	public setCitizenId = (id: string): void => {
		this._citizenId = id;
	};

	public getCitizenId = (): string => this._citizenId;

	public setFirstName = (name: string): void => {
		this._firstName = name;
	};

	public getFirstName = (): string => this._firstName;

	public setLastName = (name: string): void => {
		this._lastName = name;
	};

	public getLastName = (): string => this._lastName;

	public getFullName = (): string => {
		return this._firstName + " " + this._lastName;
	};

	public setDOB = (dob: number): void => {
		this._DOB = dob;
	};

	public getDOB = (): number => this._DOB;

	public getHeight = (): number => this._height;

	public setHeight = (value: number): void => {
		this._height = value;
	};

	public getSex = (): string => this._sex;

	public setSex = (value: string): void => {
		this._sex = value;
	};

	public getNationality = (): string => this._nationality;

	public setNationality = (value: string): void => {
		this._nationality = value;
	};

	public getBackstory = (): string => this._backstory;

	public setBackstory = (value: string): void => {
		this._backstory = value;
	};

	public getCoords = (): Vector4 | undefined => this._coords;

	public setCoords = (value: Vector4 | undefined): void => {
		this._coords = value;
	};

	public addObject = (key: string, value: any): void => {
		this._customObjects.set(key, value);
	};

	public getObject = (key: string): any => this._customObjects.get(key);

	public getCash = (): number => {
		const money = global.exports["ox_inventory"].GetItem(this._source, "money", null, false);
		if (!money) return 0;
		return money.count;
	};

	public setCash = (amount: number): void => {
		const money = global.exports["ox_inventory"].GetItem(this._source, "money", null, false);

		if (!money) {
			global.exports["ox_inventory"].AddItem(this._source, "money");
			return;
		}

		if (money.count > amount) {
			const newAmount = money.count - amount;
			global.exports["ox_inventory"].RemoveItem(this._source, "money", newAmount);
			return;
		}

		const newAmount = amount - money.count;
		global.exports["ox_inventory"].AddItem(this._source, "money", newAmount);
	};

	public addCash = (amount: number): void => {
		global.exports["ox_inventory"].AddItem(this._source, "money", amount);
	};

	public removeCash = (amount: number): void => {
		const money = global.exports["ox_inventory"].GetItem(this._source, "money", null, false);

		if (!money) return;

		if (money.count < amount) {
			global.exports["ox_inventory"].RemoveItem(this._source, "money", money.count);
			return;
		}

		global.exports["ox_inventory"].RemoveItem(this._source, "money", amount);
	};

	public setBank = (money: number): void => {
		if (config.characters.useSimpleBanking) {
			this._bank = money;
		}
	};

	public addBank = (money: number): void => {
		if (config.characters.useSimpleBanking) {
			this._bank += money;
		}
	};

	public removeBank = (money: number): void => {
		if (config.characters.useSimpleBanking) {
			this._bank -= money;
		}
	};

	public getBank = (): number => {
		if (config.characters.useSimpleBanking) {
			return this._bank;
		}

		return 0;
	};

	public getPhoneNumber = (): number => this._phoneNumber;

	public setPhoneNumber = (phone: number): void => {
		this._phoneNumber = phone;
	};

	public loadInventory = (): void => {
		if (config.characters.inventory === "ox_inventory") {
			global.exports["ox_inventory"].setPlayerInventory({
				source: this._source,
				identifier: this._citizenId,
				name: `${this._firstName} ${this._lastName}`,
				sex: this._sex.toString(),
				dateofbirth: this._DOB.toLocaleString(),
				groups: {},
			});
		}
	};

	public loadPhone = (): void => {
		if (config.characters.phone === "npwd") {
			global.exports["npwd"].newPlayer({
				source: this._source,
				identifier: this._citizenId,
				phoneNumber: this._phoneNumber,
				firstName: this._firstName,
				lastName: this._lastName,
			});
		}
	};
}