"use client";

import { FC, useCallback, useState } from "react";
import Modal from "react-modal";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/lib/redux/store";

import MapSettings from "@/src/components/map/MapSettings";
import MapToolButton from "@/src/components/map/MapToolButton";

import {
	TrashIcon,
	PencilIcon,
	CursorArrowRaysIcon,
	EyeIcon,
	EyeSlashIcon,
	ArrowUturnLeftIcon,
	ArrowUturnRightIcon,
	LightBulbIcon,
	Cog6ToothIcon,
	SunIcon,
	ArrowUpRightIcon,
	ArrowPathIcon,
	RectangleGroupIcon,
} from "@heroicons/react/24/outline";

import { capitalizeFirstLetter } from "@/src/lib/utils";
import useDrawCommand from "@/src/lib/hook/useDrawCommand";
import useConnectionModal from "@/src/lib/hook/useConnectionModal";
import { Region, linesColors } from "@/src/lib/types/types";
import useGlobalTab from "@/src/lib/hook/useGlobalTab";
import {
	resetGlobalCurrentTab,
	setGlobalDrawMode,
	setGlobalLastClickedButton,
	setGlobalLineColorIndex,
} from "@/src/lib/redux/mapSlice/globalSlice";
import { resetSimulation } from "@/src/lib/redux/mapSlice/simulationSlice";
import { modalStyle } from "@/src/lib/values/values";
import Eraser from "../ui/Icon/Eraser";

const iconClass = "w-9 h-9";

const hoverClass = "hover-zoom-110 z-20";

const regionNames: Region[] = ["jungle", "laningphase", "proxy", "river"];

interface MapButtonsProps {
	className?: string;
}

