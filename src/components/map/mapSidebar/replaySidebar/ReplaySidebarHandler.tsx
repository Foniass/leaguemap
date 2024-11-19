"use client";

import { RootState } from "@/src/lib/redux/store";
import { FC } from "react";
import { useSelector } from "react-redux";
import ReplaySidebar from "./ReplaySidebar";

interface ReplaySidebarHandlerProps {}

const ReplaySidebarHandler: FC<ReplaySidebarHandlerProps> = ({}) => {
	const { matchDto, matchTimelineDto } = useSelector((state: RootState) => state.Review);

	if (matchDto === null || matchTimelineDto === null) {
		return (
			<div className="w-full h-full text-4xl font-bold text-center text-white">
				{"Aucune game n'a été selectionnée"}
			</div>
		);
	}

	return <ReplaySidebar matchTimelineDto={matchTimelineDto} />;
};

export default ReplaySidebarHandler;
