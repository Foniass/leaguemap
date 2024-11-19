import {
	setReviewChampsGolds,
	setReviewChampsLvls,
	setReviewChampsPositions,
	setReviewChampsInventoriesActions,
	setReviewRespawnsTimes,
	setReviewTurretsAlive,
	setReviewTurretsEvents,
} from "@/src/lib/redux/mapSlice/reviewSlice";
import { RootState } from "@/src/lib/redux/store";
import { InventoryAction } from "@/src/lib/types/redux";
import {
	BuildingType,
	LaneType,
	TowerType,
	TurretEvent,
	isLaneType,
	isRiotItemEvent,
	isTeamId,
	isTowerType,
	isTurretEventType,
} from "@/src/lib/types/types";
import {
	deathsDataToRespawnsTimes,
	findSideLaneInObj,
	handleItemEvent,
	initTeamData,
	rotate90DegreesCounterClockwiseInBounds,
	turretsEventsToTurretsAlive,
} from "@/src/lib/utils";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useReview = () => {
	const dispatch = useDispatch();

	const mapTab = useSelector((state: RootState) => state.Global.mapTab);

	const {
		timestampToDisplay,
		matchTimelineDto,
		turretsEvents,
		champs: { participantsIds, deathsData },
	} = useSelector((state: RootState) => state.Review);

	// TurretsEvents
	useEffect(() => {
		if (mapTab !== "Review" || matchTimelineDto === null) return;
		let newTurretsEvents: TurretEvent[] = [];
		matchTimelineDto.info.frames.forEach(({ events }) => {
			events.forEach(({ type, teamId, laneType, buildingType, towerType, timestamp, position, killerId }) => {
				if (!isTurretEventType(type)) return;
				if (teamId === undefined || !isTeamId(teamId)) return;
				let finalBuildingType: BuildingType = "OUTER_TURRET";
				if (type === "BUILDING_KILL") {
					if (buildingType === undefined) return;
					if (buildingType === "TOWER_BUILDING" && (towerType === undefined || !isTowerType(towerType))) return;
					finalBuildingType = buildingType === "TOWER_BUILDING" ? (towerType as TowerType) : "INHIBITOR_BUILDING";
				}
				let finalLaneType: LaneType = "MID_LANE";
				if (laneType === undefined || !isLaneType(laneType)) {
					if (finalBuildingType !== "BASE_TURRET") return;
					if (position?.x === 1748 || position?.x === 12611) finalLaneType = "TOP_LANE";
					else finalLaneType = "BOT_LANE";
				}
				newTurretsEvents.push({
					buildingType: finalBuildingType,
					killerId,
					laneType: finalLaneType,
					teamId,
					timestamp: timestamp / 1000,
					type,
				});
			});
		});
		dispatch(setReviewTurretsEvents(newTurretsEvents));
	}, [dispatch, mapTab, matchTimelineDto]);

	// RespawnsTimes
	useEffect(() => {
		if (mapTab !== "Review") return;
		dispatch(setReviewRespawnsTimes(deathsDataToRespawnsTimes(deathsData, timestampToDisplay)));
	}, [deathsData, dispatch, mapTab, timestampToDisplay]);

	// Golds & Lvls & Positions & Items
	useEffect(() => {
		if (mapTab !== "Review" || !matchTimelineDto) return;

		const frame =
			matchTimelineDto.info.frames[Math.floor((timestampToDisplay * 1000) / matchTimelineDto.info.frameInterval)];
		if (frame === undefined) return;
		let newChampsLvls = initTeamData(1);
		let newChampsPositions = initTeamData({ x: 0, y: 0 });
		let newChampsGolds = initTeamData(0);
		let newChampsInventoriesActions = initTeamData<InventoryAction[]>([]);
		for (const participantId in frame.participantFrames) {
			const res = findSideLaneInObj(participantsIds, parseInt(participantId));
			if (res === undefined) continue;
			const { side, lane } = res;

			const participantData = frame.participantFrames[participantId];
			if (participantData === undefined) continue;

			newChampsLvls[side][lane] = participantData.level ?? 1;
			const pos = rotate90DegreesCounterClockwiseInBounds(participantData.position);
			newChampsPositions[side][lane] = pos;
			newChampsGolds[side][lane] = participantData.currentGold ?? 0;
		}
		matchTimelineDto.info.frames.forEach(({ events }) => {
			events.forEach(({ type, timestamp, beforeId, itemId, participantId }) => {
				if (isRiotItemEvent(type))
					handleItemEvent(
						participantId,
						type,
						type === "ITEM_UNDO" ? beforeId : itemId,
						timestamp,
						participantsIds,
						newChampsInventoriesActions,
						timestampToDisplay
					);
			});
		});
		dispatch(setReviewChampsInventoriesActions(newChampsInventoriesActions));
		dispatch(setReviewChampsPositions(newChampsPositions));
		dispatch(setReviewChampsLvls(newChampsLvls));
		dispatch(setReviewChampsGolds(newChampsGolds));
	}, [dispatch, mapTab, matchTimelineDto, participantsIds, timestampToDisplay]);

	// TurretsAlive
	useEffect(() => {
		if (mapTab !== "Game") return;
		dispatch(setReviewTurretsAlive(turretsEventsToTurretsAlive(turretsEvents, timestampToDisplay)));
	}, [dispatch, mapTab, timestampToDisplay, turretsEvents]);
};

export default useReview;
