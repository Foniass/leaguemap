import { FC } from "react";

interface EraserProps {
	width?: number;
	className?: string;
}

const Eraser: FC<EraserProps> = ({ className, width }) => {
	return (
		<svg
			version="1.1"
			id="Layer_1"
			xmlns="http://www.w3.org/2000/svg"
			x="0px"
			y="0px"
			viewBox="0 0 122.88 103.38"
			width={width}
			className={className}
		>
			<path
				d="M27.66,93.53h32.49l9.1-9.08c1.4-1.4,1.41-3.7,0.01-5.1l-27.02-27.1c-1.4-1.4-3.7-1.41-5.1-0.01L14.3,75.03 c-1.41,1.4-1.41,3.7-0.01,5.1L27.66,93.53L27.66,93.53z M71.03,93.53h51.84v9.85H61.16H50.28h-12.8H25.7h-0.35L1.05,79.01 c-1.4-1.4-1.4-3.7,0.01-5.1L74.11,1.05c1.41-1.4,3.7-1.4,5.1,0.01l39.62,39.72c1.4,1.4,1.4,3.7-0.01,5.1L71.03,93.53L71.03,93.53z"
				fill="#ffffff"
			/>
		</svg>
	);
};

export default Eraser;
