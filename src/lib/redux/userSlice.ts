import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { BindKey, Binds, FolderStructureItem, isFolderItem } from "../types/types";
import { defaultUserState } from "../values/initReduxValues";
import { addItemBasedOnTypeInFolderStructure, editFolderStructureItem, removeItemFromFolderStructure } from "../utils";
import { FolderDb } from "../db/folders/collection";

const userSlice = createSlice({
	name: "binds",
	initialState: defaultUserState,
	reducers: {
		setUserBind: (state, action: PayloadAction<{ bind: BindKey; value: string }>) => {
			const { bind, value } = action.payload;
			state.binds[bind] = value === "Escape" ? null : value;
		},
		setUserBinds: (state, action: PayloadAction<Binds>) => {
			const newBinds = action.payload;
			Object.keys(newBinds).forEach((bindKey) => {
				state.binds[bindKey as BindKey] = newBinds[bindKey as BindKey];
			});
		},
		setUserFolderStructure: (state, action: PayloadAction<FolderStructureItem[]>) => {
			state.folderStructure = action.payload;
		},
		concatUserFolderStructure: (state, action: PayloadAction<FolderStructureItem[]>) => {
			const newFolderStructure = action.payload;
			newFolderStructure.forEach((newItem) => {
				const existingItemIndex = state.folderStructure.findIndex((item) => item.id === newItem.id);
				if (existingItemIndex !== -1) state.folderStructure.splice(existingItemIndex, 1);
				state.folderStructure.push(newItem);
			});
		},
		renameUserFolderStructureItem: (state, action: PayloadAction<{ id: string; newName: string }>) => {
			const { id, newName } = action.payload;
			editFolderStructureItem(id, state.folderStructure, (item) => {
				item.name = newName;
			});
		},
		swapUserFolderItemOpenStatues: (state, action: PayloadAction<string>) => {
			editFolderStructureItem(action.payload, state.folderStructure, (item) => {
				if (isFolderItem(item)) item.isOpen = !item.isOpen;
			});
		},
		removeUserFolderStructureItem: (state, action: PayloadAction<string>) => {
			removeItemFromFolderStructure(action.payload, state.folderStructure);
		},
		moveUserFolderStructureItems: (state, action: PayloadAction<{ itemMovedId: string; movedToItemId: string }>) => {
			const { itemMovedId, movedToItemId } = action.payload;
			const savedItem = removeItemFromFolderStructure(itemMovedId, state.folderStructure);
			if (!savedItem) return;
			const isDone = addItemBasedOnTypeInFolderStructure(movedToItemId, state.folderStructure, savedItem);
			if (!isDone) state.folderStructure.push(savedItem);
		},
		setUserLoadedFolder: (state, action: PayloadAction<FolderDb | null>) => {
			state.loadedFolder = action.payload;
		},
	},
});

export const {
	setUserBind,
	setUserLoadedFolder,
	moveUserFolderStructureItems,
	setUserBinds,
	removeUserFolderStructureItem,
	setUserFolderStructure,
	concatUserFolderStructure,
	renameUserFolderStructureItem,
	swapUserFolderItemOpenStatues,
} = userSlice.actions;

export default userSlice.reducer;
