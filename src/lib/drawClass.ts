import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { WardDef, LineType, Region } from "./types/types";
import {
	setGlobalArrows,
	setGlobalLines,
	setGlobalRegions,
	setGlobalWantRegions,
	setGlobalWantVision,
	setGlobalWards,
} from "./redux/mapSlice/globalSlice";

export class DrawLineCommand {
	constructor(private dispatch: Dispatch<AnyAction>, private line: LineType, private lines: LineType[]) {}

	execute() {
		this.dispatch(setGlobalLines([...this.lines, this.line]));
	}

	undo() {
		this.dispatch(setGlobalLines(this.lines.filter((l) => l.id !== this.line.id)));
	}
}

export class RemoveLineCommand {
	constructor(private dispatch: Dispatch<AnyAction>, private line: LineType, private lines: LineType[]) {}

	execute() {
		this.dispatch(setGlobalLines(this.lines.filter((l) => l.id !== this.line.id)));
	}

	undo() {
		this.dispatch(setGlobalLines([...this.lines, this.line]));
	}
}

export class DrawArrowCommand {
	constructor(private dispatch: Dispatch<AnyAction>, private arrow: LineType, private arrows: LineType[]) {}

	execute() {
		this.dispatch(setGlobalArrows([...this.arrows, this.arrow]));
	}

	undo() {
		this.dispatch(setGlobalArrows(this.arrows.filter((l) => l !== this.arrow)));
	}
}

export class RemoveArrowCommand {
	constructor(private dispatch: Dispatch<AnyAction>, private arrow: LineType, private arrows: LineType[]) {}

	execute() {
		this.dispatch(setGlobalArrows(this.arrows.filter((l) => l.id !== this.arrow.id)));
	}

	undo() {
		this.dispatch(setGlobalArrows([...this.arrows, this.arrow]));
	}
}

export class AddWardCommand {
	constructor(private dispatch: Dispatch<AnyAction>, private ward: WardDef, private wards: WardDef[]) {}

	execute() {
		this.dispatch(setGlobalWards([...this.wards, this.ward]));
	}

	undo() {
		this.dispatch(setGlobalWards(this.wards.filter((w) => w !== this.ward)));
	}
}

export class RemoveWardCommand {
	constructor(private dispatch: Dispatch<AnyAction>, private ward: WardDef, private wards: WardDef[]) {}

	execute() {
		this.dispatch(setGlobalWards(this.wards.filter((w) => w.id !== this.ward.id)));
	}

	undo() {
		this.dispatch(setGlobalWards([...this.wards, this.ward]));
	}
}

export class WantRegionsCommand {
	constructor(private dispatch: Dispatch<AnyAction>, private wantRegions: boolean) {}

	execute() {
		this.dispatch(setGlobalWantRegions(!this.wantRegions));
	}

	undo() {
		this.dispatch(setGlobalWantRegions(this.wantRegions));
	}
}

export class AddRegionCommand {
	constructor(private dispatch: Dispatch<AnyAction>, private region: Region, private regions: Region[]) {}

	execute() {
		this.dispatch(setGlobalRegions([...this.regions, this.region]));
	}

	undo() {
		this.dispatch(setGlobalRegions(this.regions));
	}
}

export class RemoveRegionCommand {
	constructor(private dispatch: Dispatch<AnyAction>, private region: Region, private regions: Region[]) {}

	execute() {
		this.dispatch(setGlobalRegions(this.regions.filter((region) => region !== this.region)));
	}

	undo() {
		this.dispatch(setGlobalRegions(this.regions));
	}
}

export class WantVisionCommand {
	constructor(private dispatch: Dispatch<AnyAction>, private wantVision: boolean) {}

	execute() {
		this.dispatch(setGlobalWantVision(!this.wantVision));
	}

	undo() {
		this.dispatch(setGlobalWantVision(this.wantVision));
	}
}

export class ResetDrawingCommand {
	constructor(
		private dispatch: Dispatch<AnyAction>,
		private lines: LineType[],
		private arrows: LineType[],
		private wards: WardDef[]
	) {}

	execute() {
		this.dispatch(setGlobalLines([]));
		this.dispatch(setGlobalArrows([]));
		this.dispatch(setGlobalWards([]));
	}

	undo() {
		this.dispatch(setGlobalLines(this.lines));
		this.dispatch(setGlobalArrows(this.arrows));
		this.dispatch(setGlobalWards(this.wards));
	}
}
