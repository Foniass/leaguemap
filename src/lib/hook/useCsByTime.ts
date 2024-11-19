import { csByTime } from "@/src/lib/utils";
import { useEffect, useState } from "react";
import useTab from "./useTab";

const useCsByTime = () => {
	const { timestampToDisplay } = useTab();

	const [calculatedWave, setCalculatedWave] = useState<number>(1);
	const [calculatedCs, setCalculatedCs] = useState<number>(0);

	useEffect(() => {
		const { wave, canon, melee, range } = csByTime(timestampToDisplay);
		setCalculatedWave(wave);
		setCalculatedCs(canon + melee + range);
	}, [timestampToDisplay]);

	return { wave: calculatedWave, cs: calculatedCs };
};

export default useCsByTime;
