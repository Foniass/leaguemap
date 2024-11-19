import {
	ArrowUturnLeftIcon,
	ArrowUturnRightIcon,
	CursorArrowRaysIcon,
	EyeIcon,
	EyeSlashIcon,
	LightBulbIcon,
	PencilIcon,
	RectangleGroupIcon,
	SunIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { Camp, InventoryActionType, MapTab, RiotItemEvent, SidebarTab } from "../types/types";
import { PopupType } from "../types/redux";
import { mainbg } from "../colors";
import Eraser from "@/src/components/ui/Icon/Eraser";

export const modalStyle = {
	overlay: {
		backgroundColor: "rgba(44, 48, 50, 0.5)",
		zIndex: 60,
	},
	content: {
		top: "50%",
		left: "50%",
		right: "auto",
		bottom: "auto",
		marginRight: "-50%",
		transform: "translate(-50%, -50%)",
		backgroundColor: mainbg,
		color: "#ffffff",
		borderRadius: "1.5rem",
	},
};

export const tabsData: Record<MapTab, { defaultSidebarTab: SidebarTab; usableSidebarTabs: SidebarTab[] }> = {
	Game: { defaultSidebarTab: "Champions", usableSidebarTabs: ["Champions", "MatchUp"] },
	Review: { defaultSidebarTab: "Historique", usableSidebarTabs: ["MatchUp", "Historique", "Replay"] },
	Simulation: { defaultSidebarTab: "MatchUp", usableSidebarTabs: ["Champions", "MatchUp"] },
};

export const popupTypeToColor: Record<PopupType, string> = {
	error: "#eb3d34",
	success: "#71ff5e",
	info: "#ffffff",
};

export const riotEventTypeToActionType: Record<RiotItemEvent, InventoryActionType> = {
	ITEM_DESTROYED: "Destroy",
	ITEM_PURCHASED: "Buy",
	ITEM_SOLD: "Sell",
	ITEM_UNDO: "Undo",
} as const;

export const firstCampBonusXp = 150;

export const campsXpGoldFromLvl = {
	Blue: { 1: { xp: 175, gold: 90 } },
	Red: { 1: { xp: 175, gold: 90 } },
	Scuttle: {
		1: { xp: 100, gold: 55 },
		2: { xp: 200, gold: 66 },
		3: { xp: 210, gold: 72 },
		4: { xp: 210, gold: 72 },
		5: { xp: 230, gold: 83 },
		6: { xp: 230, gold: 83 },
		7: { xp: 230, gold: 83 },
		8: { xp: 230, gold: 83 },
		9: { xp: 240, gold: 88 },
		10: { xp: 240, gold: 88 },
		11: { xp: 240, gold: 88 },
		12: { xp: 240, gold: 88 },
		13: { xp: 240, gold: 88 },
		14: { xp: 240, gold: 88 },
		15: { xp: 240, gold: 88 },
		16: { xp: 240, gold: 88 },
		17: { xp: 240, gold: 88 },
		18: { xp: 240, gold: 88 },
	},
	Wolfs: {
		1: { xp: 160, gold: 85 },
		2: { xp: 160, gold: 85 },
		3: { xp: 161, gold: 85 },
		4: { xp: 164, gold: 85 },
		5: { xp: 176, gold: 85 },
		6: { xp: 176, gold: 85 },
		7: { xp: 184, gold: 85 },
		8: { xp: 184, gold: 85 },
		9: { xp: 196, gold: 85 },
		10: { xp: 196, gold: 85 },
		11: { xp: 196, gold: 85 },
		12: { xp: 196, gold: 85 },
		13: { xp: 196, gold: 85 },
		14: { xp: 196, gold: 85 },
		15: { xp: 196, gold: 85 },
		16: { xp: 196, gold: 85 },
		17: { xp: 196, gold: 85 },
		18: { xp: 196, gold: 85 },
	},
	Gromp: {
		1: { xp: 200, gold: 80 },
		2: { xp: 200, gold: 80 },
		3: { xp: 203, gold: 80 },
		4: { xp: 209, gold: 80 },
		5: { xp: 224, gold: 80 },
		6: { xp: 224, gold: 80 },
		7: { xp: 236, gold: 80 },
		8: { xp: 236, gold: 80 },
		9: { xp: 254, gold: 80 },
		10: { xp: 254, gold: 80 },
		11: { xp: 254, gold: 80 },
		12: { xp: 254, gold: 80 },
		13: { xp: 254, gold: 80 },
		14: { xp: 254, gold: 80 },
		15: { xp: 254, gold: 80 },
		16: { xp: 254, gold: 80 },
		17: { xp: 254, gold: 80 },
		18: { xp: 254, gold: 80 },
	},
	Raptors: {
		1: { xp: 150, gold: 75 },
		2: { xp: 150, gold: 75 },
		3: { xp: 152, gold: 75 },
		4: { xp: 156, gold: 75 },
		5: { xp: 162, gold: 75 },
		6: { xp: 162, gold: 75 },
		7: { xp: 169, gold: 75 },
		8: { xp: 169, gold: 75 },
		9: { xp: 177, gold: 75 },
		10: { xp: 177, gold: 75 },
		11: { xp: 177, gold: 75 },
		12: { xp: 177, gold: 75 },
		13: { xp: 177, gold: 75 },
		14: { xp: 177, gold: 75 },
		15: { xp: 177, gold: 75 },
		16: { xp: 177, gold: 75 },
		17: { xp: 177, gold: 75 },
		18: { xp: 177, gold: 75 },
	},
	Krugs: {
		1: { xp: 201, gold: 109 },
		2: { xp: 201, gold: 109 },
		3: { xp: 202, gold: 109 },
		4: { xp: 206, gold: 109 },
		5: { xp: 213, gold: 109 },
		6: { xp: 220, gold: 109 },
		7: { xp: 223, gold: 109 },
		8: { xp: 232, gold: 109 },
		9: { xp: 236, gold: 109 },
		10: { xp: 245, gold: 109 },
		11: { xp: 245, gold: 109 },
		12: { xp: 245, gold: 109 },
		13: { xp: 245, gold: 109 },
		14: { xp: 245, gold: 109 },
		15: { xp: 245, gold: 109 },
		16: { xp: 245, gold: 109 },
		17: { xp: 245, gold: 109 },
		18: { xp: 245, gold: 109 },
	},
} as const;

export const bindButtons = [
	{ action: "cursor", icon1: CursorArrowRaysIcon },
	{ action: "select", icon1: RectangleGroupIcon },
	{ action: "pencil", icon1: PencilIcon, icon2: Eraser },
	{ action: "ward", icon1: EyeIcon, icon2: EyeSlashIcon },
	{ action: "vision", icon1: SunIcon },
	{ action: "region", icon1: LightBulbIcon },
	{ action: "reset", icon1: TrashIcon },
	{ action: "recall" },
	{ action: "undo", keyBind: "ctrl + z", icon1: ArrowUturnLeftIcon },
	{ action: "redo", keyBind: "ctrl + y", icon1: ArrowUturnRightIcon },
];

export const proxyPositions = {
	blue: {
		TOP_LANE: {
			r: { x: 123.51376772082877, y: 595.4259814612868 },
			rb: { x: 132.5432115594329, y: 860.289667393675 },
		},
		BOT_LANE: {
			r: { x: 802.2269629225736, y: 1250.0606597600872 },
			rb: { x: 531.3436477644493, y: 1256.0802889858235 },
		},
	},
	red: {
		TOP_LANE: {
			r: { x: 574.985959651036, y: 110.84582878953108 },
			rb: { x: 851.8889040348965, y: 121.38017993456926 },
		},
		BOT_LANE: {
			r: { x: 1256.708969465649, y: 789.5590239912759 },
			rb: { x: 1262.728598691385, y: 500.6168211559433 },
		},
	},
} as const;

export const objectivesData = [
	{ type: "Drake", pos: { x: 915.3882681564245, y: 983.731843575419 } },
	{ type: "Nash", pos: { x: 460.5279329608938, y: 413.2290502793296 } },
] as const;

export const jungleCampsData = [
	{ type: "Gromp", side: "blue", pos: { x: 203, y: 592 } },
	{ type: "Blue", side: "blue", pos: { x: 358, y: 646 } },
	{ type: "Wolfs", side: "blue", pos: { x: 362, y: 771 } },
	{ type: "Raptors", side: "blue", pos: { x: 653, y: 869 } },
	{ type: "Red", side: "blue", pos: { x: 723, y: 997 } },
	{ type: "Krugs", side: "blue", pos: { x: 779, y: 1119 } },
	{ type: "Gromp", side: "red", pos: { x: 1163, y: 783 } },
	{ type: "Blue", side: "red", pos: { x: 1023, y: 727 } },
	{ type: "Wolfs", side: "red", pos: { x: 1017, y: 602 } },
	{ type: "Raptors", side: "red", pos: { x: 729, y: 494 } },
	{ type: "Red", side: "red", pos: { x: 663, y: 374 } },
	{ type: "Krugs", side: "red", pos: { x: 602, y: 250 } },
	{ type: "Scuttle", side: "blue", pos: { x: 417, y: 493 } },
	{ type: "Scuttle", side: "red", pos: { x: 971, y: 891 } },
] as const;

export const basesPos = {
	blue: { x: 28.79608938547481, y: 1361.4972067039107 },
	red: { x: 1342.4944134078212, y: 29.29608938547486 },
} as const;

export const maxDistance = 2000 as const;

export const sideColors = {
	blue: "#4287f5",
	red: "#eb3d34",
} as const;

export const RiotServerLinkRegion = {
	euw1: "europe",
	na1: "americas",
	kr: "asia",
	eun1: "europe",
	br1: "americas",
	tr1: "europe",
	la1: "americas",
	la2: "americas",
	ru: "europe",
	oc1: "sea",
	jp1: "asia",
	ph2: "sea",
	sg2: "sea",
	tw2: "sea",
	th2: "sea",
	vn2: "sea",
} as const;

export const campsSpawnTime: Record<Camp, number> = {
	Gromp: 102,
	Blue: 90,
	Wolfs: 90,
	Raptors: 90,
	Red: 90,
	Krugs: 102,
	Scuttle: 210,
};

export const campsRespawnTime: Record<Camp, number> = {
	Gromp: 135,
	Blue: 300,
	Wolfs: 135,
	Raptors: 135,
	Red: 300,
	Krugs: 135,
	Scuttle: 150,
};

export const wavesPos = {
	TOP_LANE: {
		r1: { x: 138.047919166847, y: 327.1938068979519, angle: -75 },
		r2: { x: 216.34507616974977, y: 227.63805767138194, angle: -45 },
		r3: { x: 325.96422742110997, y: 142.04502176278564, angle: -25 },
		r1b: { x: 126.24714363438524, y: 660.1081338411317, angle: -90 },
		r3b: { x: 624.7890369967356, y: 124.02543525571274, angle: 0 },
	},
	MID_LANE: {
		r1: { x: 621.7857725788901, y: 747.2028019586508, angle: -45 },
		r2: { x: 685.6411642130564, y: 695.1337021030297, angle: -45 },
		r3: { x: 758.4343035908597, y: 625.5705930359086, angle: -45 },
		r1b: { x: 509.16335690968447, y: 859.8252176278563, angle: -45 },
		r3b: { x: 863.5485582154516, y: 511.4465451577802, angle: -45 },
	},
	BOT_LANE: {
		r1: { x: 1055.7574809575626, y: 1238.2365342763874, angle: -25 },
		r2: { x: 1163.875, y: 1155.6467627856366, angle: -45 },
		r3: { x: 1237.4549782372144, y: 1043.0243471164308, angle: -75 },
		r1b: { x: 749.4245103373232, y: 1253.252856365615, angle: 0 },
		r3b: { x: 1249.4680359085962, y: 721.6750544069641, angle: -90 },
	},
} as const;

export const defaultTurretsAlive = {
	100: {
		TOP_LANE: {
			OUTER_TURRET: { usingPlates: true, value: 5 },
			INNER_TURRET: { usingPlates: false, value: 1 },
			BASE_TURRET: { usingPlates: false, value: 1 },
			INHIBITOR_BUILDING: { usingPlates: false, value: 1 },
			NEXUS_TURRET: { usingPlates: false, value: 1 },
		},
		MID_LANE: {
			OUTER_TURRET: { usingPlates: true, value: 5 },
			INNER_TURRET: { usingPlates: false, value: 1 },
			BASE_TURRET: { usingPlates: false, value: 1 },
			INHIBITOR_BUILDING: { usingPlates: false, value: 1 },
			NEXUS_TURRET: { usingPlates: false, value: 0 },
		},
		BOT_LANE: {
			OUTER_TURRET: { usingPlates: true, value: 5 },
			INNER_TURRET: { usingPlates: false, value: 1 },
			BASE_TURRET: { usingPlates: false, value: 1 },
			INHIBITOR_BUILDING: { usingPlates: false, value: 1 },
			NEXUS_TURRET: { usingPlates: false, value: 1 },
		},
	},
	200: {
		TOP_LANE: {
			OUTER_TURRET: { usingPlates: true, value: 5 },
			INNER_TURRET: { usingPlates: false, value: 1 },
			BASE_TURRET: { usingPlates: false, value: 1 },
			INHIBITOR_BUILDING: { usingPlates: false, value: 1 },
			NEXUS_TURRET: { usingPlates: false, value: 1 },
		},
		MID_LANE: {
			OUTER_TURRET: { usingPlates: true, value: 5 },
			INNER_TURRET: { usingPlates: false, value: 1 },
			BASE_TURRET: { usingPlates: false, value: 1 },
			INHIBITOR_BUILDING: { usingPlates: false, value: 1 },
			NEXUS_TURRET: { usingPlates: false, value: 0 },
		},
		BOT_LANE: {
			OUTER_TURRET: { usingPlates: true, value: 5 },
			INNER_TURRET: { usingPlates: false, value: 1 },
			BASE_TURRET: { usingPlates: false, value: 1 },
			INHIBITOR_BUILDING: { usingPlates: false, value: 1 },
			NEXUS_TURRET: { usingPlates: false, value: 1 },
		},
	},
} as const;
