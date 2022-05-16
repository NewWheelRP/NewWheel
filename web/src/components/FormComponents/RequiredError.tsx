import React from "react";

interface RequiredErrorProps {
	title: string;
}

const RequiredError: React.FC<RequiredErrorProps> = (props: RequiredErrorProps) => {
	return <span className="text-white-600 bg-red-600 rounded p-2 relative top-4">{props.title} is required</span>;
}

export default RequiredError;