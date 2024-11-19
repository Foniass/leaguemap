import { RiotRegion } from "@/src/lib/types/types";
import { riotUrl } from "..";
import { apiKey } from "..";
import { QueueId } from "../gameConstant/queues";
import { RateLimiter } from "../rateLimiter";

export type MatchDto = {
	metadata: MetadataDto; // Match metadata.
	info: InfoDto; // Match info.
};

type MetadataDto = {
	dataVersion: string; // Match data version.
	matchId: string; // Match id.
	participants: string[]; // A list of participant PUUIDs.
};

type InfoDto = {
	gameCreation: number; // Unix timestamp for when the game is created on the game server (i.e., the loading screen).
	gameDuration: number; // Prior to patch 11.20, this field returns the game length in milliseconds calculated from gameEndTimestamp - gameStartTimestamp. Post patch 11.20, this field returns the max timePlayed of any participant in the game in seconds, which makes the behavior of this field consistent with that of match-v4. The best way to handling the change in this field is to treat the value as milliseconds if the gameEndTimestamp field isn't in the response and to treat the value as seconds if gameEndTimestamp is in the response.
	gameEndTimestamp: number; // Unix timestamp for when match ends on the game server. This timestamp can occasionally be significantly longer than when the match "ends". The most reliable way of determining the timestamp for the end of the match would be to add the max time played of any participant to the gameStartTimestamp. This field was added to match-v5 in patch 11.20 on Oct 5th, 2021.
	gameId: number;
	gameMode: string; // Refer to the Game Constants documentation.
	gameName: string;
	gameStartTimestamp: number; // Unix timestamp for when match starts on the game server.
	gameType: string;
	gameVersion: string; // The first two parts can be used to determine the patch a game was played on.
	mapId: number; // Refer to the Game Constants documentation.
	participants: ParticipantDto[];
	platformId: string; // Platform where the match was played.
	queueId: QueueId; // Refer to the Game Constants documentation.
	teams: TeamDto[];
	tournamentCode: string; // Tournament code used to generate the match. This field was added to match-v5 in patch 11.13 on June 23rd, 2021.
};

export type ParticipantDto = {
	assists: number;
	baronKills: number;
	bountyLevel: number;
	champExperience: number;
	champLevel: number;
	championId: number; // Prior to patch 11.4, on Feb 18th, 2021, this field returned invalid championIds. We recommend determining the champion based on the championName field for matches played prior to patch 11.4.
	championName: string;
	championTransform: number; // This field is currently only utilized for Kayn's transformations. (Legal values: 0 - None, 1 - Slayer, 2 - Assassin)
	consumablesPurchased: number;
	damageDealtToBuildings: number;
	damageDealtToObjectives: number;
	damageDealtToTurrets: number;
	damageSelfMitigated: number;
	deaths: number;
	detectorWardsPlaced: number;
	doubleKills: number;
	dragonKills: number;
	firstBloodAssist: boolean;
	firstBloodKill: boolean;
	firstTowerAssist: boolean;
	firstTowerKill: boolean;
	gameEndedInEarlySurrender: boolean;
	gameEndedInSurrender: boolean;
	goldEarned: number;
	goldSpent: number;
	individualPosition: string; // Both individualPosition and teamPosition are computed by the game server and are different versions of the most likely position played by a player. The individualPosition is the best guess for which position the player actually played in isolation of anything else. The teamPosition is the best guess for which position the player actually played if we add the constraint that each team must have one top player, one jungle, one middle, etc. Generally the recommendation is to use the teamPosition field over the individualPosition field.
	inhibitorKills: number;
	inhibitorTakedowns: number;
	inhibitorsLost: number;
	item0: number;
	item1: number;
	item2: number;
	item3: number;
	item4: number;
	item5: number;
	item6: number;
	itemsPurchased: number;
	killingSprees: number;
	kills: number;
	lane: string;
	largestCriticalStrike: number;
	largestKillingSpree: number;
	largestMultiKill: number;
	longestTimeSpentLiving: number;
	magicDamageDealt: number;
	magicDamageDealtToChampions: number;
	magicDamageTaken: number;
	neutralMinionsKilled: number;
	nexusKills: number;
	nexusTakedowns: number;
	nexusLost: number;
	objectivesStolen: number;
	objectivesStolenAssists: number;
	participantId: number;
	pentaKills: number;
	perks: PerksDto;
	physicalDamageDealt: number;
	physicalDamageDealtToChampions: number;
	physicalDamageTaken: number;
	profileIcon: number;
	puuid: string;
	quadraKills: number;
	riotIdName: string;
	riotIdTagline: string;
	role: string;
	sightWardsBoughtInGame: number;
	spell1Casts: number;
	spell2Casts: number;
	spell3Casts: number;
	spell4Casts: number;
	summoner1Casts: number;
	summoner1Id: number;
	summoner2Casts: number;
	summoner2Id: number;
	summonerId: string;
	summonerLevel: number;
	summonerName: string;
	teamEarlySurrendered: boolean;
	teamId: number;
	teamPosition: string; // Both individualPosition and teamPosition are computed by the game server and are different versions of the most likely position played by a player. The individualPosition is the best guess for which position the player actually played in isolation of anything else. The teamPosition is the best guess for which position the player actually played if we add the constraint that each team must have one top player, one jungle, one middle, etc. Generally the recommendation is to use the teamPosition field over the individualPosition field.
	timeCCingOthers: number;
	timePlayed: number;
	totalDamageDealt: number;
	totalDamageDealtToChampions: number;
	totalDamageShieldedOnTeammates: number;
	totalDamageTaken: number;
	totalHeal: number;
	totalHealsOnTeammates: number;
	totalMinionsKilled: number;
	totalTimeCCDealt: number;
	totalTimeSpentDead: number;
	totalUnitsHealed: number;
	tripleKills: number;
	trueDamageDealt: number;
	trueDamageDealtToChampions: number;
	trueDamageTaken: number;
	turretKills: number;
	turretTakedowns: number;
	turretsLost: number;
	unrealKills: number;
	visionScore: number;
	visionWardsBoughtInGame: number;
	wardsKilled: number;
	wardsPlaced: number;
	win: boolean;
};

