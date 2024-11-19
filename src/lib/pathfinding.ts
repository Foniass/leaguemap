import gridJson from "@/public/mapGrid.json";
import { Vector2d } from "konva/lib/types";
import { PathData } from "./types/types";
import FastPriorityQueue from "fastpriorityqueue";
const flattenedGrid = (gridJson as number[][]).flat();
const grid = new Uint8Array(flattenedGrid);

const gridDimension = 1380;

const directions = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1],
];

interface HeapElement {
	x: number;
	y: number;
	f: number;
	g: number;
}

function get1DIndex(x: number, y: number) {
	return y + x * gridDimension;
}

function getKey(pos: Vector2d): string {
	return pos.x + "," + pos.y;
}

export function getPathKey(pos1: Vector2d, pos2: Vector2d) {
	return `${getKey(pos1)}/${getKey(pos2)}`;
}

const allPos: Vector2d[] = [
	{ x: 203, y: 592 },
	{ x: 358, y: 646 },
	{ x: 362, y: 771 },
	{ x: 653, y: 869 },
	{ x: 723, y: 997 },
	{ x: 779, y: 1119 },
	{ x: 1163, y: 783 },
	{ x: 1023, y: 727 },
	{ x: 1017, y: 602 },
	{ x: 729, y: 494 },
	{ x: 663, y: 374 },
	{ x: 602, y: 250 },
	{ x: 417, y: 493 },
	{ x: 971, y: 891 },
	{ x: 48, y: 1329 },
	{ x: 1322, y: 49 },
];

export function calculatePaths(): Record<string, PathData> {
	let preCalculatedPaths: Record<string, PathData> = {};

	allPos.forEach((pos1) => {
		allPos.forEach((pos2) => {
			if (pos1.x === pos2.x && pos1.y === pos2.y) return;
			const pathKey = getPathKey(pos1, pos2);

			const path = fullPathFinding(pos1.x, pos2.x, pos1.y, pos2.y);

			if ("error" in path) {
				console.error(`Error calculating path for ${pathKey}:`, path.error);
				return;
			}
			preCalculatedPaths[pathKey] = path;
		});
	});

	return preCalculatedPaths;
}

export function fullPathFinding(x1: number, x2: number, y1: number, y2: number): { error: any } | PathData {
	const providedCoords = [x1, x2, y1, y2];

	for (const coord of providedCoords) {
		if (coord < 0 || coord > gridDimension) return { error: "Points are out of bonds" };
	}

	let startPoint = { x: Math.floor(x1), y: Math.floor(y1) };
	let goalPoint = { x: Math.floor(x2), y: Math.floor(y2) };

	try {
		if (grid[get1DIndex(startPoint.x, startPoint.y)] === 1) {
			startPoint = findClosestNonWallPoint(startPoint);
		}
		if (grid[get1DIndex(goalPoint.x, goalPoint.y)] === 1) {
			goalPoint = findClosestNonWallPoint(goalPoint);
		}
	} catch (error) {
		return { error };
	}

	let pointsOfPath = pathFinding(startPoint, goalPoint);
	if (pointsOfPath) {
		pointsOfPath = smoothPath(pointsOfPath);
		let distanceAfterSmoothing = 0;
		for (let i = 0; i < pointsOfPath.length - 1; i++) {
			let pointA = pointsOfPath[i];
			let pointB = pointsOfPath[i + 1];

			if (pointA && pointB) {
				distanceAfterSmoothing += distanceBetweenPoints(pointA, pointB);
			}
		}
		return { path: pointsOfPath, distance: distanceAfterSmoothing, start: startPoint, end: goalPoint };
	} else {
		return { error: "No path found." };
	}
}

export function distanceBetweenPoints(a: Vector2d, b: Vector2d): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy);
}

function findClosestNonWallPoint(start: Vector2d): Vector2d {
	let queue: Vector2d[] = [start];
	let visited = new Set<string>();

	while (queue.length > 0) {
		let { x, y } = queue.shift() as Vector2d;

		if (grid[get1DIndex(x, y)] === 0) {
			return { x, y };
		}

		for (let [dx, dy] of directions) {
			let newX = x + (dx || 0);
			let newY = y + (dy || 0);
			const newPos = { x: newX, y: newY };
			const newPosKey = getKey(newPos);
			if (newX >= 0 && newX < gridDimension && newY >= 0 && newY < gridDimension && !visited.has(newPosKey)) {
				visited.add(newPosKey);
				queue.push(newPos);
			}
		}
	}

	throw new Error("No non-wall point found");
}

