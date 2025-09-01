import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative paths for assets
  build: {
    outDir: 'dist', // Specify the output directory
    assetsDir: 'assets', // Specify the assets directory
  },
  publicDir: 'public', // Specify the public directory
});
