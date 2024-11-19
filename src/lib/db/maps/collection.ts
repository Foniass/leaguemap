import { GameState, GlobalState, ReviewState, SimulationState } from "@/src/lib/types/redux";
import { MongoCollection } from "../class/MongoCollection";

export type MapDb = { lastUpdate: number } & {
	Global: GlobalState;
	Game: GameState;
	Review: ReviewState;
	Simulation: SimulationState;
};

const mapsCollection = new MongoCollection<MapDb>("coachlolfr", "maps");

export default mapsCollection;
