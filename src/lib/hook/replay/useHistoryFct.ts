import { setGlobalChampIconSelected, setGlobalSidebarTab } from "@/src/lib/redux/mapSlice/globalSlice";
import {
	pushReviewHistoryGameData,
	setReviewHistoryError,
	setReviewHistoryGameIndex,
	setReviewRiotData,
} from "@/src/lib/redux/mapSlice/reviewSlice";
import { RootState } from "@/src/lib/redux/store";
import { fetchMatchDto, fetchMatchTimelineDto, getRoleAndTeam } from "@/src/lib/utils";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import useUrlFct from "../url/useUrlFct";
import { MatchDto } from "@/src/lib/riotApi/endpoints/matchv5";

const useHistoryFct = () => {
	const dispatch = useDispatch();

	const { editUrl } = useUrlFct();

	const {
		gamesIds: stateGamesIds,
		gameIndex: stateGameIndex,
		selectedServer: stateSelectedServer,
		gamesData: stateGamesData,
		puuid: statePuuid,
	} = useSelector((state: RootState) => state.Review.history);

	const championsData = useSelector((state: RootState) => state.riot.championsData);

	const fetchMoreGames = useCallback(
		async (gameIndex = stateGameIndex, gamesIds = stateGamesIds, selectedServer = stateSelectedServer) => {
			let tempGamesData = [...stateGamesData];
			try {
				let nbGamesAdded = 0;
				let tempGameIndex = gameIndex;
				while (nbGamesAdded < 5) {
					if (!gamesIds || tempGameIndex >= gamesIds.length) break;
					const gameId = gamesIds[tempGameIndex];
					if (gameId === undefined) break;
					const gameData = await fetchMatchDto(gameId, selectedServer);
					if (gameData.info.mapId !== 11) {
						tempGameIndex += 1;
						continue;
					}
					dispatch(pushReviewHistoryGameData(gameData));
					tempGamesData.push(gameData);
					nbGamesAdded += 1;
					tempGameIndex += 1;
				}
				dispatch(setReviewHistoryGameIndex(tempGameIndex));
			} catch (e) {
				dispatch(setReviewHistoryError("Game non-trouvée"));
			}
			return tempGamesData;
		},
		[dispatch, stateGameIndex, stateGamesData, stateGamesIds, stateSelectedServer]
	);

	const loadGame = useCallback(
		async (
			matchId: string,
			gamesData: MatchDto[] = stateGamesData,
			puuid = statePuuid,
			selectedServer = stateSelectedServer
		) => {
			let matchDto = gamesData.find((game) => game.metadata.matchId === matchId);
			if (!matchDto) {
				try {
					matchDto = await fetchMatchDto(matchId, selectedServer);
					if (matchDto.info.mapId !== 11) {
						dispatch(setReviewHistoryError("La game n'est pas sur la faille de l'invocateur"));
						return;
					}
					dispatch(pushReviewHistoryGameData(matchDto));
				} catch (e) {
					dispatch(setReviewHistoryError("Game non-trouvée"));
					return;
				}
			}

			const matchTimelineDto = await fetchMatchTimelineDto(matchDto.metadata.matchId, selectedServer);
			dispatch(setReviewRiotData({ championsData, matchDto, matchTimelineDto }));

			const participantData = matchDto.info.participants.find((participant) => participant.puuid === puuid);

			if (participantData) {
				const { team, role } = getRoleAndTeam(participantData.teamPosition, participantData.teamId);
				dispatch(setGlobalChampIconSelected({ side: team, lane: role }));
			}

			dispatch(setGlobalSidebarTab("Replay"));

			editUrl([{ key: "matchId", value: matchDto.metadata.matchId }]);
		},
		[championsData, dispatch, editUrl, stateGamesData, statePuuid, stateSelectedServer]
	);

	return { fetchMoreGames, loadGame };
};

export default useHistoryFct;
