"use client";

import { FC, ReactNode } from "react";
import { Tooltip } from "react-tooltip";

interface MapToolButtonProps {
	children: ReactNode;
	onClick: () => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	className?: string;
	tooltipText?: string;
	hoverButtons?: ReactNode;
}

const MapToolButton: FC<MapToolButtonProps> = ({
	children,
	onClick,
	className,
	tooltipText,
	onMouseEnter,
	onMouseLeave,
	hoverButtons,
}) => {
	return (
		<div>
			<div
				className={`p-1 border-2 rounded-lg flex flex-col gap-1 relative hover-zoom-110 ${className}`}
				onClick={onClick}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				data-tooltip-id="my-tooltip"
				data-tooltip-content={tooltipText}
				data-tooltip-place="left"
				data-tooltip-delay-show={1000}
				data-tooltip-variant="light"
			>
				{children}
				{hoverButtons}
			</div>
			<Tooltip id="my-tooltip" />
		</div>
	);
};

export default MapToolButton;
