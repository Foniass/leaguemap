import { Camp, CampsData, Side } from "@/src/lib/types/types";
import { initCampsData, loadImg } from "@/src/lib/utils";
import { Vector2d } from "konva/lib/types";
import { useEffect, useState } from "react";

const useSimulationLayer = () => {
	const [bootsImage, setBootsImage] = useState<undefined | HTMLImageElement>(undefined);

	useEffect(() => {
		loadImg("/stats/ms.webp", (img) => {
			setBootsImage(img);
		});
	}, []);

	// TOOLTIP TO KILL ENEMY JUNGLER
	const [tooltip, setTooltip] = useState<
		CampsData<{ inCamp: boolean | null; inTooltip: boolean | null; x: number; y: number }>
	>(initCampsData({ inCamp: false, inTooltip: false, x: 0, y: 0 }));

	const handleMouseEnter = (camp: Camp, campSide: Side, type: "inCamp" | "inTooltip", pos?: Vector2d) => {
		setTooltip((prevTooltip) => ({
			...prevTooltip,
			[campSide]: {
				...prevTooltip[campSide],
				[camp]: {
					...prevTooltip[campSide][camp],
					[type]: true,
					...(pos !== undefined && { x: pos.x, y: pos.y }),
				},
			},
		}));
	};

	const handleMouseLeave = (camp: Camp, campSide: Side, type: "inCamp" | "inTooltip") => {
		setTooltip((prevTooltip) => ({
			...prevTooltip,
			[campSide]: {
				...prevTooltip[campSide],
				[camp]: {
					...prevTooltip[campSide][camp],
					[type]: null,
				},
			},
		}));

		setTimeout(() => {
			setTooltip((prevTooltip) => {
				if (prevTooltip[campSide][camp][type] === null) {
					return {
						...prevTooltip,
						[campSide]: {
							...prevTooltip[campSide],
							[camp]: {
								...prevTooltip[campSide][camp],
								[type]: false,
							},
						},
					};
				}
				return prevTooltip;
			});
		}, 300);
	};
	return { tooltip, handleMouseEnter, handleMouseLeave, bootsImage };
};

export default useSimulationLayer;
