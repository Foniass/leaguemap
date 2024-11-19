import { RiotRegion } from "@/src/lib/types/types";
import { apiKey, riotUrl } from "..";
import { RateLimiter } from "../rateLimiter";

export type AccountDto = {
	puuid: string;
	gameName: string; // This field may be excluded from the response if the account doesn't have a gameName.
	tagLine: string; // This field may be excluded from the response if the account doesn't have a tagLine.
};

const rateLimiterByPuuid = new RateLimiter(90, 6, true);
const rateLimiterbyGameNameAndTagLine = new RateLimiter(90, 6, true);

const endPoint = {
	byPuuid: (riotRegion: RiotRegion, encryptedPuuid: string) =>
		rateLimiterByPuuid.fetch<AccountDto>(
			`${riotUrl(riotRegion, "/riot")}/account/v1/accounts/by-puuid/${encryptedPuuid}?api_key=${apiKey}`
		),
	byGameNameAndTagLine: (riotRegion: RiotRegion, gameName: string, tagLine: string) => {
		return rateLimiterbyGameNameAndTagLine.fetch<AccountDto>(
			`${riotUrl(riotRegion, "/riot")}/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`
		);
	},
};
export default endPoint;
