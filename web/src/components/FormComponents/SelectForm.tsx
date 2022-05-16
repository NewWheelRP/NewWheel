import React from "react";
import RequiredError from "./RequiredError";

interface SelectFormProps {
	label: string;
	random: any;
	errors: any;
	options: any[];
}

const SelectForm: React.FC<SelectFormProps> = (props: SelectFormProps) => {
	return (
		<label className={`text-slate-100 bg-slate-600 p-4 rounded h-fit min-h-full ${props.errors?.type === "required" && "mb-4"}`}>
			<span className="block mb-2">{props.label}</span>
			<select
				name="test"
				// value={props.value || ""}
				className="p-2 rounded w-full text-slate-900 bg-slate-400"
				{...props.random}
			>
				{props.options.map((option) => {
					return (
						<option value={option.value} key={option.value}>
							{option.label}
						</option>
					);
				})}
			</select>
			{props.errors?.type === "required" && <RequiredError title={props.label} />}
		</label>
	);
}

export default SelectForm;