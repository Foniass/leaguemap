"use client";

import useSimulationFct from "@/src/lib/hook/simulation/useSimulationFct";
import useTab from "@/src/lib/hook/useTab";
import { RootState } from "@/src/lib/redux/store";
import { Camp, CampsData, Side, camps, sides } from "@/src/lib/types/types";
import { getChampionDataById, initCampsData, loadImg, setGrayscaleFilterKonva } from "@/src/lib/utils";
import { jungleCampsData } from "@/src/lib/values/values";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { FC, useState, useEffect, useCallback, useRef } from "react";
import { Circle, Text, Group } from "react-konva";
import { useSelector } from "react-redux";

interface JungleCamps {
	tooltip: CampsData<{
		inCamp: boolean | null;
		inTooltip: boolean | null;
		x: number;
		y: number;
	}>;
	handleMouseEnter: (camp: Camp, campSide: Side, type: "inCamp" | "inTooltip", pos?: Vector2d) => void;
	handleMouseLeave: (camp: Camp, campSide: Side, type: "inCamp" | "inTooltip") => void;
}

const JungleCamps: FC<JungleCamps> = ({ tooltip, handleMouseEnter, handleMouseLeave }) => {
	const {
		champs: { ids },
	} = useTab();

	const { version, championsData } = useSelector((state: RootState) => state.riot);
	const champIconSelected = useSelector((state: RootState) => state.Global.champIconSelected);
	const champThatCanDoActions = useSelector((state: RootState) => state.Simulation.champThatCanDoActions);

	const [campsImages, setCampsImages] = useState<Record<Camp, HTMLImageElement | undefined>>({
		Gromp: undefined,
		Blue: undefined,
		Wolfs: undefined,
		Raptors: undefined,
		Red: undefined,
		Krugs: undefined,
		Scuttle: undefined,
	});
	const [swordImage, setSwordImage] = useState<undefined | HTMLImageElement>(undefined);
	const [opponentJunglerImage, setOpponentJunglerImage] = useState<undefined | HTMLImageElement>(undefined);
	const [fillPatternOffset, setFillPatternOffset] = useState({ x: 0, y: 0 });

	const campsCirclesRef = useRef(initCampsData<Konva.Circle | null>(null));

	const { whenCampUp, pathToCamp } = useSimulationFct();

	useEffect(() => {
		jungleCampsData.forEach(({ side, type }) => {
			if (side !== "blue") return;
			loadImg(`/jungle/${type}.webp`, (img) => {
				setCampsImages((prevCampsImages) => ({ ...prevCampsImages, [type]: img }));
			});
		});
	}, []);

	useEffect(() => {
		loadImg("/stats/aa.webp", (img) => {
			setSwordImage(img);
		});
	}, []);

	const setCampGray = useCallback(
		(campCircle: Konva.Circle | null, side: Side, camp: Camp) => {
			setGrayscaleFilterKonva(campCircle, whenCampUp(camp, side) !== 0);
		},
		[whenCampUp]
	);

	useEffect(() => {
		sides.forEach((side) => {
			camps.forEach((campName) => {
				if (campsImages[campName] !== undefined) {
					setCampGray(campsCirclesRef.current[side][campName], side, campName);
				}
			});
		});
	}, [campsImages, setCampGray]);

	useEffect(() => {
		const champId = champIconSelected ? ids[champIconSelected.side === "blue" ? "red" : "blue"].jungle : null;
		if (champId !== null) {
			const champData = getChampionDataById(championsData, champId);
			champData &&
				version &&
				loadImg(`https://ddragon.leagueoflegends.com/cdn/${version}/img/sprite/${champData.image.sprite}`, (img) => {
					setOpponentJunglerImage(img);
					setFillPatternOffset({
						x: champData.image.x + champData.image.w / 2 - 22,
						y: champData.image.y + champData.image.h / 2 - 22,
					});
				});
		} else {
			loadImg(`/roles/jungle.webp`, (img) => {
				setOpponentJunglerImage((prev) => img);
				setFillPatternOffset({ x: -5, y: -5 });
			});
		}
	}, [ids, champIconSelected, version, championsData]);

	return (
		<>
			{jungleCampsData.map(({ side, pos, type }, index) => {
				const campRespawnIn = whenCampUp(type, side);
				const respawnText = Math.floor(campRespawnIn).toString();
				return (
					<>
						<Group
							key={index}
							onMouseEnter={() => handleMouseEnter(type, side, "inCamp", pos)}
							onMouseLeave={() => handleMouseLeave(type, side, "inCamp")}
						>
							<Circle
								id="Camp"
								x={pos.x}
								y={pos.y}
								radius={30}
								fillPatternScale={{ x: 1.3, y: 1.3 }}
								fillPatternOffset={{ x: 20, y: 20 }}
								fillPatternImage={campsImages[type]}
								stroke={"#ffffff"}
								onPointerClick={() => {
									if (
										(!champThatCanDoActions && champIconSelected?.lane === "jungle") ||
										(champThatCanDoActions?.side === champIconSelected?.side &&
											champThatCanDoActions?.lane === champIconSelected?.lane)
									)
										pathToCamp(type, pos, side);
								}}
								ref={(ref) => {
									campsCirclesRef.current[side][type] = ref;
								}}
							/>
							{campRespawnIn !== 0 && (
								<Text
									x={pos.x}
									y={pos.y}
									offsetX={respawnText.length === 3 ? 24 : respawnText.length === 2 ? 18 : 8}
									offsetY={13}
									text={respawnText}
									fontSize={30}
									fontStyle="bold"
									fill={campRespawnIn <= 60 ? "#f5ee1d" : "#ffffff"}
									shadowColor="#000000"
									shadowBlur={10}
									shadowOpacity={1}
									onPointerClick={() => {
										if (
											!champThatCanDoActions ||
											(champThatCanDoActions.side === champIconSelected?.side &&
												champThatCanDoActions.lane === champIconSelected?.lane)
										)
											pathToCamp(type, pos, side);
									}}
								/>
							)}
						</Group>

						{/* {(tooltip[side][type].inCamp !== false || tooltip[side][type].inTooltip !== false) &&
						canKillOnCamps[side][type] ? (
							<Group
								x={tooltip[side][type].x - 30}
								y={tooltip[side][type].y - 100}
								onMouseEnter={() => handleMouseEnter(type, side, "inTooltip")}
								onMouseLeave={() => handleMouseLeave(type, side, "inTooltip")}
								onClick={async () => {
									if (!canKillOnCamps[side][type]) return;
									// TODO : Process the kill
									// await killEnemyChamp(pos);
								}}
							>
								<Rect
									offsetX={2}
									offsetY={2}
									width={64}
									height={64}
									cornerRadius={20} // This is what makes the corners rounded
									fill="#ffffff"
								/>
								<Rect
									width={60}
									height={60}
									cornerRadius={20} // This is what makes the corners rounded
									fillPatternImage={opponentJunglerImage}
									fillPatternScale={{
										x:
											1.4 *
											((champIconSelected ? ids[champIconSelected.side === "blue" ? "red" : "blue"].jungle : null)
												? 1
												: 0.3),
										y:
											1.4 *
											((champIconSelected ? ids[champIconSelected.side === "blue" ? "red" : "blue"].jungle : null)
												? 1
												: 0.3),
									}}
									fillPatternOffset={fillPatternOffset}
								/>
								<KonvaImage offsetX={-10} offsetY={-10} width={40} height={40} image={swordImage} />
							</Group>
						) : (
							<></>
						)} */}
					</>
				);
			})}
		</>
	);
};

export default JungleCamps;
