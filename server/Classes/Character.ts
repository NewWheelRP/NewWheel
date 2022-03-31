import { Vector4 } from "../../types/types";
import config from "../../config.json";
import { Crypto } from "@nativewrappers/client";

interface CharacterDBObject {
	source: number;
	license: string;
	citizenId: string;
	firstName: string;
	lastName: string;
	dob: Number;
	height: Number;
	sex: string;
	nationality: String;
	backstory: String | undefined;
	coords: string;
}

export class Character {
	private _source!: number;
	private _license!: string;
	private _citizenId: string = "";
	private _firstName: string = "";
	private _lastName: string = "";
	private _DOB: Number = 0;
	private _height: Number = 0;
	private _sex: string = "";
	private _nationality: String = "";
	private _backStory: String | undefined = "";
	private _coords: Vector4 | undefined = config.characters.defaultCoords;
	private _customObjects: Map<string, any> = new Map();

	static Load = (source: number, license: string, data: CharacterDBObject) => {
		let character = new Character(source, license);
		character.setCitizenId(data.citizenId);
		character.setFirstName(data.firstName);
		character.setLastName(data.lastName);
		character.setDOB(data.dob);
		character.setHeight(data.height);
		character.setSex(data.sex);
		character.setNationality(data.nationality);
		character.setBackStory(data.backstory || "");
		character.setCoords(JSON.parse(data.coords));
		return character;
	};

	static New = (source: number, license: string, data: any) => {
		let character = new Character(source, license);
		character.setCitizenId(Crypto.uuidv4());
		character.setFirstName(data.firstName);
		character.setLastName(data.lastName);
		character.setDOB(new Date(data.dob).getTime());
		character.setHeight(data.height);
		character.setSex(data.sex);
		character.setNationality(data.nationality);
		character.setBackStory(data.backstory || "");
		character.setCoords(config.characters.defaultCoords);
		global.exports.oxmysql.insert(
			"INSERT INTO characters (citizenId, license, firstName, lastName, dob, height, sex, nationality, backStory, coords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				character.getCitizenId(),
				character.getLicense(),
				character.getFirstName(),
				character.getLastName(),
				character.getDOB(),
				character.getHeight(),
				character.getSex(),
				character.getNationality(),
				character.getBackStory(),
				JSON.stringify(character.getCoords()),
			]
		);
		return character;
	};

	constructor(source: number, license: string) {
		this._source = source;
		this._license = license;
	}

	public save = () => {
		const inventory = global.exports["ox_inventory"].Inventory(this._source);
		console.log(JSON.stringify(inventory.items));

		setImmediate(async () => {
			const affectedRows = global.exports.oxmysql.update_async(
				"UPDATE characters SET firstName = ?, lastName = ?, dob = ?, height = ?, sex = ? , nationality = ? , backStory = ? , coords = ?, inventory = ? WHERE citizenId = ? ",
				[
					this._firstName,
					this._lastName,
					this._DOB,
					this._height,
					this._sex,
					this._nationality,
					this._backStory,
					JSON.stringify(this._coords),
					JSON.stringify(inventory.items) || {},
					this._citizenId,
				]
			);
			if (affectedRows) console.log(`Character: ${this._firstName} ${this._lastName} was saved!`);
		});

		// Save every custom object, each custom object should implement its own save logic
		this._customObjects.forEach((obj) => {
			obj.save();
		});
	};

	public toClientObject = () => {
		const obj = {
			citizenId: this._citizenId,
			firstName: this._firstName,
			lastName: this._lastName,
			license: this._license,
			dob: this._DOB,
			height: this._height,
			sex: this._sex,
			nationality: this._nationality,
			backStory: this._backStory,
			coords: this._coords,
		};
		return obj;
	};

	public getSource = () => {
		return this._source;
	};

	public getLicense = () => {
		return this._license;
	};

	public setCitizenId = (id: string) => {
		this._citizenId = id;
	};

	public getCitizenId = () => {
		return this._citizenId;
	};

	public setFirstName = (name: string) => {
		this._firstName = name;
	};

	public getFirstName = () => {
		return this._firstName;
	};

	public setLastName = (name: string) => {
		this._lastName = name;
	};

	public getLastName = () => {
		return this._lastName;
	};

	public setDOB = (dob: Number) => {
		this._DOB = dob;
	};

	public getDOB = () => {
		return this._DOB;
	};

	public getHeight = (): Number => {
		return this._height;
	};
	public setHeight = (value: Number) => {
		this._height = value;
	};

	public getSex = (): string => {
		return this._sex;
	};
	public setSex = (value: string) => {
		this._sex = value;
	};

	public getNationality = (): String => {
		return this._nationality;
	};
	public setNationality = (value: String) => {
		this._nationality = value;
	};

	public getBackStory = (): String | undefined => {
		return this._backStory;
	};
	public setBackStory = (value: String | undefined) => {
		this._backStory = value;
	};

	public getCoords = (): Vector4 | undefined => {
		return this._coords;
	};
	public setCoords = (value: Vector4 | undefined) => {
		this._coords = value;
	};

	public addObject = (key: string, value: any) => {
		this._customObjects.set(key, value);
	};

	public getObject = (key: string) => {
		return this._customObjects.get(key);
	};

	public getCash = () => {
		const money = global.exports["ox_inventory"].GetItem(this._source, "money", null, false);
		if (!money) return 0;
		return money.count;
	};

	public setCash = (amount: number) => {
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

	public addCash = (amount: number) => {
		global.exports["ox_inventory"].AddItem(this._source, "money", amount);
	};

	public removeCash = (amount: number) => {
		const money = global.exports["ox_inventory"].GetItem(this._source, "money", null, false);

		if (!money) return;

		if (money.count < amount) {
			global.exports["ox_inventory"].RemoveItem(this._source, "money", money.count);
			return;
		}

		global.exports["ox_inventory"].RemoveItem(this._source, "money", amount);
	};

	public loadInventory = () => {
		//t
		global.exports["ox_inventory"].setPlayerInventory({
			source: this._source,
			identifier: this._citizenId,
			name: `${this._firstName} ${this._lastName}`,
			sex: this._sex.toString(),
			dateofbirth: this._DOB.toLocaleString(),
			groups: {},
		});
	};
}
