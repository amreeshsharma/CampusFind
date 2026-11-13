/**
 * CampusFind 2.0 - Utility Functions & UI Helpers
 * Toast notifications, date formatters, modal controllers, mock preview datasets
 */

// --- Toast Notification System ---
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-weight:700; color: inherit;">${iconMap[type] || 'ℹ'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// --- Date Formatting ---
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// --- Local Storage & Session State ---
function getUserSession() {
  try {
    const rawUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token || !rawUser || token === 'undefined' || token === 'null' || rawUser === 'undefined' || rawUser === 'null') {
      return null;
    }
    const user = JSON.parse(rawUser);
    if (!user || typeof user !== 'object') return null;
    return { user, token };
  } catch (e) {
    return null;
  }
}

function setUserSession(user, token) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
}

function clearUserSession() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
}

// --- Authenticated Fetch Helper ---
// Automatically injects Authorization header with Bearer token AND credentials: 'include'
// Solves cross-port cookie blocking, preview resilience, and session continuity
function authFetch(url, options = {}) {
  const session = getUserSession();
  const headers = { ...(options.headers || {}) };

  if (session && session.token) {
    headers['Authorization'] = `Bearer ${session.token}`;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
}

// --- Modal Helper Functions ---
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// --- Phase 2 Temporary Mock Dataset for UI/UX Preview ---
// (Clearly marked as temporary visual preview data - replaced by MySQL API in later phases)
const MOCK_ITEMS = [
  {
    id: 1,
    title: 'Blue Hydro Flask Water Bottle',
    category: 'Bottles & Containers',
    type: 'found',
    color: 'Ocean Blue',
    location: 'Central Library, 2nd Floor Reading Hall',
    date: '2026-10-28',
    description: 'Found on desk #14 near computer terminals. Metallic 32oz bottle with stickers.',
    image: 'sample-bottle.jpg',
    status: 'open',
    qrToken: 'QR-FND-88219'
  },
  {
    id: 2,
    title: 'Casio Scientific Calculator fx-991EX',
    category: 'Electronics & Gadgets',
    type: 'lost',
    color: 'Black',
    location: 'Mechanical Engineering Lab 3',
    date: '2026-10-29',
    description: 'Has silver name sticker "Rahul S." on the rear slide cover.',
    image: 'sample-calculator.jpg',
    status: 'open',
    matchScore: 92
  },
  {
    id: 3,
    title: 'Noise Cancelling Wireless Earbuds Case',
    category: 'Electronics & Gadgets',
    type: 'found',
    color: 'White',
    location: 'Main Auditorium, Row F',
    date: '2026-10-27',
    description: 'White magnetic charging case found under seat after cultural fest briefing.',
    image: 'sample-earbuds.jpg',
    status: 'claim_pending',
    qrToken: 'QR-FND-43921'
  },
  {
    id: 4,
    title: 'College ID Card - CSE Dept',
    category: 'ID Cards & Wallets',
    type: 'found',
    color: 'White / Blue Lanyard',
    location: 'Cafeteria Counter 2',
    date: '2026-10-30',
    description: 'Handed over to security desk. Contains roll number 23CSE045.',
    image: 'sample-idcard.jpg',
    status: 'open',
    qrToken: 'QR-FND-19402'
  },
  {
    id: 5,
    title: 'Black HP Laptop Charger (65W USB-C)',
    category: 'Electronics & Gadgets',
    type: 'lost',
    color: 'Black',
    location: 'Campus Library, Ground Floor',
    date: '2026-10-26',
    description: 'Left plugged into wall socket behind the reference bookshelves.',
    image: 'sample-charger.jpg',
    status: 'open',
    matchScore: 84
  },
  {
    id: 6,
    title: 'Graphing Notebook with Lab Reports',
    category: 'Books & Stationery',
    type: 'recovered',
    color: 'Green Cover',
    location: 'Physics Lab 1',
    date: '2026-10-24',
    description: 'Physics Experiment reports with roll numbers.',
    image: 'sample-notebook.jpg',
    status: 'recovered'
  },
  {
    id: 7,
    title: 'Leather Wallet with Metro Card',
    category: 'ID Cards & Wallets',
    type: 'found',
    color: 'Brown / Black',
    location: 'Central Library, Ground Floor',
    date: '2026-11-01',
    description: 'Brown leather wallet with cards and campus pass inside.',
    image: 'sample-wallet.jpg',
    status: 'open',
    qrToken: 'QR-FND-WALLET-104'
  },
  {
    id: 8,
    title: 'Navy Blue Campus Backpack',
    category: 'Bags & Backpacks',
    type: 'found',
    color: 'Navy Blue',
    location: 'Seminar Hall 2, Block B',
    date: '2026-11-02',
    description: 'Modern student laptop backpack left behind after guest lecture.',
    image: 'sample-backpack.jpg',
    status: 'open',
    qrToken: 'QR-FND-BAG-991'
  },
  {
    id: 9,
    title: 'Hostel Room & Bike Keys',
    category: 'Keys & Accessories',
    type: 'lost',
    color: 'Silver / Black Fob',
    location: 'Sports Ground Pavilion',
    date: '2026-10-31',
    description: 'Set of 3 keys with ITM lanyard and Honda key fob.',
    image: 'sample-keys.jpg',
    status: 'open',
    matchScore: 78
  }
];

