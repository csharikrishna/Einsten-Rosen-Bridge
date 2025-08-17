# Cosmic Wormhole Experience

This project is a high-quality, interactive 3D web application that visualizes a traversable wormhole (an Einstein-Rosen bridge). It is built using HTML, CSS, and JavaScript, with the Three.js library for 3D graphics.

## Key Features

- **Interactive 3D Scene:** A visually impressive and animated wormhole, surrounded by a procedurally generated starfield, nebulae, planets, and galaxies.
- **User Controls:** Users can manipulate the view with the mouse, zoom with the scroll wheel, and adjust the wormhole's "space distortion" via a slider.
- **Journey Mode:** An automated, cinematic fly-through of the wormhole.
- **Polished UI:** A sleek, futuristic user interface with "glassmorphism" effects, providing information and controls.
- **High Performance:** The code is heavily optimized for performance, using techniques like procedural generation and an efficient animation loop.

## How to Run

This project uses [Vite](https://vitejs.dev/) as a development server and build tool.

1.  Make sure you have [Node.js](https://nodejs.org/) installed (which includes npm).
2.  Open your terminal and navigate to the project's root directory.
3.  Install the necessary dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Open your web browser and navigate to the local address provided by Vite (usually `http://localhost:5173`).

## Asset Note

The textures used for the nebulae, galaxies, and event horizon (`/public/assets/*.png`) are currently empty placeholder files. The original project generated these textures procedurally. For improved performance, the code has been refactored to load static images.

To see the full visual effect, you will need to replace these placeholder files with actual images.

## Credits

This project is an impressive demonstration of what can be achieved with Three.js and modern web technologies. The original code is well-structured, highly optimized, and demonstrates a great deal of skill and creativity.
