import { AnyAction, Dispatch } from "@reduxjs/toolkit";
import { DrawCommand, DrawCommandProps } from "../types/types";
import {
	AddRegionCommand,
	AddWardCommand,
	DrawArrowCommand,
	DrawLineCommand,
	RemoveArrowCommand,
	RemoveLineCommand,
	RemoveRegionCommand,
	RemoveWardCommand,
	ResetDrawingCommand,
	WantRegionsCommand,
	WantVisionCommand,
} from "../drawClass";
import { useDispatch } from "react-redux";
import {
	popGlobalDrawCommandHistory,
	popGlobalDrawCommandRedo,
	pushGlobalDrawCommandHistory,
	pushGlobalDrawCommandRedo,
} from "../redux/mapSlice/globalSlice";
import useGlobalTab from "./useGlobalTab";

function drawCommandPropsToClass(dispatch: Dispatch<AnyAction>, drawCommandProps: DrawCommandProps): DrawCommand {
	switch (drawCommandProps.type) {
		case "drawLine":
			return new DrawLineCommand(dispatch, drawCommandProps.line, drawCommandProps.lines);
		case "removeLine":
			return new RemoveLineCommand(dispatch, drawCommandProps.line, drawCommandProps.lines);
		case "drawArrow":
			return new DrawArrowCommand(dispatch, drawCommandProps.arrow, drawCommandProps.arrows);
		case "removeArrow":
			return new RemoveArrowCommand(dispatch, drawCommandProps.arrow, drawCommandProps.arrows);
		case "addWard":
			return new AddWardCommand(dispatch, drawCommandProps.ward, drawCommandProps.wards);
		case "removeWard":
			return new RemoveWardCommand(dispatch, drawCommandProps.ward, drawCommandProps.wards);
		case "wantRegions":
			return new WantRegionsCommand(dispatch, drawCommandProps.wantRegions);
		case "addRegion":
			return new AddRegionCommand(dispatch, drawCommandProps.region, drawCommandProps.regions);
		case "removeRegion":
			return new RemoveRegionCommand(dispatch, drawCommandProps.region, drawCommandProps.regions);
		case "wantVision":
			return new WantVisionCommand(dispatch, drawCommandProps.wantVision);
		case "resetDrawing":
			return new ResetDrawingCommand(dispatch, drawCommandProps.lines, drawCommandProps.arrows, drawCommandProps.wards);
	}
}

const useDrawCommand = (): [(drawCommandProps: DrawCommandProps) => void, () => void, () => void] => {
	const dispatch = useDispatch();

	const { drawCommandHistory, drawCommandRedo } = useGlobalTab();

	function execCommand(drawCommandProps: DrawCommandProps) {
		const drawCommand = drawCommandPropsToClass(dispatch, drawCommandProps);
		drawCommand.execute();
		dispatch(pushGlobalDrawCommandHistory(drawCommandProps));
	}

	function undoCommand() {
		if (drawCommandHistory.length > 0) {
			const drawCommandProps = drawCommandHistory[drawCommandHistory.length - 1];
			dispatch(popGlobalDrawCommandHistory());
			if (drawCommandProps) {
				const drawCommand = drawCommandPropsToClass(dispatch, drawCommandProps);
				drawCommand.undo();
				dispatch(pushGlobalDrawCommandRedo(drawCommandProps));
			}
		}
	}

	function redoCommand() {
		if (drawCommandRedo.length > 0) {
			const drawCommandProps = drawCommandRedo[drawCommandRedo.length - 1];
			dispatch(popGlobalDrawCommandRedo());
			if (drawCommandProps) {
				const drawCommand = drawCommandPropsToClass(dispatch, drawCommandProps);
				drawCommand.undo();
				dispatch(pushGlobalDrawCommandHistory(drawCommandProps));
			}
		}
	}

	return [execCommand, undoCommand, redoCommand];
};

export default useDrawCommand;
