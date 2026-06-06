/**
 * CartSaver — Lost & Found Center
 * script.js
 *
 * Sections:
 *  1. Dummy Data
 *  2. State
 *  3. Header / Date
 *  4. Card Rendering
 *  5. "Send Rescue Email" Action
 *  6. Stats Updater
 *  7. Filter Buttons
 *  8. Toast Notification
 *  9. Init
 */


/* ─── 1. DUMMY DATA ─────────────────────────────── */

/**
 * Each cart object represents an abandoned cart "case".
 * urgency: 'high' | 'medium' | 'low'
 * status:  'pending' | 'sent'
 */
const carts = [
  {
    id: 'CS-001',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    items: [
      'Wireless Noise-Cancelling Headphones',
      'Leather Laptop Sleeve 13"',
      'USB-C Hub 7-in-1',
    ],
    total: 351.00,
    itemCount: 3,
    abandoned: '2h 14m ago',
    urgency: 'high',
    status: 'pending',
  },
  {
    id: 'CS-002',
    name: 'Marcus Webb',
    email: 'marcus.webb@example.com',
    items: [
      'Standing Desk Converter',
      'Ergonomic Wrist Rest',
    ],
    total: 219.50,
    itemCount: 2,
    abandoned: '5h 02m ago',
    urgency: 'high',
    status: 'pending',
  },
  {
    id: 'CS-003',
    name: 'Anya Kowalczyk',
    email: 'a.kowalczyk@example.com',
    items: [
      'Minimalist Desk Clock',
      'Brass Pen Holder',
      'Linen Desk Pad',
      'Cable Management Box',
    ],
    total: 178.00,
    itemCount: 4,
    abandoned: '9h 30m ago',
    urgency: 'medium',
    status: 'pending',
  },
  {
    id: 'CS-004',
    name: 'Daniel Osei',
    email: 'd.osei@example.com',
    items: [
      'Portable Bluetooth Speaker',
    ],
    total: 89.00,
    itemCount: 1,
    abandoned: '14h ago',
    urgency: 'medium',
    status: 'pending',
  },
  {
    id: 'CS-005',
    name: 'Fatima Al-Rashid',
    email: 'fatima.rashid@example.com',
    items: [
      'Coffee Grinder — Burr Manual',
      'Chemex 8-Cup Brewer',
      'Gooseneck Kettle',
    ],
    total: 262.00,
    itemCount: 3,
    abandoned: '1d 2h ago',
    urgency: 'low',
    status: 'pending',
  },
  {
    id: 'CS-006',
    name: 'Tom Eriksson',
    email: 'tom.eriksson@example.com',
    items: [
      'Merino Wool Throw Blanket',
      'Beeswax Candle Set',
    ],
    total: 185.00,
    itemCount: 2,
    abandoned: '2d 4h ago',
    urgency: 'low',
    status: 'pending',
  },
];


/* ─── 2. STATE ──────────────────────────────────── */

// Track how many reminders have been sent this session
let sentCount = 0;


/* ─── 3. HEADER / DATE ──────────────────────────── */

/**
 * Formats and inserts today's date into the header.
 */
function renderDate() {
  const el = document.getElementById('headerDate');
  if (!el) return;

  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  el.textContent = now.toLocaleDateString('en-US', options);
}


/* ─── 4. CARD RENDERING ─────────────────────────── */

/**
 * Builds the HTML string for a single cart card.
 * @param {Object} cart — cart data object
 * @returns {string} HTML string
 */
function buildCardHTML(cart) {
  // Show max 2 items in the card; show "+N more" if there are extra
  const maxItems = 2;
  const visibleItems = cart.items.slice(0, maxItems);
  const extraCount  = cart.items.length - maxItems;

  // Build item rows
  const itemRows = visibleItems
    .map(name => `<li class="card-item">${escapeHTML(name)}</li>`)
    .join('');

  const moreRow = extraCount > 0
    ? `<li class="card-item-more">+${extraCount} more item${extraCount > 1 ? 's' : ''}</li>`
    : '';

  // Urgency label display
  const urgencyLabel = {
    high:   'High Priority',
    medium: 'Medium',
    low:    'Low',
  }[cart.urgency] || cart.urgency;

  // Status chip
  const isPending = cart.status === 'pending';
  const statusHTML = isPending
    ? `<span class="status-chip pending">Awaiting Recovery</span>`
    : `<span class="status-chip sent">Recovery Started</span>`;

  // Button
  const btnHTML = isPending
    ? `<button class="rescue-btn" data-id="${cart.id}" onclick="handleRescue('${cart.id}')">Send Rescue Email</button>`
    : `<button class="rescue-btn" disabled>Email Sent ✓</button>`;

  return `
    <article class="cart-card${cart.status === 'sent' ? ' sent' : ''}"
             data-id="${cart.id}"
             data-urgency="${cart.urgency}"
             role="region"
             aria-label="Lost cart — ${escapeHTML(cart.name)}">

      <!-- Top urgency strip -->
      <div class="card-strip"></div>

      <!-- Card head: owner + urgency badge -->
      <div class="card-head">
        <div class="card-owner">
          <span class="card-owner-name">${escapeHTML(cart.name)}</span>
          <span class="card-owner-email">${escapeHTML(cart.email)}</span>
        </div>
        <div class="urgency-badge ${cart.urgency}">
          <div class="urgency-dot"></div>
          ${urgencyLabel}
        </div>
      </div>

      <!-- Card body: items + meta -->
      <div class="card-body">
        <div>
          <div class="card-items-label">Lost Items</div>
          <ul class="card-items-list">
            ${itemRows}
            ${moreRow}
          </ul>
        </div>

        <div class="card-meta">
          <div class="meta-block">
            <span class="meta-label">Cart Value</span>
            <span class="meta-value price">$${cart.total.toFixed(2)}</span>
          </div>
          <div class="meta-block">
            <span class="meta-label">Items</span>
            <span class="meta-value">${cart.itemCount}</span>
          </div>
          <div class="meta-block">
            <span class="meta-label">Case ID</span>
            <span class="meta-value" style="font-family: var(--font-mono); font-size:0.75rem; color:var(--ink-muted)">${cart.id}</span>
          </div>
        </div>
      </div>

      <!-- Card footer: time + status + action -->
      <div class="card-foot">
        <div class="card-time">
          <!-- Clock icon -->
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          ${escapeHTML(cart.abandoned)}
        </div>

        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          ${statusHTML}
          ${btnHTML}
        </div>
      </div>

    </article>
  `;
}

