import { Vector4 } from "@nativewrappers/client";

export type CharacterNewObject = {
	firstName: string;
	lastName: string;
	dob?: number;
	height?: number;
	sex?: string;
	nationality?: string;
	backstory?: string;
};

export type PlayerDataObject = {
	source: number,
	license: string,
	name: string,
	groups: string | string[],
	loggedIn: boolean,
	firstLogin: number,
	lastLogin: number,
	playTime: number,
	character?: CharacterDataObject,
	sessionStartTime: number,
	settings?: Map<string, any>
}

export interface PlayerDBObject {
	license: string;
	name: string;
	groups: string | string[];
	firstLogin: number;
	lastLogin: number;
	playTime: number;
}

export type CharacterDataObject = {
	source: number,
	license: string,
	citizenId?: string,
	firstName: string,
	lastName: string,
	dob?: number,
	height?: number,
	sex?: string,
	nationality?: string,
	backstory?: string,
	coords: Vector4 | undefined,
	customObjects?: Map<string, any>
}

export interface CharacterDBObject {
	source: number;
	license: string;
	firstName: string;
	lastName: string;
	coords: string;
	citizenId?: string;
	dob?: number;
	height?: number;
	sex?: string;
	nationality?: string;
	backstory?: string;
	phone_number?: number;
	bank?: number;
}