function pathFinding(start: Vector2d, goal: Vector2d): Vector2d[] | null {
	let openSet = new FastPriorityQueue<HeapElement>((a: HeapElement, b: HeapElement) => a.f < b.f);
	let openSetElements = new Set<string>();

	let cameFrom = new Map();
	let gScore = new Map();
	let fScore = new Map();

	let startElement = {
		...start,
		f: 0,
		g: 0,
	};

	openSet.add(startElement);

	const stringifiedStartPos = getKey(start);
	openSetElements.add(stringifiedStartPos);
	gScore.set(stringifiedStartPos, 0);
	fScore.set(stringifiedStartPos, heuristic(start, goal));

	while (!openSet.isEmpty()) {
		let currentElement = openSet.poll();
		if (!currentElement) {
			return null;
		}
		let current = { x: currentElement.x, y: currentElement.y };
		let currentKey = getKey(current);
		openSetElements.delete(currentKey);

		if (current.x === goal.x && current.y === goal.y) {
			let path = [];
			while (current) {
				path.unshift(current);
				current = cameFrom.get(getKey(current));
			}
			return path;
		}

		let neighbors = [
			{ x: current.x + 1, y: current.y },
			{ x: current.x - 1, y: current.y },
			{ x: current.x, y: current.y + 1 },
			{ x: current.x, y: current.y - 1 },
		];

		for (let neighbor of neighbors) {
			let neighborKey = getKey(neighbor);
			if (neighbor.x < 0 || neighbor.x >= gridDimension || neighbor.y < 0 || neighbor.y >= gridDimension) continue;
			if (grid[get1DIndex(neighbor.x, neighbor.y)] === 1) continue;

			let tentative_gScore = gScore.get(currentKey) + 1;
			let tentative_fScore = tentative_gScore + heuristic(neighbor, goal);

			if (!gScore.has(neighborKey) || tentative_gScore < gScore.get(neighborKey)) {
				cameFrom.set(neighborKey, current);
				gScore.set(neighborKey, tentative_gScore);
				fScore.set(neighborKey, tentative_fScore);
				if (!openSetElements.has(neighborKey)) {
					openSet.add({
						x: neighbor.x,
						y: neighbor.y,
						f: tentative_gScore + heuristic(neighbor, goal),
						g: tentative_gScore,
					});
					openSetElements.add(neighborKey);
				}
			}
		}
	}
	return null;
}

function heuristic(a: Vector2d, b: Vector2d): number {
	return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function smoothPath(path: Vector2d[]): Vector2d[] {
	let smoothedPath = [];
	let len = path.length;
	let i = 0;

	while (i < len) {
		let pv = path[i];
		if (pv) smoothedPath.push(pv);

		let lookAhead = i + 2;
		while (lookAhead < len) {
			let nv = path[lookAhead];
			if (pv && nv && !isLineWalkable(pv, nv)) {
				break;
			}
			lookAhead++;
		}

		i = lookAhead - 1;
	}

	return smoothedPath;
}

function isLineWalkable(a: Vector2d, b: Vector2d): boolean {
	let x1 = a.x;
	let y1 = a.y;
	let x2 = b.x;
	let y2 = b.y;
	let dx = Math.abs(x2 - x1);
	let dy = Math.abs(y2 - y1);
	let sx = x1 < x2 ? 1 : -1;
	let sy = y1 < y2 ? 1 : -1;
	let err = dx - dy;

	while (true) {
		if (grid[get1DIndex(x1, y1)] === 1) {
			return false;
		}
		if (x1 === x2 && y1 === y2) {
			break;
		}
		let e2 = 2 * err;
		if (e2 > -dy) {
			err -= dy;
			x1 += sx;
		}
		if (e2 < dx) {
			err += dx;
			y1 += sy;
		}
	}
	return true;
}
