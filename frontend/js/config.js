/**
 * CampusFind 2.0 - Frontend Configuration
 * Manages API endpoints and system constants
 */

// Fallback backend port when the page is NOT served by the Express server
// (e.g. opened via Live Server :5500 or directly as a file://).
// Update this if you change PORT in backend/.env, then serve via Live Server.
const BACKEND_FALLBACK_PORT = 5000;

const getBaseServerUrl = () => {
  // 1. Explicit global override (set window.__CAMPUSFIND_API_URL__ anywhere)
  if (typeof window !== 'undefined' && window.__CAMPUSFIND_API_URL__) {
    return window.__CAMPUSFIND_API_URL__;
  }

  if (typeof window !== 'undefined' && window.location) {
    const { origin, hostname, protocol, port } = window.location;

    // 2. Served by the Express backend itself (file:// excluded, Live Server ports excluded).
    //    When Express serves the frontend on any port, window.location.port equals
    //    the backend port, so we can use window.location.origin directly.
    if (protocol !== 'file:' && port && port !== '5500' && port !== '3000') {
      return origin; // e.g. http://localhost:5000 or http://localhost:5001
    }

    // 3. Served by Live Server / another dev server / unknown port —
    //    point to the backend on its configured port.
    if (protocol !== 'file:' && hostname) {
      return `${protocol}//${hostname}:${BACKEND_FALLBACK_PORT}`;
    }
  }

  // 4. file:// or SSR fallback
  return `http://localhost:${BACKEND_FALLBACK_PORT}`;
};

const SERVER_BASE = getBaseServerUrl();

const CONFIG = {
  // Base API configuration — URL auto-detected from window.location
  API_BASE_URL: `${SERVER_BASE}/api`,
  SERVER_URL: SERVER_BASE,
  UPLOAD_URL: `${SERVER_BASE}/uploads`,

  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'campusfind_token',
    USER_DATA: 'campusfind_user',
    THEME: 'campusfind_theme'
  },

  // Item Types & Categories
  ITEM_TYPES: {
    LOST: 'lost',
    FOUND: 'found'
  },

  ITEM_STATUS: {
    OPEN: 'open',
    CLAIM_PENDING: 'claim_pending',
    RECOVERED: 'recovered',
    CLOSED: 'closed'
  },

  CLAIM_STATUS: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },

  USER_ROLES: {
    STUDENT: 'student',
    ADMIN: 'admin'
  }
};

// Freeze configuration object to prevent runtime mutations
Object.freeze(CONFIG);
