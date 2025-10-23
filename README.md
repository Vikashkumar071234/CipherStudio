CipherStudio
Online code editor to create, edit, and manage projects with real‑time preview and server persistence.

Live App: https://your-vercel-frontend-url.vercel.app
API Base: https://cipherstudio-backend-0hfm.onrender.com/api


****Features****
Projects: create/open, add/rename/delete files, save locally or to server (MongoDB)
Editor: syntax highlighting, tabs, real-time preview (HTML/CSS/JS/React)
UI: light/dark themes, resizable editor/preview
Server panel: list, open, save (POST/PUT), delete projects

****Tech Stack****
Frontend: React + Sandpack
Backend: Node.js, Express.js
DB: MongoDB (Mongoose)
Hosting: Vercel (frontend), Render (backend)

****Monorepo****
frontend/ — React app
backend/ — Express API + Mongoose
Quick Start

****Backend****
cd backend
npm install
.env:
    MONGO_URL=your-mongodb-uri
    PORT=3001 (optional locally)
npm run dev
Check: http://localhost:3001/api/projects → []

****Frontend****
cd frontend
npm install
Create frontend/src/config.js:
   export const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:3001/api");
Start:
   Windows: set REACT_APP_API_BASE=http://localhost:3001/api && npm start
   macOS/Linux: REACT_APP_API_BASE=http://localhost:3001/api npm start

****Environment (Production)****
Vercel (frontend): REACT_APP_API_BASE=https://cipherstudio-backend-0hfm.onrender.com/api
Render (backend): MONGO_URL=your-mongodb-uri
Optional (Node 22): NODE_OPTIONS=--openssl-legacy-provider

****API (Projects)****
GET /projects → [{ _id, projectName }]
POST /projects → { id } (body: { projectName?, files: { "/src/App.js": "..." } })
GET /projects/:id → { id, projectName, files }
PUT /projects/:id → { ok: true }
DELETE /projects/:id → { ok: true }

****Tips****
“Save Project” = localStorage (offline/drafts)
“Save to Server” = MongoDB (shared/cross‑device)
If you see “Cannot GET /api”, use /api/projects (that’s expected)
