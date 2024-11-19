/** @type {import('next').NextConfig} */
import { withPlausibleProxy } from "next-plausible";

const nextConfig = {
	webpack(config) {
		config.resolve.alias.canvas = false;
		return config;
	},
	images: {
		domains: [
			"lh3.googleusercontent.com",
			"cdn-icons-png.flaticon.com",
			"cdn.iconscout.com",
			"static.vecteezy.com",
			"static-00.iconduck.com",
			"cdn.pixabay.com",
			"ddragon.leagueoflegends.com",
			"raw.communitydragon.org",
			"cdn.communitydragon.org",
			"static.wikia.nocookie.net",
		],
	},
};

export default withPlausibleProxy()(nextConfig);
