// frontend/src/config.js
const ensureNoTrailingSlash = (s) => s.replace(/\/+$/, "");

const raw =
  process.env.REACT_APP_API_BASE ||     // preferred (you set this on Vercel)
  process.env.REACT_APP_API_URL  ||     // optional legacy
  "http://localhost:3001";              // local default

const ROOT = ensureNoTrailingSlash(raw);
export const API_BASE = ROOT.endsWith("/api") ? ROOT : `${ROOT}/api`;