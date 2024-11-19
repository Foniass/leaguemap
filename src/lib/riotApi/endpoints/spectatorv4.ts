import { RiotServer } from "@/src/lib/types/types";
import { riotUrl } from "..";
import { apiKey } from "..";
import { RateLimiter } from "../rateLimiter";

type CurrentGameInfo = {
	gameId: number; // The ID of the game
	gameType: string; // The game type
	gameStartTime: number; // The game start time represented in epoch milliseconds
	mapId: number; // The ID of the map
	gameLength: number; // The amount of time in seconds that has passed since the game started
	platformId: string; // The ID of the platform on which the game is being played
	gameMode: string; // The game mode
	bannedChampions: BannedChampion[]; // Banned champion information
	gameQueueConfigId: number; // The queue type (queue types are documented on the Game Constants page)
	observers: Observer; // The observer information
	participants: CurrentGameParticipant[]; // The participant information
};

type BannedChampion = {
	pickTurn: number; // The turn during which the champion was banned
	championId: number; // The ID of the banned champion
	teamId: number; // The ID of the team that banned the champion
};

type Observer = {
	encryptionKey: string; // Key used to decrypt the spectator grid game data for playback
};

type CurrentGameParticipant = {
	championId: number; // The ID of the champion played by this participant
	perks: Perks; // Perks/Runes Reforged Information
	profileIconId: number; // The ID of the profile icon used by this participant
	bot: boolean; // Flag indicating whether or not this participant is a bot
	teamId: number; // The team ID of this participant, indicating the participant's team
	summonerName: string; // The summoner name of this participant
	summonerId: string; // The encrypted summoner ID of this participant
	spell1Id: number; // The ID of the first summoner spell used by this participant
	spell2Id: number; // The ID of the second summoner spell used by this participant
	gameCustomizationObjects: GameCustomizationObject[]; // List of Game Customizations
};

type Perks = {
	perkIds: number[]; // IDs of the perks/runes assigned.
	perkStyle: number; // Primary runes path
	perkSubStyle: number; // Secondary runes path
};

type GameCustomizationObject = {
	category: string; // Category identifier for Game Customization
	content: string; // Game Customization content
};

const rateLimiterBySummonerId = new RateLimiter(1800, 1, true);

const endPoint = {
	bySummonerId: (riotServer: RiotServer, encryptedSummonerId: string) =>
		rateLimiterBySummonerId.fetch<CurrentGameInfo>(
			`${riotUrl(riotServer)}/spectator/v4/active-games/by-summoner/${encryptedSummonerId}?api_key=${apiKey}`
		),
};

export default endPoint;
