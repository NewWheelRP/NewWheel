import React from "react";
import type { Character } from "../types";

interface ContextValue {
	value: Character[];
	setValue: (character: Character[]) => void;
}

const CharactersCtx = React.createContext<ContextValue | null>(null);

const CharactersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [value, setValue] = React.useState<Character[]>([]);

	return (
		<CharactersCtx.Provider value={{ value, setValue }}>
			{children}
		</CharactersCtx.Provider>
	);
};

export default CharactersProvider;

export const useCharacters = () => React.useContext<ContextValue>(CharactersCtx as React.Context<ContextValue>);
