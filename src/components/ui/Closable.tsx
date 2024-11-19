"use client";

import { useCallback, useState, FC } from "react";
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "@heroicons/react/24/outline";

interface ClosableProps {
	className?: string;
	children: React.ReactNode;
	openedClassName?: string;
	closedClassName?: string;
	widthClassName?: string;
}

const sidebarButtonClassName =
	"absolute top-1/2 -translate-y-1/2 w-10 -right-5 bg-inherit text-white rounded-full border border-white cursor-pointer z-50";

const Closable: FC<ClosableProps> = ({
	children,
	className,
	openedClassName,
	closedClassName,
	widthClassName = "w-[19rem]",
}) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

	return (
		<div
			className={`bg-sidebarbg border-white rounded-xl flex-shrink-0 flex-grow-0 flex flex-col relative ${className} ${
				isSidebarOpen ? `${widthClassName} ${openedClassName} border m-1` : `max-w-0 border-0 ${closedClassName}`
			}`}
		>
			{isSidebarOpen ? (
				<>
					<ArrowLeftCircleIcon className={sidebarButtonClassName} onClick={toggleSidebar} />
					{children}
				</>
			) : (
				<ArrowRightCircleIcon className={sidebarButtonClassName} onClick={toggleSidebar} />
			)}
		</div>
	);
};

export default Closable;
