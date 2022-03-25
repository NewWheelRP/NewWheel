import * as React from "react";

import { fetchNui } from "../utils/fetchNui";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCharacters } from "../providers/CharactersProvider";
import CustomModal from "./CustomModal";
import { useState } from "react";

// This will set the NUI to visible if we are
// developing in browser

const cardClasses = "min-w-player-card mr-5 p-5 h-96 bg-slate-600 rounded";
const cardWrapperClasses = "text-xl flex flex-col gap-2 text-slate-300";

enum DELETE_CONFIRM {
	YES,
	NO,
}

const CharacterList: React.FC = () => {
	const [modal, setModal] = useState(false);
	const characters = useCharacters();
	const createDate = (dob: number) => {
		const newDate = new Date(dob * 1000);
		return newDate.toLocaleDateString();
	};

	const handleDelete = (id: number) => {
		let array = [...characters.value];
		let value = array[id];
		if (id !== -1) {
			characters.setValue(array);
			// Handle the deleteion of the character
			fetchNui<any>("deleteCharacter", value.citizenId)
				.then((retData) => {})
				.catch((e) => {
					console.error("Something went wrong with deleting the character");
				});
			array.splice(id, 1);
		}
	};

	const cancelDelete = () => {
		setModal(false);
	};

	const handlePlay = (citizenId: number) => {
		fetchNui<any>("setCharacter", citizenId)
			.then((retData) => {})
			.catch((e) => {
				console.error("Something went wrong with setting the character");
			});
	};

	return (
		<div className="bg-slate-800 p-10">
			<h1 className="font-bold text-4xl text-white mb-2">Character Selection</h1>
			<br />
			<div className="flex overflow-x-auto mr-2 py-6 w-full">
				{characters.value.map((character: any, index: number) => {
					return (
						<div className={cardClasses} key={character.citizenId}>
							<h2 className="text-3xl font-bold uppercase text-slate-100 mb-4">
								{character.firstName + " " + character.lastName}
							</h2>
							<div className={cardWrapperClasses}>
								<div>
									<FontAwesomeIcon icon="user" className="mr-3" />
									<span>{character.firstName + " " + character.lastName}</span>
								</div>
								<div>
									<FontAwesomeIcon icon="calendar" className="mr-3" />
									<span>DOB: {createDate(character.dob)}</span>
								</div>
							</div>
							<div className="w-full text-slate-200 flex justify-around justify-self-end mt-3 bg-slate-700 p-3 rounded">
								<button
									onClick={() => handlePlay(character.citizenId)}
									className="rounded px-4 py-2 bg-blue-500 hover:bg-blue-600"
								>
									Play
								</button>
								<button
									onClick={() => setModal(true)}
									className="rounded px-4 py-2 bg-red-500 hover:bg-red-600"
								>
									Delete
								</button>
							</div>

							<CustomModal visible={modal}>
								<div className="z-10 absolute top-0 left-0 bg-slate-900/60 w-screen h-screen">
									<div className="flex h-full content-center justify-center items-center align-middle ">
										<div className="p-5 bg-slate-500 rounded">
											<p className="mb-3 text-slate-200">Are you sure?</p>
											<div className="w-full text-slate-200 flex mt-3">
												<button
													className="rounded px-4 py-2 bg-blue-500 hover:bg-blue-600 mr-5"
													onClick={cancelDelete}
												>
													No, cancel
												</button>
												<button
													onClick={() => handleDelete(index)}
													className="rounded px-4 py-2 bg-red-500 hover:bg-red-600"
												>
													Yes, Delete
												</button>
											</div>
										</div>
									</div>
								</div>
							</CustomModal>
						</div>
					);
				})}

				<div className={cardClasses + " hover:bg-slate-500"}>
					<Link to="/characters/new" className="flex content-center h-full">
						<FontAwesomeIcon icon="plus" className="text-slate-300 text-8xl text-center m-auto" />
					</Link>
				</div>
			</div>
		</div>
	);
};

export default CharacterList;
