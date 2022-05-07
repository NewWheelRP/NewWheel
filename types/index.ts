export type Vector4 = {
	x: number;
	y: number;
	z: number;
	w: number;
};

export type CharacterNewObject = {
	firstName: string;
	lastName: string;
	dob?: number;
	height?: number;
	sex?: string;
	nationality?: string;
	backstory?: string;
};

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

export type PlayerDataObject = {
	source: number,
	license: string,
	name: string,
	group: string,
	loggedIn: boolean,
	firstLogin: number,
	lastLogin: number,
	playTime: number,
	character?: CharacterDataObject,
	sessionStartTime: number,
	settings?: Map<string, any>
}