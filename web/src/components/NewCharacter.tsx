import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Sex } from "../types/enums";
import InputForm from "./FormComponents/InputForm";
import { useForm, SubmitHandler } from "react-hook-form";
import DateForm from "./FormComponents/DateForm";
import SelectForm from "./FormComponents/SelectForm";
import { fetchNui } from "../utils/fetchNui";

interface NewChar {
	firstName: string;
	lastName: string;
	dob: string;
	height: number;
	sex: Sex;
	nationality: string;
	backstory: string;
}

const NewCharacter: React.FC = () => {
	const [char, setChar] = useState<NewChar>({
		firstName: "",
		lastName: "",
		dob: "",
		height: 0,
		sex: Sex.MALE,
		nationality: "",
		backstory: "",
	});

	const {
		register,
		formState: { errors },
		handleSubmit,
	} = useForm<NewChar>();
	const onSubmit: SubmitHandler<NewChar> = (data) => {
		fetchNui<any>("createCharacter", data)
			.then((_) => {})
			.catch((_) => {
				console.error("Something went wrong with setting the character");
			});
	};
	return (
		<div className="bg-slate-800 p-10">
			<h1 className="font-bold text-4xl text-white mb-2">Character Creation</h1>
			<div className="flex mr-2 py-6 w-full">
				<form onSubmit={handleSubmit(onSubmit)} className="w-full grid grid-cols-2 gap-4">
					<InputForm
						random={register("firstName", { required: true, maxLength: 20, pattern: /^[A-Za-z]+$/i })}
						type="text"
						label="First Name"
						errors={errors.firstName}
					/>
					<InputForm
						random={register("lastName", { required: true, maxLength: 20, pattern: /^[A-Za-z]+$/i })}
						type="text"
						label="Last Name"
						errors={errors.lastName}
					/>
					<DateForm
						random={register("dob", { required: true })}
						errors={errors.dob}
						label="Date of Birth"
					/>
					<SelectForm
						random={register("sex")}
						errors={errors.sex}
						label="Sex"
						options={[
							{ label: "Male", value: "MALE" },
							{ label: "Female", value: "FEMALE" },
							{ label: "Undefined", value: "UNDEFINED" },
						]}
					/>
					<InputForm
						random={register("height", { required: true, min: 120, max: 220 })}
						type="number"
						label="Height"
						errors={errors.height}
					/>
					<SelectForm
						random={register("nationality")}
						errors={errors.nationality}
						label="Nationality"
						options={[
							{ label: "San Andreas", value: "SAN_ANDREAS" },
							{ label: "Paleto Bay", value: "PALETO_BAY" },
							{ label: "Sandy Shores", value: "SANDY_SHORES" },
							{ label: "Cayo Perico", value: "CAYO_PERICO" },
							{ label: "North Yankton", value: "NORTH_YANKTON" },
						]}
					/>
					<input
						className="text-slate-100 bg-slate-600 p-4 rounded hover:bg-slate-500 col-span-2"
						type="submit"
						value="Create Character"
					/>
				</form>
			</div>
		</div>
	);
};

export default NewCharacter;