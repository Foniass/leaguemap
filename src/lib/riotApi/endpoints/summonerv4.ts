import { RiotServer } from "@/src/lib/types/types";
import { apiKey, riotUrl } from "..";
import { RateLimiter } from "../rateLimiter";

export type SummonerDTO = {
	puuid: string;
	accountId: string;
	id: string;
	name: string;
	profileIconId: number;
	summonerLevel: number;
	revisionDate: number;
};

const rateLimiterByAccountId = new RateLimiter(144, 6, true);
const rateLimiterBySummonerId = new RateLimiter(144, 6, true);
const rateLimiterByPuuid = new RateLimiter(144, 6, true);

const endPoint = {
	byAccountId: (riotServer: RiotServer, encryptedAccountId: string) =>
		rateLimiterByAccountId.fetch<SummonerDTO>(
			`${riotUrl(riotServer)}/summoner/v4/summoners/by-account/${encryptedAccountId}?api_key=${apiKey}`
		),
	bySummonerId: (riotServer: RiotServer, encryptedSummonerId: string) =>
		rateLimiterBySummonerId.fetch<SummonerDTO>(
			`${riotUrl(riotServer)}/summoner/v4/summoners/${encryptedSummonerId}?api_key=${apiKey}`
		),
	byPuuid: (riotServer: RiotServer, encryptedPuuid: string) =>
		rateLimiterByPuuid.fetch<SummonerDTO>(
			`${riotUrl(riotServer)}/summoner/v4/summoners/by-puuid/${encryptedPuuid}?api_key=${apiKey}`
		),
};

export default endPoint;
