"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
	setReviewHistoryError,
	setReviewHistoryGameIndex,
	setReviewHistoryGamesIds,
	setReviewHistoryIsLoading,
	setReviewHistoryPuuid,
	setReviewHistorySelectedServer,
	setReviewHistorySummonerName,
} from "../../redux/mapSlice/reviewSlice";
import { fetchMatchesIds, fetchSummonerDto } from "../../utils";
import { setGlobalMapTab, setGlobalSidebarTab } from "../../redux/mapSlice/globalSlice";
import { isRiotServer } from "../../types/types";
import useHistoryFct from "../replay/useHistoryFct";
import { MatchDto } from "@/src/lib/riotApi/endpoints/matchv5";
import axios from "axios";
import { MapDb } from "@/src/lib/db/maps/collection";
import { setPopup } from "@/src/lib/redux/popupSlice";
import { FolderDb } from "@/src/lib/db/folders/collection";
import { removeUserFolderStructureItem, setUserLoadedFolder } from "@/src/lib/redux/userSlice";
import useSave from "../save/useSave";

const useUrl = () => {
	const dispatch = useDispatch();

	const { fetchMoreGames, loadGame } = useHistoryFct();

	const { loadNewMapWithoutSave } = useSave();

	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const firstLoad = useRef(true);
	const urlMatchId = searchParams.get("matchId");
	const urlRiotId = searchParams.get("riotId");
	const urlRiotServer = searchParams.get("server");
	const urlMapId = searchParams.get("mapId");
	const urlFolderId = searchParams.get("folderId");

	const isLoading = useSelector((state: RootState) => state.Review.history.isLoading);
	const currentMapId = useSelector((state: RootState) => state.Global.id);

	useEffect(() => {
		const main = async () => {
			firstLoad.current = false;
			if (urlFolderId) {
				try {
					const folderDb = (await axios.get(`/api/mongodb/folders/getFolderById?folderId=${urlFolderId}`))
						.data as FolderDb;
					dispatch(setUserLoadedFolder(folderDb));
					router.replace(`${pathname}?folderId=${urlFolderId}`);
				} catch (error) {
					dispatch(setPopup({ message: "Une erreur est survenue lors du chargement du dossier", type: "error" }));
				}
				return;
			}
			if (urlMapId) {
				try {
					const response = await axios.get(`/api/mongodb/maps/getMapById?id=${urlMapId}`);
					const mapData = response.data as MapDb;
					if (mapData) {
						const oldMapId = currentMapId;
						await loadNewMapWithoutSave(mapData);
						router.replace(`${pathname}?mapId=${urlMapId}`);
						try {
							(await axios.get(`/api/mongodb/maps/getMapById?id=${oldMapId}`)).data;
						} catch (e) {
							dispatch(removeUserFolderStructureItem(oldMapId));
						}
					}
				} catch (e) {
					dispatch(setPopup({ message: "Une erreur est survenue lors du chargement de la map", type: "error" }));
				}
				return;
			}
			if (isLoading) return dispatch(setReviewHistoryError("Veuillez patienter"));
			if (!urlMatchId && !urlRiotId && !urlRiotServer) return;
			dispatch(setGlobalMapTab("Review"));
			dispatch(setGlobalSidebarTab("Historique"));
			if (!urlRiotServer) return dispatch(setReviewHistoryError("Serveur non spécifié"));
			if (!isRiotServer(urlRiotServer)) return dispatch(setReviewHistoryError("Serveur inconnu"));
			dispatch(setReviewHistorySelectedServer(urlRiotServer));
			if (!urlRiotId && !urlMatchId) return dispatch(setReviewHistoryError("Aucun matchId ou riotId fourni"));

			dispatch(setReviewHistoryIsLoading(true));
			dispatch(setReviewHistoryError(""));
			let puuid = "";
			let gamesData: MatchDto[] = [];
			try {
				// Charger Historique si RiotId
				if (urlRiotId) {
					const [gameName, tagLine] = urlRiotId.split("-");
					if (!gameName || !tagLine) dispatch(setReviewHistoryError("RiotId invalide"));
					else {
						dispatch(setReviewHistorySummonerName(`${gameName}#${tagLine}`));
						const summonerDto = await fetchSummonerDto(urlRiotServer, gameName, tagLine);
						dispatch(setReviewHistoryPuuid(summonerDto.puuid));
						puuid = summonerDto.puuid;
						const gamesIds = await fetchMatchesIds(summonerDto.puuid, urlRiotServer);
						dispatch(setReviewHistoryGameIndex(0));
						dispatch(setReviewHistoryGamesIds(gamesIds));

						gamesData = await fetchMoreGames(0, gamesIds, urlRiotServer);
					}
				}
				if (urlMatchId) await loadGame(urlMatchId, gamesData, puuid, urlRiotServer);
			} catch (e) {
				dispatch(setReviewHistoryError("Une erreur est survenue"));
			} finally {
				dispatch(setReviewHistoryIsLoading(false));
			}
			router.replace(
				`${pathname}?server=${urlRiotServer}${urlRiotId ? `&riotId=${urlRiotId}` : ""}${
					urlMatchId ? `&matchId=${urlMatchId}` : ""
				}`
			);
		};
		if (firstLoad.current) main();
	}, [
		currentMapId,
		dispatch,
		fetchMoreGames,
		isLoading,
		loadGame,
		loadNewMapWithoutSave,
		pathname,
		router,
		urlFolderId,
		urlMapId,
		urlMatchId,
		urlRiotId,
		urlRiotServer,
	]);
};

export default useUrl;
