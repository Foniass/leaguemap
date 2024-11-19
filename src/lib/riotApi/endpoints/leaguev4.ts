import { Division, LowTier, Queue, RiotServer, Tier } from "@/src/lib/types/types";
import { riotUrl } from "..";
import { apiKey } from "..";
import { RateLimiter } from "../rateLimiter";

type LeagueEntryDTO = {
	leagueId: string;
	summonerId: string;
	summonerName: string;
	queueType: Queue;
	tier: Tier;
	rank: Division;
	leaguePoints: number;
	wins: number;
	losses: number;
	hotStreak: boolean;
	veteran: boolean;
	freshBlood: boolean;
	inactive: boolean;
};

type LeagueListDTO = {
	tier: Tier;
	leagueId: string;
	queue: Queue;
	name: string;
	entries: LeagueItemDTO[];
};

type LeagueItemDTO = {
	summonerId: string;
	summonerName: string;
	leaguePoints: number;
	rank: Division;
	wins: number;
	losses: number;
	veteran: boolean;
	inactive: boolean;
	freshBlood: boolean;
	hotStreak: boolean;
};

const rateLimiterEntries = new RateLimiter(4, 1, true);
const rateLimiterChallengerLeagues = new RateLimiter(45, 60, true);
const rateLimiterGrandmasterLeagues = new RateLimiter(45, 60, true);
const rateLimiterMasterLeagues = new RateLimiter(45, 60, true);
const rateLimiterEntriesBySummonerId = new RateLimiter(9, 6, true);

const endPoint = {
	entries: (riotServer: RiotServer, queue: Queue, tier: LowTier, division: Division, page?: number) =>
		rateLimiterEntries.fetch<LeagueEntryDTO[]>(
			`${riotUrl(riotServer)}/league/v4/entries/${queue}/${tier}/${division}?page=${page ?? 1}&api_key=${apiKey}`
		),
	masterLeagues: (riotServer: RiotServer, queue: Queue) =>
		rateLimiterMasterLeagues.fetch<LeagueListDTO>(
			`${riotUrl(riotServer)}/league/v4/masterleagues/by-queue/${queue}?api_key=${apiKey}`
		),
	grandmasterLeagues: (riotServer: RiotServer, queue: Queue) =>
		rateLimiterGrandmasterLeagues.fetch<LeagueListDTO>(
			`${riotUrl(riotServer)}/league/v4/grandmasterleagues/by-queue/${queue}?api_key=${apiKey}`
		),
	challengerLeague: (riotServer: RiotServer, queue: Queue) =>
		rateLimiterChallengerLeagues.fetch<LeagueListDTO>(
			`${riotUrl(riotServer)}/league/v4/challengerleagues/by-queue/${queue}?api_key=${apiKey}`
		),
	entriesBySummonerId: (riotServer: RiotServer, encryptedSummonerId: string) =>
		rateLimiterEntriesBySummonerId.fetch<LeagueEntryDTO[]>(
			`${riotUrl(riotServer)}/league/v4/entries/by-summoner/${encryptedSummonerId}?api_key=${apiKey}`
		),
};

export default endPoint;
