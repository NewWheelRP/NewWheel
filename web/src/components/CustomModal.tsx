type Props = {
	children: JSX.Element | JSX.Element[];
	visible: boolean;
};

const CustomModal: React.FC<Props> = ({ children, visible }) => {
	return (
		<div style={{ visibility: visible ? "visible" : "hidden", height: "100%" }}>{children}</div>
	);
};

export default CustomModal;
