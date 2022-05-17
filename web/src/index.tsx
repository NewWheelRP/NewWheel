import React from "react";
import "./index.css";
import App from "./components/App";
import NewCharacter from "./components/NewCharacter";
import CharactersProvider from "./providers/CharactersProvider";

import { VisibilityProvider } from './providers/VisibilityProvider';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import CharacterList from "./components/CharacterList";

library.add(fas, far);

const root = createRoot(document.getElementById('root')!);

root.render(
	<React.StrictMode>
		<Router>
			<CharactersProvider>
				<VisibilityProvider>
					<Routes>
						<Route path="/web/build/index.html" element={<App />} /> {/* Don't know why it needs this, but without this it complains that it can't find it even though it's never used */}
						<Route path="/characters" element={<App />}>
							<Route path="list" element={<CharacterList />} />
							<Route path="new" element={<NewCharacter />} />
						</Route>
					</Routes>
				</VisibilityProvider>
			</CharactersProvider>
		</Router>
	</React.StrictMode>
);