import React from "react";
import "./index.css";
import App from "./components/App";
import NewCharacter from "./components/NewCharacter";
import CharactersProvider from "./providers/CharactersProvider";

import { VisibilityProvider } from './providers/VisibilityProvider';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from "react-router-dom";

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import CharacterList from "./components/CharacterList";

library.add(fas, far);

const root = createRoot(document.getElementById('root')!);

root.render(
	<React.StrictMode>
		<HashRouter>
			<CharactersProvider>
				<VisibilityProvider>
					<Routes>
						<Route path="/characters" element={<App />}>
							<Route path="list" element={<CharacterList />} />
							<Route path="new" element={<NewCharacter />} />
						</Route>
					</Routes>
				</VisibilityProvider>
			</CharactersProvider>
		</HashRouter>
	</React.StrictMode>
);