import type { Config } from "tailwindcss";

const { variable, mainbg, sidebarbg, arrowbuttonbg, tabbg } = require("./src/lib/colors");

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				montserrat: ["Montserrat", "sans-serif"],
				lato: ["Lato", "sans-serif"],
				oswald: ["Oswald", "sans-serif"],
			},
			colors: {
				variable,
				mainbg,
				sidebarbg,
				arrowbuttonbg,
				tabbg,
			},
		},
	},
	plugins: [],
};
export default config;
