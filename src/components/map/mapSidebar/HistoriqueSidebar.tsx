"use client";

import { sideColors } from "@/src/lib/values/values";
import { ArrowPathIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { v4 as uuidv4 } from "uuid";
import { FC } from "react";
import SpriteImage from "@/src/components/ui/SpriteImage";
import { fetchMatchesIds, fetchSummonerDto, getDaysAgo } from "@/src/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { RiotServer, riotServers } from "@/src/lib/types/types";
import {
	resetReviewHistoryFetchedData,
	setReviewHistoryError,
	setReviewHistoryGameIndex,
	setReviewHistoryGamesData,
	setReviewHistoryGamesIds,
	setReviewHistoryIsLoading,
	setReviewHistoryPuuid,
	setReviewHistorySelectedServer,
	setReviewHistorySummonerName,
} from "@/src/lib/redux/mapSlice/reviewSlice";
import { RootState } from "@/src/lib/redux/store";
import useHistoryFct from "@/src/lib/hook/replay/useHistoryFct";
import useUrlFct from "@/src/lib/hook/url/useUrlFct";

interface HistoriqueSidebarProps {}

const HistoriqueSidebar: FC<HistoriqueSidebarProps> = ({}) => {
	const dispatch = useDispatch();

	const { editUrl } = useUrlFct();

	const { fetchMoreGames, loadGame } = useHistoryFct();

	const { error, gamesData, gamesIds, isLoading, puuid, selectedServer, summonerName } = useSelector(
		(state: RootState) => state.Review.history
	);

	const handleServerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		dispatch(setReviewHistorySelectedServer(event.target.value as RiotServer));
		editUrl([{ key: "server", value: selectedServer }]);
	};

	const handleSummonerNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newSummonerName = event.target.value;
		dispatch(setReviewHistorySummonerName(newSummonerName));
		const [gameName, tagLine] = newSummonerName.split("#");
		editUrl([
			{ key: "riotId", value: gameName && tagLine ? `${gameName}-${tagLine}` : "" },
			{ key: "server", value: selectedServer },
		]);
	};
	const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			handleFetchHistory();
		}
	};

	const handleFetchHistory = async () => {
		if (isLoading) return;
		const [gameName, tagLine] = summonerName.split("#");
		if (gameName === undefined || tagLine === undefined) {
			let matchId = summonerName;
			if (summonerName.split("_").length === 1) matchId = `${selectedServer.toLocaleUpperCase()}_${summonerName}`;
			dispatch(setReviewHistoryIsLoading(true));
			dispatch(setReviewHistoryError(""));
			await loadGame(matchId);
			dispatch(setReviewHistoryIsLoading(false));
			return;
		}
		dispatch(setReviewHistoryIsLoading(true));
		dispatch(setReviewHistoryError(""));

		try {
			const tempPuuid = (await fetchSummonerDto(selectedServer, gameName, tagLine))?.puuid;
			const tempGamesIds = await fetchMatchesIds(tempPuuid, selectedServer);

			if (tempGamesIds && tempGamesIds.length > 0) {
				dispatch(setReviewHistoryPuuid(tempPuuid));
				dispatch(setReviewHistoryGamesIds(tempGamesIds));
				dispatch(setReviewHistoryGamesData([]));
				dispatch(setReviewHistoryGameIndex(0));
				await fetchMoreGames(0, tempGamesIds);
			} else {
				dispatch(setReviewHistoryError("Une erreur est survenue"));
				dispatch(resetReviewHistoryFetchedData());
			}
		} catch (err) {
			dispatch(setReviewHistoryError("Compte non-trouvé sous le format Summoner#1234"));
			dispatch(resetReviewHistoryFetchedData());
		} finally {
			dispatch(setReviewHistoryIsLoading(false));
		}
	};

	const handleSelectGame = async (matchId: string) => {
		if (isLoading) return dispatch(setReviewHistoryError("Veuillez patienter"));

		dispatch(setReviewHistoryIsLoading(true));
		dispatch(setReviewHistoryError(""));

		await loadGame(matchId);

		dispatch(setReviewHistoryIsLoading(false));
	};

	const handleFetchMoreGames = async () => {
		if (isLoading) return;
		dispatch(setReviewHistoryIsLoading(true));
		dispatch(setReviewHistoryError(""));
		await fetchMoreGames();
		dispatch(setReviewHistoryIsLoading(false));
	};

	return (
		<div className="w-full h-full font-bold">
			<div className="flex flex-col w-full h-full gap-6">
				<div className="h-[10%]">
					<div className="flex gap-3 h-1/2">
						<select value={selectedServer} onChange={handleServerChange} className="p-1 text-black rounded-md w-[15%]">
							{riotServers.map((server, index) => (
								<option key={index} value={server}>
									{server.toUpperCase()}
								</option>
							))}
						</select>
						<input
							type="text"
							placeholder="RiotId (name#tag) ou MatchId"
							value={summonerName}
							onChange={handleSummonerNameChange}
							className="pl-2 w-[60%] rounded-lg text-black"
							onKeyDown={handleKeyPress}
						/>
						<button type="button" onClick={handleFetchHistory} className="hover-zoom-110">
							<ArrowPathIcon className={`w-6 animate-spin ${!isLoading ? "stopped" : ""}`} />
						</button>
					</div>
					<div className="font-extrabold text-center text-red-600 h-1/2">
						<p>{error}</p>
					</div>
				</div>
				<div className="h-[87%] w-full overflow-auto custom-scrollbar gap-4 flex flex-col px-2">
					{gamesData.map((gameData) => {
						const daysAgo = getDaysAgo(Math.floor(gameData.info.gameEndTimestamp / 1000));
						const participantData = gameData.info.participants.find((participant) => participant.puuid === puuid);
						if (participantData === undefined) return;
						return (
							<div
								key={gameData.metadata.matchId || uuidv4()}
								onClick={() => handleSelectGame(gameData.metadata.matchId)}
								className="flex flex-col gap-2 p-2 mr-4 rounded-lg hover-zoom-105"
								style={{
									borderColor: sideColors[participantData.win ? "blue" : "red"],
									backgroundColor: sideColors[participantData.win ? "blue" : "red"],
								}}
							>
								<div className="flex justify-between text-white">
									<div className="flex gap-2">
										<SpriteImage type="champion" id={participantData.championId.toString()} />
										<div className="flex flex-col">
											<p>{participantData.championName}</p>
											<p>
												{participantData.kills}/{participantData.deaths}/{participantData.assists}
											</p>
										</div>
									</div>
									<p>Il y a {daysAgo} jours</p>
								</div>
								<div className="flex gap-2">
									{(["0", "1", "2", "3", "4", "5"] as const).map((number) => (
										<SpriteImage key={number} type="item" id={participantData[`item${number}`].toString()} />
									))}
								</div>
							</div>
						);
					})}
				</div>
				<button
					type="button"
					className={`${
						gamesIds || gamesData.length >= 100 ? "" : "hidden"
					} h-[3%] flex justify-center items-center border-2 border-slate-800 bg-slate-400 hover-zoom-110 rounded-lg mr-4`}
					onClick={handleFetchMoreGames}
				>
					<ChevronDownIcon className="w-6" />
				</button>
			</div>
		</div>
	);
};

export default HistoriqueSidebar;
