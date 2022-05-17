import React, { Context, createContext, useContext, useState } from "react";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { NuiData } from "../utils/misc";
import { useNavigate } from "react-router-dom";
import { useCharacters } from "./CharactersProvider";

export const VisibilityCtx = createContext<VisibilityProviderValue | null>(null);

interface VisibilityProviderValue {
	setVisible: (visible: boolean) => void;
	visible: boolean;
}

// This should be mounted at the top level of your application, it is currently set to
// apply a CSS visibility value. If this is non-performant, this should be customized.
export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [visible, setVisible] = useState(false);
	const characters = useCharacters();
	const navigate = useNavigate();

	const handleVisibility = (data: NuiData) => {
		setVisible(data.visible);
		if (data.route) {
			navigate(data.route, { replace: true });
		}
		if (data.data) {
			if (data.data.characters) characters.setValue(data.data.characters);
		}
	}

	useNuiEvent<NuiData>("setVisible", handleVisibility);

	return (
		<VisibilityCtx.Provider
			value={{
				visible,
				setVisible,
			}}
		>
			<div style={{ visibility: visible ? "visible" : "hidden", height: "100%" }}>{children}</div>
		</VisibilityCtx.Provider>
	);
};

export const useVisibility = () => useContext<VisibilityProviderValue>(VisibilityCtx as Context<VisibilityProviderValue>);