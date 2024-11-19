import { useDispatch, useSelector } from "react-redux";
import { FolderStructureItem, isFolderItem, isMapItem } from "../types/types";
import { RootState } from "../redux/store";
import { useCallback } from "react";
import { concatUserFolderStructure } from "../redux/userSlice";
import axios from "axios";
import { setPopup } from "../redux/popupSlice";
import { useSession } from "next-auth/react";

const useDbDelete = () => {
	const dispatch = useDispatch();

	const session = useSession();
	const email = session.data?.user?.email;

	const currentMapId = useSelector((state: RootState) => state.Global.id);

	const deleteFolderStructureItemFromDb = useCallback(
		async (folderStructureItemToDelete: FolderStructureItem) => {
			if (folderStructureItemToDelete.id === currentMapId)
				return dispatch(concatUserFolderStructure([folderStructureItemToDelete]));
			if (isMapItem(folderStructureItemToDelete)) {
				try {
					await axios.post("/api/mongodb/global/deleteMapById", { email, mapId: folderStructureItemToDelete.id });
				} catch (e) {
					dispatch(setPopup({ message: "Une erreur est survenue lors de la suppression de la map", type: "error" }));
				}
			}
			if (isFolderItem(folderStructureItemToDelete)) {
				try {
					await axios.post("/api/mongodb/folders/deleteFolder", { email, folderId: folderStructureItemToDelete.id });
				} catch (e) {
					dispatch(setPopup({ message: "Une erreur est survenue lors de la suppression du dossier", type: "error" }));
				}
				for (const child of folderStructureItemToDelete.children) {
					await deleteFolderStructureItemFromDb(child);
				}
			}
		},
		[currentMapId, dispatch, email]
	);

	return { deleteFolderStructureItemFromDb };
};

export default useDbDelete;
