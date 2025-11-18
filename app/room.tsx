"use client";

import { useState, useEffect, useCallback } from "react";

// === ARCHITECTURE ===
// String-based object types
type ObjectType = "stationary" | "interactable";

// Grid object with unique ID
interface GridObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  color: string;
  interacted?: boolean;
}

// Character position
interface Character {
  x: number;
  y: number;
}

// Camera offset for following character
interface Camera {
  offsetX: number;
  offsetY: number;
}

// Grid dimensions
const GRID_WIDTH = 50;
const GRID_HEIGHT = 50;
const TILE_SIZE = 32; // pixels
const VIEWPORT_WIDTH = 15; // tiles visible
const VIEWPORT_HEIGHT = 12; // tiles visible

export default function Room() {
  // Game state
  const [objects, setObjects] = useState<GridObject[]>([
    { id: "obj-1", type: "stationary", x: 5, y: 5, color: "#8b4513" },
    { id: "obj-2", type: "interactable", x: 8, y: 5, color: "#ffd700" },
    { id: "obj-3", type: "stationary", x: 5, y: 8, color: "#8b4513" },
    { id: "obj-4", type: "interactable", x: 10, y: 10, color: "#4169e1" },
  ]);

  const [character, setCharacter] = useState<Character>({ x: 7, y: 7 });
  const [camera, setCamera] = useState<Camera>({ offsetX: 0, offsetY: 0 });
  const [selectedTool, setSelectedTool] = useState<ObjectType>("stationary");
  const [objectIdCounter, setObjectIdCounter] = useState(5);

  // Update camera to follow character
  useEffect(() => {
    const targetOffsetX = character.x - Math.floor(VIEWPORT_WIDTH / 2);
    const targetOffsetY = character.y - Math.floor(VIEWPORT_HEIGHT / 2);

    setCamera({
      offsetX: Math.max(0, Math.min(targetOffsetX, GRID_WIDTH - VIEWPORT_WIDTH)),
      offsetY: Math.max(0, Math.min(targetOffsetY, GRID_HEIGHT - VIEWPORT_HEIGHT)),
    });
  }, [character]);

  // WASD movement + Space interaction
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let newX = character.x;
      let newY = character.y;

      switch (e.key.toLowerCase()) {
        case "w":
          newY = Math.max(0, character.y - 1);
          break;
        case "s":
          newY = Math.min(GRID_HEIGHT - 1, character.y + 1);
          break;
        case "a":
          newX = Math.max(0, character.x - 1);
          break;
        case "d":
          newX = Math.min(GRID_WIDTH - 1, character.x + 1);
          break;
        case " ":
          e.preventDefault();
          handleInteract();
          return;
      }

      if (newX !== character.x || newY !== character.y) {
        setCharacter({ x: newX, y: newY });
      }
    },
    [character]
  );

  // Interact with adjacent objects
  const handleInteract = useCallback(() => {
    const adjacentPositions = [
      { x: character.x, y: character.y - 1 }, // up
      { x: character.x, y: character.y + 1 }, // down
      { x: character.x - 1, y: character.y }, // left
      { x: character.x + 1, y: character.y }, // right
    ];

    setObjects((prevObjects) =>
      prevObjects.map((obj) => {
        if (
          obj.type === "interactable" &&
          adjacentPositions.some((pos) => pos.x === obj.x && pos.y === obj.y)
        ) {
          return { ...obj, interacted: !obj.interacted };
        }
        return obj;
      })
    );
  }, [character]);

  // Keyboard event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Place object on grid click
  const handleGridClick = (gridX: number, gridY: number) => {
    // Don't place on character position
    if (gridX === character.x && gridY === character.y) return;

    // Check if object already exists at position
    const existingObjIndex = objects.findIndex(
      (obj) => obj.x === gridX && obj.y === gridY
    );

    if (existingObjIndex !== -1) {
      // Remove existing object
      setObjects(objects.filter((_, i) => i !== existingObjIndex));
    } else {
      // Place new object
      const newObject: GridObject = {
        id: `obj-${objectIdCounter}`,
        type: selectedTool,
        x: gridX,
        y: gridY,
        color: selectedTool === "stationary" ? "#8b4513" : "#ffd700",
      };
      setObjects([...objects, newObject]);
      setObjectIdCounter(objectIdCounter + 1);
    }
  };

  // Render grid
  const renderGrid = () => {
    const tiles = [];

    for (let y = camera.offsetY; y < camera.offsetY + VIEWPORT_HEIGHT; y++) {
      for (let x = camera.offsetX; x < camera.offsetX + VIEWPORT_WIDTH; x++) {
        if (x >= GRID_WIDTH || y >= GRID_HEIGHT) continue;

        const isCharacter = x === character.x && y === character.y;
        const obj = objects.find((o) => o.x === x && o.y === y);

        tiles.push(
          <div
            key={`${x}-${y}`}
            onClick={() => handleGridClick(x, y)}
            className="border border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors relative"
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              backgroundColor: obj
                ? obj.interacted
                  ? "#ff6b6b" // Interacted color
                  : obj.color
                : "#2a2a2a",
            }}
          >
            {isCharacter && (
              <div
                className="absolute inset-1"
                style={{ backgroundColor: "#00ff00" }}
              />
            )}
          </div>
        );
      }
    }

    return tiles;
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Grid viewport - fullscreen */}
      <div
        className="grid bg-gray-900 absolute inset-0"
        style={{
          gridTemplateColumns: `repeat(${VIEWPORT_WIDTH}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${VIEWPORT_HEIGHT}, ${TILE_SIZE}px)`,
          imageRendering: "pixelated",
          width: "100vw",
          height: "100vh",
        }}
      >
        {renderGrid()}
      </div>

      {/* Controls info - overlay */}
      <div className="absolute top-4 left-4 text-gray-400 text-sm bg-black/70 p-2 rounded">
        <div>WASD: Move | Space: Interact | Click: Place/Remove Objects</div>
        <div className="mt-1">
          Position: ({character.x}, {character.y})
        </div>
      </div>

      {/* Toolbar - overlay at bottom center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 p-4 bg-gray-800/90 rounded-lg border-2 border-gray-600">
        <button
          onClick={() => setSelectedTool("stationary")}
          className={`px-6 py-3 rounded font-semibold transition-all ${
            selectedTool === "stationary"
              ? "bg-blue-600 text-white scale-105"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Stationary
        </button>
        <button
          onClick={() => setSelectedTool("interactable")}
          className={`px-6 py-3 rounded font-semibold transition-all ${
            selectedTool === "interactable"
              ? "bg-blue-600 text-white scale-105"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Interactable
        </button>
      </div>
    </div>
  );
}