/**
 * Renders all cart cards into the DOM grid.
 */
function renderCards() {
  const grid = document.getElementById('cardsGrid');
  if (!grid) return;

  grid.innerHTML = carts.map(buildCardHTML).join('');
}


/* ─── 5. SEND RESCUE EMAIL ACTION ───────────────── */

/**
 * Called when user clicks "Send Rescue Email" on a card.
 * Updates the cart status, re-renders the card, updates stats.
 * @param {string} cartId — the cart's ID
 */
function handleRescue(cartId) {
  // Find the cart in our data
  const cart = carts.find(c => c.id === cartId);
  if (!cart || cart.status === 'sent') return;

  // Update data
  cart.status = 'sent';
  sentCount++;

  // Update the card in DOM (re-render just this card's article)
  const cardEl = document.querySelector(`.cart-card[data-id="${cartId}"]`);
  if (cardEl) {
    // Inject new HTML
    cardEl.outerHTML = buildCardHTML(cart);

    // Re-select and play the "sent" pulse animation
    const newCard = document.querySelector(`.cart-card[data-id="${cartId}"]`);
    if (newCard) {
      newCard.classList.add('just-sent');
      setTimeout(() => newCard.classList.remove('just-sent'), 700);
    }
  }

  // Update stats bar
  updateStats();

  // Show toast
  showToast(cart.name);
}


/* ─── 6. STATS UPDATER ──────────────────────────── */

/**
 * Recalculates and updates the stats bar values.
 */
function updateStats() {
  const pending = carts.filter(c => c.status === 'pending');
  const sent    = carts.filter(c => c.status === 'sent');

  // Recoverable revenue = pending carts only
  const revenue = pending.reduce((sum, c) => sum + c.total, 0);

  // Animate the numbers by briefly adding a class
  const statSent    = document.getElementById('statSent');
  const statPending = document.getElementById('statPending');
  const statRevenue = document.getElementById('statRevenue');

  if (statSent) {
    statSent.textContent = sent.length;
    flashEl(statSent);
  }
  if (statPending) {
    statPending.textContent = pending.length;
    flashEl(statPending);
  }
  if (statRevenue) {
    statRevenue.textContent = `$${revenue.toFixed(2)}`;
    flashEl(statRevenue);
  }

  // Update notification badge
  const badge = document.getElementById('notifBadge');
  if (badge) {
    badge.textContent = pending.length;
  }
}

/**
 * Briefly applies a flash animation class to an element.
 * @param {HTMLElement} el
 */
function flashEl(el) {
  el.classList.remove('stat-flash');
  // Force reflow to restart animation
  void el.offsetWidth;
  el.classList.add('stat-flash');
}


/* ─── 7. FILTER BUTTONS ─────────────────────────── */

/**
 * Sets up the filter button interactions.
 * Filters cards by urgency level.
 */
function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide cards
      const cards = document.querySelectorAll('.cart-card');
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.urgency === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}


/* ─── 8. TOAST NOTIFICATION ─────────────────────── */

let toastTimer = null;

/**
 * Shows the success toast notification.
 * @param {string} customerName — the name to display in the toast
 */
function showToast(customerName) {
  const toast   = document.getElementById('toast');
  const toastSub = document.getElementById('toastSub');

  if (!toast || !toastSub) return;

  // Update sub-text
  toastSub.textContent = `Rescue email queued for ${customerName}`;

  // Show
  toast.classList.add('show');

  // Auto-hide after 3.5s
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}


/* ─── UTILITY ───────────────────────────────────── */

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/* ─── 9. INIT ───────────────────────────────────── */

/**
 * Bootstraps the dashboard on page load.
 */
function init() {
  renderDate();
  renderCards();
  updateStats();
  initFilters();
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', init);