const MapButtons: FC<MapButtonsProps> = ({ className }) => {
	const dispatch = useDispatch();

	const { lines, arrows, wards, regions, wantVision, wantRegions } = useGlobalTab();

	const { mapTab, lastClickedButton, drawMode, lineColorIndex } = useSelector((state: RootState) => state.Global);

	const [isRegionButtonHovered, setIsRegionButtonHovered] = useState(false);
	const [isDrawButtonHovered, setIsDrawButtonHovered] = useState(false);
	const [isResetButtonHovered, setIsResetButtonHovered] = useState(false);
	const [modalIsOpen, setIsOpen] = useState(false);

	const [exec, undo, redo] = useDrawCommand();

	const [modalBinds, checkConnectedBinds] = useConnectionModal(
		"Vous devez être connecté pour définir des touches pour certaines actions !"
	);

	const openSettings = () => {
		setIsOpen(true);
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	const selectRegion = useCallback(
		(regionName: Region) => {
			if (regions.find((regionToFind) => regionToFind === regionName))
				exec({ type: "removeRegion", region: regionName, regions });
			else exec({ type: "addRegion", region: regionName, regions });
		},
		[exec, regions]
	);

	return (
		<>
			<div className={`grid grid-cols-1 ${className}`}>
				<div className="flex flex-col items-center justify-start gap-2 ">
					<MapToolButton
						onClick={() => dispatch(setGlobalLastClickedButton("cursor/modify"))}
						className={`${lastClickedButton === "cursor/modify" ? "bg-gray-600" : ""}  ${hoverClass}`}
						tooltipText="Déplacer / Sélectionner"
					>
						<CursorArrowRaysIcon className={iconClass} />
					</MapToolButton>

					<MapToolButton
						onClick={() => dispatch(setGlobalLastClickedButton("select"))}
						className={`${lastClickedButton === "select" ? "bg-gray-600" : ""}  ${hoverClass}`}
						tooltipText="Supprimer des regroupement de champions"
					>
						<RectangleGroupIcon className={iconClass} />
					</MapToolButton>

					<MapToolButton
						onMouseEnter={() => setIsDrawButtonHovered(true)}
						onMouseLeave={() => setIsDrawButtonHovered(false)}
						onClick={() => dispatch(setGlobalLastClickedButton("draw/eraser"))}
						className={`${lastClickedButton === "draw/eraser" ? "bg-gray-600" : ""}  ${hoverClass}`}
						hoverButtons={
							isDrawButtonHovered && (
								<div className="absolute z-20 flex transform -translate-y-1.5 left-full h-12">
									<button
										className="p-1 border-2 rounded-lg bg-mainbg"
										onClick={(e) => {
											e.stopPropagation();
											dispatch(setGlobalDrawMode(drawMode === "arrow" ? "line" : "arrow"));
											dispatch(setGlobalLastClickedButton("draw/eraser"));
										}}
									>
										{drawMode === "arrow" ? (
											<PencilIcon className={iconClass} />
										) : (
											<ArrowUpRightIcon className={iconClass} />
										)}
									</button>
								</div>
							)
						}
						tooltipText="Clic Gauche: Dessiner Clic Droit: Effacer"
					>
						{drawMode === "arrow" ? <ArrowUpRightIcon className={iconClass} /> : <PencilIcon className={iconClass} />}
						<Eraser className={iconClass} />
						<div
							className={`absolute w-3 h-3 border`}
							style={{ background: linesColors[lineColorIndex] }}
							onClick={() => dispatch(setGlobalLineColorIndex(((lineColorIndex + 1) % 4) as 0 | 1 | 2 | 3))}
						></div>
					</MapToolButton>

					<MapToolButton
						onClick={() => dispatch(setGlobalLastClickedButton("ward"))}
						className={`${lastClickedButton === "ward" ? "bg-gray-600" : ""}  ${hoverClass}`}
						tooltipText="Clic Gauche: Ward Clic Droit: Pink"
					>
						<EyeIcon className={iconClass} />
						<EyeSlashIcon className={iconClass} />
					</MapToolButton>

					<MapToolButton
						onClick={() => exec({ type: "wantVision", wantVision })}
						tooltipText="Afficher les visions"
						className={`${wantVision ? "bg-gray-600" : ""}  ${hoverClass}`}
					>
						<SunIcon className={iconClass} />
					</MapToolButton>

					<MapToolButton
						onMouseEnter={() => setIsRegionButtonHovered(true)}
						onMouseLeave={() => setIsRegionButtonHovered(false)}
						onClick={() => exec({ type: "wantRegions", wantRegions })}
						tooltipText="Afficher les zones"
						className={`${wantRegions ? "bg-gray-600" : ""}  ${hoverClass}`}
						hoverButtons={
							isRegionButtonHovered && (
								<div className="absolute z-20 flex transform -translate-y-1.5 left-full h-12">
									{regionNames.map((regionName) => (
										<button
											key={regionName}
											className={`p-1 border-2 rounded-lg  ${
												regions.includes(regionName) ? "bg-gray-600" : "bg-mainbg"
											}`}
											onClick={(e) => {
												e.stopPropagation();
												selectRegion(regionName);
											}}
										>
											{capitalizeFirstLetter(regionName)}
										</button>
									))}
								</div>
							)
						}
					>
						<LightBulbIcon className={iconClass} />
					</MapToolButton>

					<MapToolButton
						onMouseEnter={() => setIsResetButtonHovered(true)}
						onMouseLeave={() => setIsResetButtonHovered(false)}
						onClick={() => exec({ type: "resetDrawing", lines, arrows, wards })}
						className={`${hoverClass}`}
						hoverButtons={
							isResetButtonHovered && (
								<div className="absolute z-20 flex transform -translate-y-1.5 left-full h-12">
									<button
										className="p-1 border-2 rounded-lg bg-mainbg"
										onClick={(e) => {
											e.stopPropagation();
											if (mapTab !== "Review") dispatch(resetGlobalCurrentTab());
											if (mapTab === "Simulation") dispatch(resetSimulation());
										}}
									>
										<ArrowPathIcon className={iconClass} />
									</button>
								</div>
							)
						}
						tooltipText="Tout effacer ou Réinitialiser"
					>
						<TrashIcon className={iconClass} />
					</MapToolButton>
				</div>
				<div className="flex flex-col items-center justify-end gap-2">
					<MapToolButton onClick={undo} tooltipText="Annuler" className={hoverClass}>
						<ArrowUturnLeftIcon className={iconClass} />
					</MapToolButton>

					<MapToolButton onClick={redo} tooltipText="Rétablir" className={hoverClass}>
						<ArrowUturnRightIcon className={iconClass} />
					</MapToolButton>

					<MapToolButton
						onClick={() => {
							openSettings();
						}}
						tooltipText="Paramètres"
						className={hoverClass}
					>
						<Cog6ToothIcon className={iconClass} />
					</MapToolButton>
					{modalBinds}
				</div>
			</div>

			<Modal
				isOpen={modalIsOpen}
				onRequestClose={closeModal}
				contentLabel="Map Sidebar"
				style={modalStyle}
				ariaHideApp={false}
			>
				<MapSettings />
			</Modal>
		</>
	);
};

export default MapButtons;