type PerksDto = {
	statPerks: PerkStatsDto;
	styles: PerkStyleDto[];
};

type PerkStatsDto = {
	defense: number;
	flex: number;
	offense: number;
};

type PerkStyleDto = {
	description: string;
	selections: PerkStyleSelectionDto[];
	style: number;
};

type PerkStyleSelectionDto = {
	perk: number;
	var1: number;
	var2: number;
	var3: number;
};

type TeamDto = {
	bans: BanDto[];
	objectives: ObjectivesDto;
	teamId: number;
	win: boolean;
};

type BanDto = {
	championId: number;
	pickTurn: number;
};

type ObjectivesDto = {
	baron: ObjectiveDto;
	champion: ObjectiveDto;
	dragon: ObjectiveDto;
	inhibitor: ObjectiveDto;
	riftHerald: ObjectiveDto;
	tower: ObjectiveDto;
};

type ObjectiveDto = {
	first: boolean;
	kills: number;
};

// http://www.mingweisamuel.com/riotapi-schema/tool/#/match-v5/match-v5.getTimeline
export type MatchTimelineDto = {
	metadata: MetadataDto;
	info: MatchTimelineInfo;
};

type MatchTimelineInfo = {
	frameInterval: number;
	frames: MatchTimelineInfoFrame[];
	gameId?: number;
	participants?: MatchTimelineInfoParticipant[];
};

type MatchTimelineInfoParticipant = {
	participantId: number;
	puuid: string;
};

type MatchTimelineInfoFrame = {
	events: MatchTimelineInfoFrameEvent[];
	participantFrames: MatchTimelineInfoFrameParticipantFrames;
	timestamp: number;
};

type MatchTimelineInfoFrameParticipantFrames = Record<number, MatchTimelineInfoFrameParticipantFrame>;

export type MatchTimelineInfoFrameParticipantFrame = {
	championStats: MatchTimelineInfoFrameParticipantFrameChampionStats;
	currentGold: number;
	damageStats: MatchTimelineInfoFrameParticipantFrameDamageStats;
	goldPerSecond: number;
	jungleMinionsKilled: number;
	level: number;
	minionsKilled: number;
	participantId: number;
	position: MatchTimelinePosition;
	timeEnemySpentControlled: number;
	totalGold: number;
	xp: number;
};

type MatchTimelinePosition = {
	x: number;
	y: number;
};

type MatchTimelineInfoFrameParticipantFrameDamageStats = {
	magicDamageDone: number;
	magicDamageDoneToChampions: number;
	magicDamageTaken: number;
	physicalDamageDone: number;
	physicalDamageDoneToChampions: number;
	physicalDamageTaken: number;
	totalDamageDone: number;
	totalDamageDoneToChampions: number;
	totalDamageTaken: number;
	trueDamageDone: number;
	trueDamageDoneToChampions: number;
	trueDamageTaken: number;
};

