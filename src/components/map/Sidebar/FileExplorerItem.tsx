import { MapDb } from "@/src/lib/db/maps/collection";
import useSave from "@/src/lib/hook/save/useSave";
import { setPopup } from "@/src/lib/redux/popupSlice";
import { RootState } from "@/src/lib/redux/store";
import {
	moveUserFolderStructureItems,
	removeUserFolderStructureItem,
	renameUserFolderStructureItem,
	setUserFolderStructure,
	swapUserFolderItemOpenStatues,
} from "@/src/lib/redux/userSlice";
import { FolderStructureItem, isFolderItem, isMapItem } from "@/src/lib/types/types";
import { FolderIcon, FolderOpenIcon, MapIcon, PencilIcon, ShareIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { usePathname } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { editFolderStructureWithDirection } from "@/src/lib/utils";
import {
	defaultGameState,
	defaultGlobalState,
	defaultReviewState,
	defaultSimulationState,
} from "@/src/lib/values/initReduxValues";
import dayjs from "dayjs";
import useSafeKeyDown from "@/src/lib/hook/useSafeKeyDown";
import useValidationModal from "@/src/lib/hook/useValidationModal";
import useDbDelete from "@/src/lib/hook/useDbDelete";

interface FileExplorerItemProps {
	folderStructureItem: FolderStructureItem;
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
	deepLevel?: number;
	isLoaded?: boolean;
}

const FileExplorerItem: FC<FileExplorerItemProps> = ({
	folderStructureItem,
	isLoading,
	setIsLoading,
	deepLevel = 0,
	isLoaded = false,
}) => {
	const { id, name, type } = folderStructureItem;

	const dispatch = useDispatch();

	const { loadNewMap, saveCurrentMap } = useSave();

	const pathname = usePathname();

	const { deleteFolderStructureItemFromDb } = useDbDelete();

	const { Modal, setIsModalOpen } = useValidationModal(
		`Voulez-vous supprimer ${type === "folder" ? "ce dossier" : "cette map"} ?`,
		async () => {
			setIsLoading(true);
			dispatch(removeUserFolderStructureItem(id));
			try {
				await deleteFolderStructureItemFromDb(folderStructureItem);
			} catch (e) {}
			setIsLoading(false);
		}
	);

	const currentFolderStructure = useSelector((state: RootState) => state.user.folderStructure);
	const currentMapId = useSelector((state: RootState) => state.Global.id);

	const [isHover, setIsHover] = useState(false);
	const [wantChangeName, setWantChangeName] = useState(false);

	const spanRef = useRef<HTMLSpanElement | null>(null);

	const [{ isDragging }, drag] = useDrag(() => ({
		type: "folderStructureItem",
		item: { id },
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
	}));

	const [{ isOver }, drop] = useDrop(() => ({
		accept: "folderStructureItem",
		drop: (item: { id: string }, monitor) => handleDrop(item.id, id),
		collect: (monitor) => ({
			isOver: !!monitor.isOver(),
		}),
	}));

	const handleDrop = useCallback(
		(itemMovedId: string, movedToItemId: string) => {
			if (itemMovedId !== movedToItemId) dispatch(moveUserFolderStructureItems({ itemMovedId, movedToItemId }));
		},
		[dispatch]
	);

	const changeItemName = useCallback(
		async (newName: string) => {
			dispatch(renameUserFolderStructureItem({ id, newName }));
		},
		[dispatch, id]
	);

	const handleOpen = useCallback(async () => {
		if (isLoading) return dispatch(setPopup({ message: "Veuiller patienter", type: "info" }));
		if (isMapItem(folderStructureItem)) {
			if (id === currentMapId) return;
			setIsLoading(true);

			try {
				const response = await axios.get(`/api/mongodb/maps/getMapById?id=${id}`);
				const mapData = response.data as MapDb;
				if (mapData) await loadNewMap(mapData);
			} catch (error) {
				dispatch(setPopup({ message: "Une erreur est survenue lors du chargement de la map", type: "error" }));
			} finally {
				setIsLoading(false);
			}
		}
		if (isFolderItem(folderStructureItem)) {
			setIsLoading(true);
			dispatch(swapUserFolderItemOpenStatues(id));
			setIsLoading(false);
		}
	}, [currentMapId, dispatch, folderStructureItem, id, isLoading, loadNewMap, setIsLoading]);

	useEffect(() => {
		if (wantChangeName && spanRef.current) {
			const span = spanRef.current;
			span.focus();
			const range = document.createRange();
			range.selectNodeContents(span);
			range.collapse(false);
			const sel = window.getSelection();
			sel?.removeAllRanges();
			sel?.addRange(range);
		}
	}, [wantChangeName]);

	const closeSpan = useCallback(() => {
		if (spanRef.current) changeItemName(spanRef.current.textContent || "Pas de nom");
		setWantChangeName(false);
	}, [changeItemName]);

	const handleKeyDown = useCallback(
		async (e: KeyboardEvent) => {
			if (id !== currentMapId) return;
			if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
			const direction = e.key === "ArrowUp" ? "above" : "bellow";
			if (isLoading) return dispatch(setPopup({ message: "Veuiller patienter", type: "info" }));
			setIsLoading(true);
			let newFolderStrucutre = JSON.parse(JSON.stringify(currentFolderStructure)) as typeof currentFolderStructure;
			const itemToSelect = editFolderStructureWithDirection(id, newFolderStrucutre, direction);
			if (JSON.stringify(newFolderStrucutre) !== JSON.stringify(currentFolderStructure))
				dispatch(setUserFolderStructure(newFolderStrucutre));

			if (itemToSelect) {
				try {
					const response = await axios.get(`/api/mongodb/maps/getMapById?id=${itemToSelect.id}`);
					const mapData = response.data as MapDb;
					if (mapData) {
						await loadNewMap(mapData);
					}
				} catch (error) {
					const newMapDb = {
						lastUpdate: dayjs().unix(),
						Global: { ...defaultGlobalState, id: itemToSelect.id },
						Game: defaultGameState,
						Review: defaultReviewState,
						Simulation: defaultSimulationState,
					};
					await loadNewMap(newMapDb);
				}
			} else {
				dispatch(setPopup({ message: "Une erreur est survenue", type: "error" }));
			}
			setIsLoading(false);
		},
		[currentFolderStructure, currentMapId, dispatch, id, isLoading, loadNewMap, setIsLoading]
	);

	useSafeKeyDown(handleKeyDown);

	const elementRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (elementRef.current) {
			drag(elementRef.current);
			drop(elementRef.current);
		}
	}, [drag, drop]);

	return (
		<>
			<div
				className={`flex justify-between gap-1 p-1 rounded-md     ${
					id === currentMapId
						? " bg-slate-300 bg-opacity-40 hover:cursor-default"
						: "hover:bg-opacity-30 hover:bg-slate-400 hover:cursor-pointer"
				} `}
				onClick={() => {
					if (!isLoaded || type === "map") handleOpen();
				}}
				onMouseEnter={() => setIsHover(true)}
				onMouseLeave={() => setIsHover(false)}
				style={{ marginLeft: `${deepLevel * 0.5}rem` }}
				id={id}
				ref={isLoaded ? undefined : elementRef}
			>
				<div className="flex gap-1 overflow-hidden flex-nowrap">
					{isFolderItem(folderStructureItem) ? (
						folderStructureItem.isOpen || isLoaded ? (
							<FolderOpenIcon className="flex-shrink-0 w-6" />
						) : (
							<FolderIcon className="flex-shrink-0 w-6" />
						)
					) : (
						<MapIcon className="flex-shrink-0 w-6" />
					)}
					{wantChangeName ? (
						<span
							className={"overflow-hidden text-clip whitespace-nowrap underline focus:outline-none"}
							contentEditable={true}
							ref={spanRef}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === "Tab") {
									e.preventDefault();
									closeSpan();
								}
							}}
							onBlur={() => {
								closeSpan();
							}}
							// Display the current value
							suppressContentEditableWarning={true}
						>
							{name ?? ""}
						</span>
					) : (
						<p className="overflow-hidden text-clip whitespace-nowrap">
							{name ?? (isFolderItem(folderStructureItem) ? "Nouveau Dossier" : "Nouvelle map")}
						</p>
					)}
				</div>
				{isHover && !isLoaded && (
					<div className="flex gap-1">
						<button
							type="button"
							className="hover-zoom-110"
							onClick={(e) => {
								e.stopPropagation();
								setWantChangeName(true);
							}}
						>
							<PencilIcon className="w-5 h-5" />
						</button>
						<button
							type="button"
							className="hover-zoom-110"
							onClick={async (e) => {
								e.stopPropagation();
								if (isLoading) return dispatch(setPopup({ message: "Veuiller patienter", type: "info" }));
								if (id === currentMapId)
									return dispatch(setPopup({ message: "Impossible de supprimer la map actuelle", type: "error" }));
								setIsModalOpen(true);
							}}
						>
							<TrashIcon className="w-5 h-5" />
						</button>
						<button
							type="button"
							className="hover-zoom-110"
							onClick={async (e) => {
								e.stopPropagation();
								if (isLoading) return dispatch(setPopup({ message: "Veuiller patienter", type: "info" }));
								saveCurrentMap();
								navigator.clipboard.writeText(
									`${window.location.protocol}//${window.location.hostname}${pathname}?${type}Id=${id}`
								);
								dispatch(setPopup({ type: "success", message: "Lien copié dans le presse-papier !" }));
							}}
						>
							<ShareIcon className="w-5 h-5" />
						</button>
					</div>
				)}
			</div>

			{isFolderItem(folderStructureItem) &&
				(folderStructureItem.isOpen || isLoaded) &&
				folderStructureItem.children.map((folderChildrenItem) => (
					<FileExplorerItem
						key={folderChildrenItem.id}
						folderStructureItem={folderChildrenItem}
						isLoading={isLoading}
						setIsLoading={setIsLoading}
						deepLevel={deepLevel + 1}
					/>
				))}

			{Modal}
		</>
	);
};

export default FileExplorerItem;
