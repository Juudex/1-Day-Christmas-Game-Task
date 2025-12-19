# North Pole Rush 🎅🏔️

Welcome to **North Pole Rush**, a high-performance 3D endless runner game built with React Three Fiber.
Race through the Arctic trail, collect gifts, and test your reflexes as the speed increases!

## 🎮 How to Play

- **Controls**: Use `Arrow Keys`, `WASD`, or `Space` to navigate
- **Goal**: Collect as many **Gifts** 🎁 as possible while avoiding obstacles
- **Speed**: The game accelerates by 0.5 units with each gift collected
- **Power-Ups**: Jump to collect ability boxes for shields or magnets

## 🛠️ Controls

| Key | Action |
| :--- | :--- |
| **Left Arrow** / **A** | Move Left |
| **Right Arrow** / **D** | Move Right |
| **Up Arrow** / **W** / **Space** | Jump |
| **Down Arrow** / **S** | Duck |
| **i** | Toggle Debug Mode (FPS & Hitboxes) |

## ✨ Features

- **4 Unique Biomes**: Mountain, Forest, Candy Land, and Icy Peaks
- **Dynamic Day/Night Cycle**: Atmospheric lighting changes throughout gameplay
- **Power-Up System**:
  - 🛡️ **Shield**: Protects from one collision
  - 🧲 **Magnet (10s)**: Auto-collect nearby gifts
- **Performance Optimized**:
  - Zero-allocation object pooling
  - GPU-accelerated particle effects
  - Pre-compiled shader warmup
  - Persistent engine architecture
- **Sound Effects**:
  - 🎵 Background Music: "Sleigh Shenanigans"
  - 🔊 Collection & Crash Sounds
- **Visual Effects**:
  - ❄️ 2500 Procedural Snowflakes
  - 🌅 Dynamic Time-of-Day Lighting

## 🔧 Debug Mode

Press **`i`** to toggle:
- **FPS Counter** (Top Right)
- **Collision Hitboxes**:
  - 🟥 Red: Obstacles (Snowmen/Rocks/Arches)
  - 🟨 Yellow: Collectibles (Gifts)
  - 🟦 Blue: Environment Decorations

## 📦 Tech Stack

- [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (Three.js)
- [Zustand](https://github.com/pmndrs/zustand) (State Management)
- [React Three Drei](https://github.com/pmndrs/drei) (3D Helpers)

## 🚀 Performance

This game implements professional-grade optimization techniques:
- Shader pre-compilation and GPU warming
- Material and geometry pooling
- Atomic state selectors to minimize React re-renders
- Static shadow maps
- Non-destructive component persistence

---
*Best experienced on Chrome/Edge* ⚡

