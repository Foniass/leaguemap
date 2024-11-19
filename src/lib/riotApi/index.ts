import { RiotRegion, RiotServer } from "../types/types";
import accountv1 from "./endpoints/accountv1";
import leaguev4 from "./endpoints/leaguev4";
import matchv5 from "./endpoints/matchv5";
import spectatorv4 from "./endpoints/spectatorv4";
import summonerv4 from "./endpoints/summonerv4";

if (!process.env.RIOT_API_KEY) throw new Error("Missing env.RIOT_API_KEY");

export const riotUrl = (target: RiotRegion | RiotServer, forcedUrl?: string) =>
	`https://${target}.api.riotgames.com${forcedUrl ? forcedUrl : "/lol"}`;
export const apiKey = process.env.RIOT_API_KEY;

const endPoints = {
	leaguev4,
	matchv5,
	summonerv4,
	spectatorv4,
	accountv1,
};
export default endPoints;
