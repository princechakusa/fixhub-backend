import { apiFetch } from './api.js';
import { showToast } from './utils.js';

export async function loadDashboard() {
  try {
    const tickets = await apiFetch('/tickets');
    renderStats(tickets);
    renderRecentTickets(tickets);
  } catch (err) {
    showToast('Failed to load dashboard: ' + err.message, 'error');
  }
}

function renderStats(tickets) {
  const active = tickets.filter(t => t.status !== 'resolved').length;
  const resolved = tickets.filter(t => t.status === 'resolved').length;
  const total = tickets.length;
  const statsHtml = `
    <div class="stats-grid">
      <div class="stat-card"><h3>Active Tickets</h3><div class="stat-value">${active}</div></div>
      <div class="stat-card"><h3>Resolved</h3><div class="stat-value">${resolved}</div></div>
      <div class="stat-card"><h3>Total Tickets</h3><div class="stat-value">${total}</div></div>
      <div class="stat-card"><h3>Resolution Rate</h3><div class="stat-value">${total ? Math.round((resolved/total)*100) : 0}%</div></div>
    </div>
  `;
  const dashboardView = document.getElementById('view-dashboard');
  if (dashboardView) {
    dashboardView.innerHTML = statsHtml + '<div class="table-container"><h3 style="margin-bottom:12px">Recent Tickets</h3><div id="recent-tickets-table"></div></div>';
    renderRecentTickets(tickets);
  }
}

function renderRecentTickets(tickets) {
  const container = document.getElementById('recent-tickets-table');
  if (!container) return;
  const recent = tickets.slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = '<p style="padding:20px; text-align:center; color:var(--text-muted)">No tickets found</p>';
    return;
  }
  const table = `
    <table><thead><tr><th>ID</th><th>Title</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
    <tbody>${recent.map(t => `<tr><td>${escapeHtml(t.id)}</td><td>${escapeHtml(t.title)}</td><td><span class="priority-tag ${t.priority}">${t.priority}</span></td><td><span class="pill ${t.status}">${t.status}</span></td><td>${t.date_logged || '—'}</td></tr>`).join('')}</tbody>
    </table>
  `;
  container.innerHTML = table;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

export function refreshDashboard() {
  loadDashboard();
}
