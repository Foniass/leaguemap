"use client";

import useSave from "@/src/lib/hook/save/useSave";
import { FC, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/lib/redux/store";
import { ArrowPathIcon, DocumentPlusIcon, FolderPlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import FileExplorerItem from "./FileExplorerItem";
import { setUserFolderStructure, setUserLoadedFolder } from "@/src/lib/redux/userSlice";
import { v4 } from "uuid";
import { setPopup } from "@/src/lib/redux/popupSlice";
import { FolderItem } from "@/src/lib/types/types";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FolderDb } from "@/src/lib/db/folders/collection";
import axios from "axios";
import dayjs from "dayjs";
import useValidationModal from "@/src/lib/hook/useValidationModal";
import useDbDelete from "@/src/lib/hook/useDbDelete";

interface FileExplorerProps {
	className?: string;
}

const FileExplorer: FC<FileExplorerProps> = ({ className }) => {
	const dispatch = useDispatch();
	const { loadNewMap } = useSave();

	const session = useSession();

	const { deleteFolderStructureItemFromDb } = useDbDelete();

	const { folderStructure, loadedFolder } = useSelector((state: RootState) => state.user);

	const [isLoading, setIsLoading] = useState(false);

	const handleNewMap = useCallback(async () => {
		if (isLoading) return dispatch(setPopup({ message: "Veuiller patienter", type: "info" }));
		setIsLoading(true);
		await loadNewMap();
		setIsLoading(false);
	}, [dispatch, isLoading, loadNewMap]);

	const handleNewFolder = useCallback(async () => {
		if (isLoading) return dispatch(setPopup({ message: "Veuiller patienter", type: "info" }));
		setIsLoading(true);
		const newFolder: FolderItem = { id: v4(), name: null, type: "folder", children: [], isOpen: false };
		try {
			await axios.post("/api/mongodb/folders/saveFolder", {
				folder: { ...newFolder, lastUpdate: dayjs().unix() },
				email: session.data?.user?.email,
			} as { folder: FolderDb });
			dispatch(setUserFolderStructure([...folderStructure, newFolder]));
		} catch (e) {
			dispatch(setPopup({ message: "Erreur lors de la création du dossier", type: "error" }));
		}
		setIsLoading(false);
	}, [dispatch, folderStructure, isLoading, session.data?.user?.email]);

	const handleCloseLoadedFolder = useCallback(async () => {
		if (isLoading) return dispatch(setPopup({ message: "Veuiller patienter", type: "info" }));
		setIsLoading(true);
		dispatch(setUserLoadedFolder(null));
		await loadNewMap(undefined, { onlyGlobal: true, nopresave: true });
		setIsLoading(false);
	}, [dispatch, isLoading, loadNewMap]);

	const handleResetFolderStrucutre = useCallback(async () => {
		if (isLoading) return dispatch(setPopup({ message: "Veuiller patienter", type: "info" }));
		setIsLoading(true);
		try {
			await axios.post("/api/mongodb/users/setFolderStructure", {
				email: session.data?.user?.email,
				folderStructure: [],
			});
			const savedFolderStructure = JSON.parse(JSON.stringify(folderStructure)) as typeof folderStructure;
			dispatch(setUserFolderStructure([]));
			for (const folderStructureItemToDelete of savedFolderStructure) {
				try {
					await deleteFolderStructureItemFromDb(folderStructureItemToDelete);
				} catch (e) {}
			}
		} catch (e) {
			dispatch(setPopup({ message: "Erreur lors de la suppression des dossiers/maps", type: "error" }));
		}
		setIsLoading(false);
	}, [deleteFolderStructureItemFromDb, dispatch, folderStructure, isLoading, session.data?.user?.email]);

	const { Modal, setIsModalOpen } = useValidationModal(
		`Voulez-vous supprimer tous vos dossiers/maps ?`,
		handleResetFolderStrucutre
	);

	if (loadedFolder)
		return (
			<div className={className}>
				<div className="flex flex-col h-full">
					<h1 className="p-1 text-2xl font-extrabold text-center">{loadedFolder.name ?? "Maps Chargées"}</h1>

					{/* FOLDER STRUCTURE ACTIONS */}
					<div className="flex justify-between px-2">
						<div className="flex gap-2">
							<button type="button" onClick={handleCloseLoadedFolder} className="hover-zoom-110">
								<XMarkIcon className={"w-6"} />
							</button>
						</div>
						<ArrowPathIcon className={`w-6 animate-spin ${!isLoading ? "stopped" : ""}`} />
					</div>

					{loadedFolder.children.length === 0 ? (
						<div className="flex flex-col justify-center h-full text-xl font-extrabold text-center">
							<p>Aucune Map dans ce dossier</p>
						</div>
					) : (
						<>
							{/* FOLDER STRUCTURE */}
							<div className="flex-grow mt-2 overflow-auto border-b border-white custom-scrollbar">
								<div className="flex flex-col mx-2 ">
									<DndProvider backend={HTML5Backend}>
										{loadedFolder.children.map((folderStructureItem) => (
											<FileExplorerItem
												key={folderStructureItem.id}
												folderStructureItem={folderStructureItem}
												isLoading={isLoading}
												setIsLoading={setIsLoading}
												isLoaded={true}
											/>
										))}
									</DndProvider>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		);

	return (
		<div className={className}>
			<div className="flex flex-col h-full">
				<h1 className="p-1 text-2xl font-extrabold text-center">Maps Sauvegardées</h1>
				{!session.data?.user?.email ? (
					<p className="pt-6 text-xl font-bold text-center">Vous devez être connecté pour sauvegarder des maps</p>
				) : (
					<>
						{/* FOLDER STRUCTURE ACTIONS */}
						<div className="flex justify-between px-2">
							<div className="flex gap-2">
								<button type="button" onClick={handleNewMap} className="hover-zoom-110">
									<DocumentPlusIcon className={"w-6"} />
								</button>
								<button type="button" onClick={handleNewFolder} className="hover-zoom-110">
									<FolderPlusIcon className={"w-6"} />
								</button>
							</div>
							<div className="flex gap-2">
								<button type="button" onClick={() => setIsModalOpen(true)} className="hover-zoom-110">
									<TrashIcon className={"w-6"} />
								</button>
								<ArrowPathIcon className={`w-6 animate-spin ${!isLoading ? "stopped" : ""}`} />
							</div>
						</div>

						{folderStructure.length === 0 ? (
							<div className="flex flex-col justify-center h-full text-xl font-extrabold text-center">
								<p>Aucune Map sauvegardée</p>
							</div>
						) : (
							<>
								{/* FOLDER STRUCTURE */}
								<div className="flex-grow mt-2 overflow-auto border-b border-white custom-scrollbar">
									<div className="flex flex-col mx-2 ">
										<DndProvider backend={HTML5Backend}>
											{folderStructure.map((folderStructureItem) => (
												<FileExplorerItem
													key={folderStructureItem.id}
													folderStructureItem={folderStructureItem}
													isLoading={isLoading}
													setIsLoading={setIsLoading}
												/>
											))}
										</DndProvider>
									</div>
								</div>
							</>
						)}
					</>
				)}
			</div>
			{Modal}
		</div>
	);
};

export default FileExplorer;
