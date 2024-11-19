// https://static.developer.riotgames.com/docs/lol/gameTypes.json

const gameTypes = [
	{
		gametype: "CUSTOM_GAME",
		description: "Custom games",
	},
	{
		gametype: "TUTORIAL_GAME",
		description: "Tutorial games",
	},
	{
		gametype: "MATCHED_GAME",
		description: "all other games",
	},
] as const;

export type GameType = (typeof gameTypes)[number]["gametype"];