type MatchTimelineInfoFrameParticipantFrameChampionStats = {
	abilityHaste: number;
	abilityPower: number;
	armor: number;
	armorPen: number;
	armorPenPercent: number;
	attackDamage: number;
	attackSpeed: number;
	bonusArmorPenPercent: number;
	bonusMagicPenPercent: number;
	ccReduction: number;
	cooldownReduction: number;
	health: number;
	healthMax: number;
	healthRegen: number;
	lifesteal: number;
	magicPen: number;
	magicPenPercent: number;
	magicResist: number;
	movementSpeed: number;
	omnivamp?: number;
	physicalVamp?: number;
	power: number;
	powerMax: number;
	powerRegen: number;
	spellVamp: number;
};

type MatchTimelineInfoFrameEvent = {
	realTimestamp?: number;
	timestamp: number;
	type: string;
	itemId?: number;
	participantId?: number;
	levelUpType?: string;
	skillSlot?: number;
	creatorId?: number;
	wardType?: string;
	level?: number;
	assistingParticipantIds?: number[];
	bounty?: number;
	killStreakLength?: number;
	killerId?: number;
	position?: MatchTimelinePosition;
	victimDamageDealt?: MatchTimelineInfoFrameEventVictimDamageReceived[];
	victimDamageReceived?: MatchTimelineInfoFrameEventVictimDamageReceived[];
	victimId?: number;
	killType?: string;
	laneType?: string;
	teamId?: number;
	multiKillLength?: number;
	killerTeamId?: number;
	monsterType?: string;
	monsterSubType?: string;
	buildingType?: string;
	towerType?: string;
	afterId?: number;
	beforeId?: number;
	goldGain?: number;
	gameId?: number;
	winningTeam?: number;
	transformType?: string;
	name?: string;
	shutdownBounty?: number;
	actualStartTime?: number;
};

type MatchTimelineInfoFrameEventVictimDamageReceived = {
	basic: boolean;
	magicDamage: number;
	name: string;
	participantId: number;
	physicalDamage: number;
	spellName: string;
	spellSlot: number;
	trueDamage: number;
	type: string;
};

const rateLimiterMatches = new RateLimiter(180, 1, true);
const rateLimiterMatchesByPuuid = new RateLimiter(180, 1, true);
const rateLimiterMatchesTimeline = new RateLimiter(180, 1, true);

const endPoint = {
	matches: (riotRegion: RiotRegion, matchId: string) =>
		rateLimiterMatches.fetch<MatchDto>(`${riotUrl(riotRegion)}/match/v5/matches/${matchId}?api_key=${apiKey}`),
	matchesTimeline: (riotRegion: RiotRegion, matchId: string) =>
		rateLimiterMatchesTimeline.fetch<MatchTimelineDto>(
			`${riotUrl(riotRegion)}/match/v5/matches/${matchId}/timeline?api_key=${apiKey}`
		),
	matchesByPuuid: (
		riotRegion: RiotRegion,
		puuid: string,
		queryParams?: {
			startTime?: number; // Epoch timestamp in seconds. The matchlist started storing timestamps on June 16th, 2021. Any matches played before June 16th, 2021 won't be included in the results if the startTime filter is set.
			endTime?: number; // Epoch timestamp in seconds.
			queue?: QueueId; // Filter the list of match ids by a specific queue id. This filter is mutually inclusive of the type filter meaning any match ids returned must match both the queue and type filters.
			type?: "ranked" | "normal" | "tourney" | "tutorial"; // Filter the list of match ids by the type of match. This filter is mutually inclusive of the queue filter meaning any match ids returned must match both the queue and type filters.
			start?: number; // Defaults to 0. Start index.
			count?: number; // Defaults to 20. Valid values: 0 to 100. Number of match ids to return.
		}
	) =>
		rateLimiterMatchesByPuuid.fetch<string[]>(
			`${riotUrl(riotRegion)}/match/v5/matches/by-puuid/${puuid}/ids?${addQueryParams(queryParams)}api_key=${apiKey}`
		),
};

export default endPoint;

const addQueryParams = (queryParams?: {
	startTime?: number;
	endTime?: number;
	queue?: number;
	type?: "ranked" | "normal" | "tourney" | "tutorial";
	start?: number;
	count?: number;
}) => {
	let str = "";
	for (const key in queryParams) {
		str += `${key}=${queryParams[key as keyof typeof queryParams]}&`;
	}
	return str;
};
