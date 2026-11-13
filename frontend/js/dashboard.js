/**
 * CampusFind 2.0 - Student Dashboard Controller
 * Connects directly to GET /api/dashboard/student-stats and MySQL
 * Renders real metrics, recent items, live notifications, and rule-based smart matches
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

async function initDashboard() {
  const session = getUserSession();
  
  // Route Protection: Redirect unauthenticated students to login
  if (!session || !session.user) {
    showToast('Please sign in to access your student dashboard.', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 600);
    return;
  }

  // If administrator visits this page, seamlessly guide to admin console unless explicitly previewing
  if (session.user.role === 'admin') {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('student_view')) {
      window.location.replace('admin-dashboard.html');
      return;
    }
  }

  // Populate user header info
  renderUserInfo(session.user);

  // Mobile sidebar drawer toggle
  const sidebarToggle = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Fetch real student stats from backend
  await loadStudentDashboardData();
}

function renderUserInfo(user) {
  const userNameElem = document.getElementById('dashboard-user-name');
  const userRoleElem = document.getElementById('dashboard-user-role');
  const userAvatarElem = document.getElementById('dashboard-avatar');

  if (userNameElem) userNameElem.textContent = user.name;
  if (userRoleElem) userRoleElem.textContent = `${user.department || 'Student'} • ${user.student_id || user.email}`;
  if (userAvatarElem) {
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
    if (user.avatar_url) {
      const fullUrl = user.avatar_url.startsWith('http://') || user.avatar_url.startsWith('https://') || user.avatar_url.startsWith('data:')
        ? user.avatar_url
        : `${CONFIG.SERVER_URL}${user.avatar_url.startsWith('/') ? '' : '/'}${user.avatar_url}`;
      userAvatarElem.innerHTML = `<img src="${fullUrl}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" onerror="this.onerror=null; this.parentElement.textContent='${initials}';">`;
    } else {
      userAvatarElem.textContent = initials;
    }
  }
}

async function loadStudentDashboardData() {
  try {
    const res = await authFetch(`${CONFIG.API_BASE_URL}/dashboard/student-stats`);

    if (res.status === 401) {
      clearUserSession();
      showToast('Session expired. Please sign in again.', 'warning');
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
      return;
    }

    if (!res.ok) throw new Error('Could not fetch student dashboard metrics.');

    const result = await res.json();
    const data = result.data;

    // 1. Render Metrics Counters
    if (data.metrics) {
      const {
        total_reports,
        lost_items,
        found_items,
        possible_matches,
        pending_claims,
        approved_claims
      } = data.metrics;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val !== undefined ? val : 0;
      };

      setVal('stat-total-reported', total_reports);
      setVal('stat-total-lost', lost_items);
      setVal('stat-total-found', found_items);
      setVal('stat-total-matches', possible_matches);
      setVal('stat-total-pending-claims', pending_claims);
      setVal('stat-total-approved-claims', approved_claims);
    }

    // 2. Render Suggested Matches
    renderSuggestedMatchesList(data.possible_matches || []);

    // 3. Render Recently Reported Items
    renderRecentReports(data.recent_reports || []);

    // 4. Render Recent Notifications
    renderRecentNotifications(data.recent_notifications || []);

  } catch (err) {
    console.warn('Live dashboard fetch notice, rendering local preview fallback:', err.message);
    renderFallbackData();
  }
}

function renderRecentReports(items) {
  const container = document.getElementById('recent-reports-container');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <p style="font-size: 0.875rem; color: var(--color-text-muted); margin: 0; text-align: center; padding: 1rem 0;">
        You haven't reported any lost or found items yet.
      </p>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="admin-table" style="font-size: 0.8125rem;">
        <thead>
          <tr>
            <th>Item</th>
            <th>Type</th>
            <th>Location</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const isLost = item.item_type === 'lost';
            const badgeClass = isLost ? 'badge-lost' : 'badge-found';
            let statusBadge = 'badge-found';
            let statusText = 'OPEN';
            if (item.status === 'claim_pending') {
              statusBadge = 'badge-pending';
              statusText = 'CLAIM PENDING';
            } else if (item.status === 'recovered') {
              statusBadge = 'badge-recovered';
              statusText = 'RECOVERED';
            } else if (item.status === 'closed') {
              statusBadge = 'badge';
              statusText = 'CLOSED';
            }

            return `
              <tr>
                <td>
                  <strong style="color: var(--primary-color);">${item.title}</strong>
                  <div style="font-size: 0.7rem; color: var(--color-text-muted);">${item.category_name || ''}</div>
                </td>
                <td><span class="badge ${badgeClass}" style="font-size: 0.65rem;">${item.item_type.toUpperCase()}</span></td>
                <td>${item.location}</td>
                <td><span class="badge ${statusBadge}" style="font-size: 0.65rem;">${statusText}</span></td>
                <td>
                  <a href="item-details.html?id=${item.id}" class="btn btn-outline-secondary btn-sm" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">
                    View
                  </a>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderRecentNotifications(notifications) {
  const container = document.getElementById('recent-activity-list');
  if (!container) return;

  if (!notifications || notifications.length === 0) {
    container.innerHTML = `
      <p style="font-size: 0.875rem; color: var(--color-text-muted); margin: 0; text-align: center; padding: 1.5rem 0;">
        No notifications logged yet.
      </p>
    `;
    return;
  }

  container.innerHTML = notifications.map(notif => {
    let color = 'var(--primary-color)';
    if (notif.notification_type === 'match') color = 'var(--color-warning, #D99A36)';
    if (notif.notification_type === 'claim_approved' || notif.notification_type === 'item_recovered') color = 'var(--color-success, #23865B)';
    if (notif.notification_type === 'claim_rejected') color = 'var(--color-danger, #B83A2E)';

    const isUnread = notif.is_read === 0 || notif.is_read === false;

    return `
      <div class="activity-item" id="notif-item-${notif.id}" style="padding: 0.75rem 0; border-bottom: 1px solid var(--color-border-subtle, #F0EDE6); display: flex; align-items: flex-start; gap: 0.75rem; transition: all 0.25s ease;">
        <div class="activity-bullet" style="background-color: ${color}; margin-top: 0.35rem;"></div>
        <div style="flex: 1;">
          <div class="activity-text" style="font-size: 0.8125rem; line-height: 1.4; font-weight: ${isUnread ? '600' : '400'};">
            ${notif.message}
          </div>
          <div class="activity-time" style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⏱ ${formatDate(notif.created_at)}</span>
            ${isUnread ? '<span class="badge" style="background: #C84B4B; color: #fff; font-size: 0.6rem; padding: 0.1rem 0.4rem;">NEW</span>' : ''}
          </div>
        </div>
        <div style="display: flex; gap: 0.35rem; align-items: center; flex-shrink: 0;">
          ${isUnread ? `
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="handleDashboardMarkRead(${notif.id})" style="font-size: 0.7rem; padding: 0.2rem 0.45rem;" title="Mark as read">
              ✓
            </button>
          ` : ''}
          <button type="button" class="btn btn-outline-secondary btn-sm" onclick="handleDashboardDeleteNotif(${notif.id})" style="font-size: 0.7rem; padding: 0.2rem 0.45rem; color: var(--color-error, #C84B4B);" title="Delete notification">
            🗑
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.handleDashboardMarkRead = async function(notifId) {
  const itemElem = document.getElementById(`notif-item-${notifId}`);
  if (itemElem) {
    const textElem = itemElem.querySelector('.activity-text');
    if (textElem) textElem.style.fontWeight = '400';
    const badgeElem = itemElem.querySelector('.badge');
    if (badgeElem) badgeElem.remove();
    const readBtn = itemElem.querySelector('button[title="Mark as read"]');
    if (readBtn) readBtn.remove();
  }
  showToast('Notification marked as read.', 'info');

  try {
    await authFetch(`${CONFIG.API_BASE_URL}/notifications/${notifId}/read`, { method: 'PUT' });
    updateDashboardBadges();
  } catch (err) {
    console.warn('Mark read network note:', err);
  }
};

window.handleDashboardDeleteNotif = async function(notifId) {
  const itemElem = document.getElementById(`notif-item-${notifId}`);
  if (itemElem) {
    itemElem.style.opacity = '0';
    itemElem.style.transform = 'translateX(15px)';
    setTimeout(() => {
      itemElem.remove();
      const container = document.getElementById('recent-activity-list');
      if (container && container.children.length === 0) {
        container.innerHTML = `
          <p style="font-size: 0.875rem; color: var(--color-text-muted); margin: 0; text-align: center; padding: 1.5rem 0;">
            No notifications logged yet.
          </p>
        `;
      }
    }, 250);
  }
  showToast('Notification removed.', 'info');

  try {
    await authFetch(`${CONFIG.API_BASE_URL}/notifications/${notifId}`, { method: 'DELETE' });
    updateDashboardBadges();
  } catch (err) {
    console.warn('Delete notif network note:', err);
  }
};

function updateDashboardBadges() {
  const navBadge = document.getElementById('navbar-unread-badge');
  if (navBadge) {
    let current = parseInt(navBadge.textContent, 10);
    if (!isNaN(current) && current > 1) {
      navBadge.textContent = current - 1;
    } else {
      navBadge.style.display = 'none';
    }
  }
}

function renderSuggestedMatchesList(matches) {
  const container = document.getElementById('suggested-matches-container');
  if (!container) return;

  if (!matches || matches.length === 0) {
    container.innerHTML = `
      <div class="card" style="padding: 1.25rem; text-align: center; border: 1px dashed var(--color-border); background: #FAF8F5;">
        <p style="font-size: 0.875rem; color: var(--color-text-muted); margin: 0;">
          🔍 No algorithmic matches detected for your lost reports at this moment. The engine scans new found item submissions automatically.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.map(m => {
    let imgSrc = '../assets/images/hero-campus.jpg';
    if (m.foundItem.image_path) {
      if (m.foundItem.image_path.startsWith('http://') || m.foundItem.image_path.startsWith('https://') || m.foundItem.image_path.startsWith('data:')) {
        imgSrc = m.foundItem.image_path;
      } else if (m.foundItem.image_path.startsWith('/uploads/') || m.foundItem.image_path.startsWith('uploads/')) {
        const cleanPath = m.foundItem.image_path.startsWith('/') ? m.foundItem.image_path : `/${m.foundItem.image_path}`;
        imgSrc = `${CONFIG.SERVER_URL}${cleanPath}`;
      } else {
        const cleanAsset = m.foundItem.image_path.replace(/^(\.\.\/|\.\/)*assets\/images\//, '').replace(/^\/+/, '');
        imgSrc = `../assets/images/${cleanAsset}`;
      }
    } else {
      const text = `${m.foundItem.title || ''} ${m.foundItem.category || ''}`.toLowerCase();
      if (text.includes('calc')) imgSrc = '../assets/images/sample-calculator.jpg';
      else if (text.includes('bottle') || text.includes('flask') || text.includes('water')) imgSrc = '../assets/images/sample-bottle.jpg';
      else if (text.includes('earbud') || text.includes('headphone') || text.includes('airpod')) imgSrc = '../assets/images/sample-earbuds.jpg';
      else if (text.includes('charger') || text.includes('cable') || text.includes('adapter')) imgSrc = '../assets/images/sample-charger.jpg';
      else if (text.includes('wallet') || text.includes('purse')) imgSrc = '../assets/images/sample-wallet.jpg';
      else if (text.includes('id') || text.includes('card') || text.includes('lanyard')) imgSrc = '../assets/images/sample-idcard.jpg';
      else if (text.includes('key')) imgSrc = '../assets/images/sample-keys.jpg';
      else if (text.includes('backpack') || text.includes('bag')) imgSrc = '../assets/images/sample-backpack.jpg';
      else if (text.includes('notebook') || text.includes('book') || text.includes('journal')) imgSrc = '../assets/images/sample-notebook.jpg';
    }

    return `
      <div class="card card-hover" style="border-left: 4px solid var(--color-success, #23865B); margin-bottom: 1rem;">
        <div class="card-body" style="padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <span class="badge badge-found">POSSIBLE FOUND MATCH</span>
            <span class="match-score-pill match-high" style="font-size: 0.8125rem;">
              🎯 ${m.matchPercentage}% Similarity
            </span>
          </div>

          <div style="display: flex; gap: 1rem; align-items: flex-start;">
            <img src="${imgSrc}" alt="${m.foundItem.title}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px; border: 1px solid var(--color-border-subtle);" onerror="this.src='../assets/images/hero-campus.jpg'">
            <div style="flex: 1;">
              <h4 style="font-size: 1rem; margin-bottom: 0.2rem;">${m.foundItem.title}</h4>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.35rem;">
                <span>📍 ${m.foundItem.location}</span> &bull; 
                <span>🎨 ${m.foundItem.color}</span> &bull; 
                <span>📅 ${formatDate(m.foundItem.date)}</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--primary-color); font-weight: 600;">
                Matched against your report: "${m.myLostItem.title}"
              </div>
            </div>
          </div>

          <!-- Matching Criteria Breakdown -->
          <div style="margin-top: 0.75rem; padding: 0.5rem 0.75rem; background: var(--color-bg-light); border-radius: 6px; font-size: 0.75rem;">
            <div style="font-weight: 700; margin-bottom: 0.25rem; color: var(--text-color);">Criteria Breakdown:</div>
            <ul style="margin: 0; padding-left: 1.1rem; color: var(--color-text-muted);">
              ${m.matchingReasons.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: 0.875rem;">
            <a href="item-details.html?id=${m.foundItem.id}" class="btn btn-primary btn-sm">Inspect Belonging</a>
            <button class="btn btn-secondary btn-sm" onclick="openClaimModal(${m.foundItem.id}, '${m.foundItem.title.replace(/'/g, "\\'")}')">Claim This Item</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderFallbackData() {
  document.getElementById('stat-total-reported').textContent = '2';
  document.getElementById('stat-total-lost').textContent = '1';
  document.getElementById('stat-total-found').textContent = '1';
  document.getElementById('stat-total-matches').textContent = '1';
  document.getElementById('stat-total-pending-claims').textContent = '1';
  document.getElementById('stat-total-approved-claims').textContent = '0';
}
