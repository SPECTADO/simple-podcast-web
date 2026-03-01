import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

// Read dynamic map of HTML pages created by scripts/build.ts
let inputFiles = {};
try {
  const entriesPath = path.resolve(__dirname, 'vite-entries.json');
  if (fs.existsSync(entriesPath)) {
    inputFiles = JSON.parse(fs.readFileSync(entriesPath, 'utf-8'));
  } else {
    // Default fallback
    inputFiles = { main: path.resolve(__dirname, 'index.html') };
  }
} catch (e) {
  console.error("Failed to parse vite-entries.json:", e);
}

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: inputFiles
    }
  }
});
