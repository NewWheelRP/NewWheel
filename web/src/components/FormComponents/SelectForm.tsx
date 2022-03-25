import { FormState } from "react-hook-form";
import RequiredError from "./RequiredError";

interface InputFormProps {
	label: string;
	random: unknown;
	errors: any;
	options: any[];
}

const SelectForm = (props: InputFormProps) => {
	return (
		<label className="text-slate-100 bg-slate-600 p-4 rounded">
			<span className="block mb-2">{props.label}</span>
			<select
				name="test"
				{...props.random}
				// value={props.value || ""}
				className="p-2 rounded w-full text-slate-900 bg-slate-400"
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