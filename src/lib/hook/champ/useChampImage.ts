import { getChampionDataById, loadImg, setGrayscaleFilterKonva } from "@/src/lib/utils";
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import useTab from "../useTab";
import { Lane, Side } from "@/src/lib/types/types";
import { RootState } from "@/src/lib/redux/store";
import { useSelector } from "react-redux";

const useChampImage = (champKey: string | null, lane: Lane, side: Side) => {
	const {
		champs: { respawnsTimes },
	} = useTab();

	const { championsData, version } = useSelector((state: RootState) => state.riot);

	const [champImage, setChampImage] = useState<HTMLImageElement | null>(null);
	const [fillPatternOffset, setFillPatternOffset] = useState({ x: 0, y: 0 });

	const champImageRef = useRef<Konva.Circle>(null);

	useEffect(() => {
		if (champKey) {
			const champData = getChampionDataById(championsData, champKey);
			champData &&
				version &&
				loadImg(`https://ddragon.leagueoflegends.com/cdn/${version}/img/sprite/${champData.image.sprite}`, (img) => {
					setChampImage((prev) => img);
					setFillPatternOffset({
						x: champData.image.x + champData.image.w / 2,
						y: champData.image.y + champData.image.h / 2,
					});
					setGrayscaleFilterKonva(champImageRef.current, !!respawnsTimes[side][lane]);
				});
		} else {
			loadImg(`/roles/${lane}.webp`, (img) => {
				setChampImage((prev) => img);
				setFillPatternOffset({ x: 64, y: 64 });
				setGrayscaleFilterKonva(champImageRef.current, !!respawnsTimes[side][lane]);
			});
		}
	}, [champKey, championsData, lane, respawnsTimes, side, version]);

	return { champImage, fillPatternOffset, champImageRef };
};

export default useChampImage;
