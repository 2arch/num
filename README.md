# Pixel Art Game

A minimal pixel art game built with Next.js, featuring grid-based movement, object placement, and interactions.

## Features

- **50x50 Grid World** with camera following
- **WASD Movement** - Control your character with keyboard
- **Object Placement** - Click to place stationary or interactable objects
- **Interaction System** - Press Space to interact with adjacent objects
- **String-based Architecture** - Clean, minimal codebase

## Controls

- **W/A/S/D** - Move character up/left/down/right
- **Space** - Interact with adjacent interactable objects
- **Mouse Click** - Place or remove objects on the grid

## Object Types

- **Stationary** (Brown) - Static objects that cannot be interacted with
- **Interactable** (Gold) - Objects that change color to red when interacted with

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

## Architecture

The game uses a string-based object system:
- Objects: `{ id: string, type: "stationary" | "interactable", x: number, y: number, color: string }`
- Character: `{ x: number, y: number }`
- Camera: `{ offsetX: number, offsetY: number }`

All game logic is contained in `app/room.tsx`.

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/2arch/num)
