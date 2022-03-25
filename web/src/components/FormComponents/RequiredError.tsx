interface RequiredErrorProps {
	title: string;
}

const RequiredError = (props: RequiredErrorProps) => {
	return <span className="text-red-600">{props.title} is required</span>;
}

export default RequiredError;