import React from "react";
import RequiredError from "./RequiredError";

interface InputFormProps {
	label: string;
	random: any;
	errors: any;
	type: string;
}

const InputForm: React.FC<InputFormProps> = (props: InputFormProps) => {
	return (
		<label className={`text-slate-100 bg-slate-600 p-4 rounded h-fit min-h-full ${props.errors?.type === "required" && "mb-4"}`}>
			<span className="block mb-2">{props.label}</span>
			<input
				type={props.type}
				// value={props.value || ""}
				className="p-2 rounded w-full text-slate-900 bg-slate-400"
				{...props.random}
			/>
			{props.errors?.type === "required" && <RequiredError title={props.label} />}
		</label>
	);
}

export default InputForm;