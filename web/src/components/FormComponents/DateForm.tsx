import RequiredError from "./RequiredError";

interface DateFormProps {
	label: string;
	random: unknown;
	errors: any;
}

const DateForm = (props: DateFormProps) => {
	return (
		<label className="text-slate-100 bg-slate-600 p-4 rounded">
			<span className="block mb-2">{props.label}</span>
			<input
				{...props.random}
				type="date"
				// value={props.value || ""}
				className="p-2 rounded w-full text-slate-900 bg-slate-400"
			/>
			{props.errors?.type === "required" && <RequiredError title={props.label} />}
		</label>
	);
}

export default DateForm;