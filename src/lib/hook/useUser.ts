import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useCallback, useEffect, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { concatUserFolderStructure, removeUserFolderStructureItem, setUserLoadedFolder } from "../redux/userSlice";
import { setPopup } from "../redux/popupSlice";
import { findFolderStructureItemPath, findMapWithLowestSumOfIndices } from "../utils";
import { FolderStructureItem, isMapItem } from "../types/types";
import { FolderDb } from "../db/folders/collection";
import dayjs from "dayjs";
import { UserDb } from "../db/users/collection";
import { MapDb } from "../db/maps/collection";
import useSave from "./save/useSave";

const useUser = () => {
	const dispatch = useDispatch();
	const session = useSession();
	const email = session.data?.user?.email;
	const mapId = useSelector((state: RootState) => state.Global.id);
	const { folderStructure, loadedFolder } = useSelector((state: RootState) => state.user);
	const folderStructureHasBeenFilled = useRef(false);
	const lastFolderIdDone = useRef("");
	const { loadNewMapWithoutSave } = useSave();

	useEffect(() => {
		const main = async () => {
			if (!loadedFolder || lastFolderIdDone.current === loadedFolder.id) return;
			// Find the first map in the folder
			const mapItem = findMapWithLowestSumOfIndices(loadedFolder.children);
			if (!mapItem) return;
			try {
				const oldMapId = mapId;
				const mapData = (await axios.get(`/api/mongodb/maps/getMapById?id=${mapItem.id}`)).data as MapDb;
				loadNewMapWithoutSave(mapData);
				lastFolderIdDone.current = loadedFolder.id;
				try {
					(await axios.get(`/api/mongodb/maps/getMapById?id=${oldMapId}`)).data;
				} catch (e) {
					dispatch(removeUserFolderStructureItem(oldMapId));
				}
			} catch (error) {
				dispatch(setPopup({ message: "Une erreur est survenue lors du chargement de la map", type: "error" }));
			}
		};
		main();
	}, [dispatch, loadNewMapWithoutSave, loadedFolder, mapId]);

	useEffect(() => {
		const main = async () => {
			if (!email || !loadedFolder?.id) return;
			try {
				const userDb = (await axios.get(`/api/mongodb/users/getUserByFolderId?folderId=${loadedFolder.id}`))
					.data as UserDb;
				if (userDb.email === email) dispatch(setUserLoadedFolder(null));
			} catch (error) {}
		};
		main();
	}, [dispatch, email, loadedFolder?.id]);

	const saveFolderDb = useCallback(
		async (folderStructureRemaining: FolderStructureItem[]) => {
			for (const item of folderStructureRemaining) {
				if (isMapItem(item)) continue;
				if (item.type === "folder") {
					try {
						await axios.post("/api/mongodb/folders/saveFolder", {
							email,
							folder: { lastUpdate: dayjs().unix(), name: item.name, id: item.id, children: item.children },
						} as {
							email: string;
							folder: FolderDb;
						});
					} catch (error) {
						dispatch(setPopup({ message: "Sauvegarde des dossiers ratée", type: "error" }));
					}
				}
				await saveFolderDb(item.children);
			}
		},
		[dispatch, email]
	);

	useEffect(() => {
		const main = async () => {
			if (!folderStructureHasBeenFilled.current || !email) return;
			try {
				await axios.post("/api/mongodb/users/setFolderStructure", { email, folderStructure });
				await saveFolderDb(folderStructure);
			} catch (error) {
				dispatch(setPopup({ message: "Sauvegarde des fichiers ratée", type: "error" }));
			}
		};
		if (!folderStructureHasBeenFilled.current && folderStructure.length > 0)
			folderStructureHasBeenFilled.current = true;
		main();
	}, [folderStructure, email, dispatch, saveFolderDb]);

	useEffect(() => {
		const main = async () => {
			const res = findFolderStructureItemPath(mapId, folderStructure);
			if (res === null) {
				let canBeHisMap = false;
				try {
					const mapOwner = (await axios.get(`/api/mongodb/users/getUserByMapId?mapId=${mapId}`)).data as UserDb;
					if (mapOwner.email === email) canBeHisMap = true;
				} catch (error) {
					canBeHisMap = true;
				}
				if (canBeHisMap) dispatch(concatUserFolderStructure([{ id: mapId, name: null, type: "map" }]));
			}
		};
		main();
	}, [dispatch, email, folderStructure, mapId]);
};

export default useUser;
