# News Curator Frontend Setup

## Build & Run

Install dependencies:
```bash
npm install
```

Development mode (opens dev tools):
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Run production build:
```bash
npm start
```

## Project Structure

- `src/main/` - Electron main process (TypeScript)
- `src/renderer/` - Vue 3 app (TypeScript + SFC)
- `src/renderer/components/` - Reusable Vue components
- `src/renderer/views/` - Page components
- `public/` - Static assets
- `index.html` - Renderer entry point
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration

## Features

- Electron + Vue 3 + TypeScript stack
- Category-based sidebar navigation
- Article grid display
- Header with refresh & settings
- IPC communication for crawler integration
- Context isolation & preload for security

## Next Steps

1. Connect the renderer Home.vue to ipcRenderer calls to fetch articles
2. Implement crawl triggering from the UI
3. Add article caching/persistence
4. Set up data flow between crawler.js and the frontend
