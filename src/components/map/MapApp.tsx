"use client";

import { FC } from "react";
import MapCanvas from "./MapCanvas";
import MapSidebar from "./mapSidebar/MapSidebar";
import Sidebar from "./Sidebar/Sidebar";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "@/src/lib/redux/store";
import MapButtons from "./MapButtons";
import Popup from "../ui/Popup";
import { FolderStructureItem } from "@/src/lib/types/types";

interface MapAppProps {
	className?: string;
	folderStructure: FolderStructureItem[];
}

const MapApp: FC<MapAppProps> = ({ className, folderStructure }) => {
	return (
		<SessionProvider>
			<Provider store={store}>
				<Popup />
				<Sidebar
					className="w-[19rem] m-1 border border-white rounded-xl flex-shrink-0 flex-grow-0"
					folderStructure={folderStructure}
				/>
				<MapButtons className="w-[3rem] my-4 ml-2 mr-1 flex-shrink-0 flex-grow-0" />

				<div className="flex-grow-0 flex-shrink-0 h-full p-2 aspect-square">
					<MapCanvas className="w-full h-full" />
				</div>
				<MapSidebar className="min-w-[26rem] flex-grow mb-2 mx-2 mt-1" />
			</Provider>
		</SessionProvider>
	);
};

export default MapApp;
