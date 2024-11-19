import { CSSProperties, ReactNode, forwardRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/src/lib/redux/store";
import { getChampionDataById } from "@/src/lib/utils";

interface SpriteImageProps {
	type: "champion" | "item";
	id: string;
	className?: string;
	onClick?: () => void;
	imageData?: {
		x: number;
		y: number;
		w: number;
		h: number;
		sprite: string;
	};
	name?: string;
	borderColor?: string;
	style?: CSSProperties;
	children?: ReactNode;
}

const SpriteImage = forwardRef<HTMLDivElement, SpriteImageProps>((props, ref) => {
	const { id, className, onClick, imageData, type, name, borderColor, style, children } = props;

	const { version, championsData, itemsData } = useSelector((state: RootState) => state.riot);

	let data: any = null;
	if (!imageData || !name) {
		switch (type) {
			case "champion":
				data = getChampionDataById(championsData, id);
				break;
			case "item":
				data = itemsData?.[id];
				break;
		}
	} else {
		data = {
			image: imageData,
			name,
		};
	}

	if (!data) return <></>;

	const imageStyle = {
		backgroundImage: `url(${
			version && `https://ddragon.leagueoflegends.com/cdn/${version}/img/sprite/${data.image.sprite}`
		})`,
		backgroundPosition: `-${data.image.x}px -${data.image.y}px`,
		width: `${data.image.w}px`,
		height: `${data.image.h}px`,
		borderColor: `${borderColor}`,
		...style,
	};

	return (
		<div ref={ref} className={className} style={imageStyle} role="img" aria-label={data.name} onClick={onClick}>
			{children}
		</div>
	);
});

SpriteImage.displayName = "SpriteImage";

export default SpriteImage;
