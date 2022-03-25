module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./node_modules/flowbite/**/*.js"],
	theme: {
		minWidth: {
			"player-card": "250px",
		},
		extend: {},
	},
	plugins: [require("flowbite/plugin")],
};
