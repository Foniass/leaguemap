import axios from "axios";
import riotApi from "@/src/lib/riotApi";
import { riotServerToRiotRegion } from "@/src/lib/utils";
import { isRiotServer } from "@/src/lib/types/types";

const ERROR_MESSAGES = {
	server: "Server error, could not retrieve gamesIds.",
	riot: "Riot API error, could not retrieve gamesIds.",
	noServer: "No server provided.",
	wrongServer: "Server provided doesn't exist.",
	noSummonerName: "No summonerName provided.",
	wrongSummonerName: "The summonerName provided doesn't respect the format 'name-tagline'.",
};

const STATUS_CODES = {
	success: 200,
	badRequest: 400,
	serverError: 500,
};

const handleRiotServerError = (newGamesIds: any) =>
	new Response(JSON.stringify({ error: ERROR_MESSAGES.riot, details: newGamesIds }), {
		status: STATUS_CODES.serverError,
	});

const handleServerError = (error: unknown) => {
	const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
	return new Response(JSON.stringify({ error: ERROR_MESSAGES.server, details: errorMessage }), {
		status: STATUS_CODES.serverError,
	});
};

export async function GET(req: Request): Promise<Response> {
	const { searchParams } = new URL(req.url);
	const summonerName = searchParams.get("summonerName");
	const riotServer = searchParams.get("server");

	if (!summonerName) {
		return new Response(JSON.stringify({ error: ERROR_MESSAGES.noSummonerName }), { status: STATUS_CODES.badRequest });
	}

	if (!riotServer) {
		const error = ERROR_MESSAGES.noServer;
		return new Response(JSON.stringify({ error }), { status: STATUS_CODES.badRequest });
	}

	if (!isRiotServer(riotServer)) {
		const error = ERROR_MESSAGES.wrongServer;
		return new Response(JSON.stringify({ error }), { status: STATUS_CODES.badRequest });
	}

	const riotRegion = riotServerToRiotRegion(riotServer);
	if (!riotRegion) {
		const error = ERROR_MESSAGES.wrongServer;
		return new Response(JSON.stringify({ error }), { status: STATUS_CODES.badRequest });
	}

	const [gameName, tagLine] = summonerName.split("-");
	if (!gameName || !tagLine) {
		const error = ERROR_MESSAGES.noSummonerName;
		return new Response(JSON.stringify({ error }), { status: STATUS_CODES.badRequest });
	}

	try {
		const accountDto = await riotApi.accountv1.byGameNameAndTagLine(riotRegion, gameName, tagLine);
		if (accountDto === null) {
			const error = ERROR_MESSAGES.server;
			return new Response(JSON.stringify({ error }), { status: STATUS_CODES.serverError });
		}
		const summonerDto = await riotApi.summonerv4.byPuuid(riotServer, accountDto.puuid);
		if (summonerDto === null) {
			const error = ERROR_MESSAGES.server;
			return new Response(JSON.stringify({ error }), { status: STATUS_CODES.serverError });
		}
		return new Response(JSON.stringify(summonerDto), { status: STATUS_CODES.success });
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return handleRiotServerError(error.response?.status);
		}
		return handleServerError(error);
	}
}
