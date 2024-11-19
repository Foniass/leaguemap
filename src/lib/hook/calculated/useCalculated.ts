import { useEffect } from "react";
import useGame from "./useGame";
import useReview from "./useReview";
import useSimulation from "./useSimulation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/lib/redux/store";
import { tabsData } from "@/src/lib/values/values";
import { setGlobalSidebarTab } from "@/src/lib/redux/mapSlice/globalSlice";

const useCalculated = () => {
	useGame();
	useReview();
	useSimulation();

	const dispatch = useDispatch();

	const { mapTab, sidebarTab } = useSelector((state: RootState) => state.Global);

	useEffect(() => {
		const tabData = tabsData[mapTab];
		if (!tabData.usableSidebarTabs.includes(sidebarTab)) {
			dispatch(setGlobalSidebarTab(tabData.defaultSidebarTab));
		}
	}, [dispatch, mapTab, sidebarTab]);
};

export default useCalculated;
