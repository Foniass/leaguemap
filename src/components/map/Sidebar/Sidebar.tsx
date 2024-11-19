"use client";

import FilesExplorer from "./FilesExplorer";
import UserHandler from "./UserHandler";
import { FolderStructureItem } from "@/src/lib/types/types";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/lib/redux/store";
import { concatUserFolderStructure } from "@/src/lib/redux/userSlice";
import Closable from "../../ui/Closable";

interface SidebarProps {
	className: string;
	folderStructure: FolderStructureItem[];
}

const Sidebar = ({ className, folderStructure: folderStructureOnLog }: SidebarProps) => {
	const dispatch = useDispatch();

	const folderStructure = useSelector((state: RootState) => state.user.folderStructure);

	useEffect(() => {
		if (JSON.stringify(folderStructure) !== JSON.stringify([folderStructureOnLog]))
			dispatch(concatUserFolderStructure(folderStructureOnLog));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, folderStructureOnLog]);

	return (
		<Closable closedClassName="mr-16">
			<FilesExplorer className="flex-grow mt-4 overflow-hidden" />
			<UserHandler className="p-4" />
		</Closable>
	);
};

export default Sidebar;
