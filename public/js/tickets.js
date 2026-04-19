import { apiFetch } from './api.js';
import { showToast, openModal, closeModal } from './utils.js';

let editingTicketId = null;

export async function loadTickets() {
  try {
    const tickets = await apiFetch('/tickets');
    renderTicketsTable(tickets);
    updateTicketBadge(tickets);
    return tickets;
  } catch (err) {
    showToast('Failed to load tickets: ' + err.message, 'error');
  }
}

function renderTicketsTable(tickets) {
  const container = document.getElementById('view-tickets');
  if (!container) return;
  if (tickets.length === 0) {
    container.innerHTML = '<div class="table-container"><p style="padding:40px;text-align:center">No tickets found</p></div>';
    return;
  }
  const table = `<div class="table-container"><table><thead><tr><th>ID</th><th>Title</th><th>Priority</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>
    ${tickets.map(t => `<tr><td>${escapeHtml(t.id)}</td><td>${escapeHtml(t.title)}</td><td><span class="priority-tag ${t.priority}">${t.priority}</span></td><td><span class="pill ${t.status}">${t.status}</span></td><td>${t.date_logged || '—'}</td><td><button class="action-btn edit-ticket" data-id="${t.id}">✏️</button><button class="action-btn delete-ticket" data-id="${t.id}">🗑️</button></td></tr>`).join('')}
    </tbody></table></div>`;
  container.innerHTML = table;
  document.querySelectorAll('.edit-ticket').forEach(btn => btn.addEventListener('click', () => openEditTicket(btn.dataset.id)));
  document.querySelectorAll('.delete-ticket').forEach(btn => btn.addEventListener('click', () => deleteTicket(btn.dataset.id)));
}

export function openTicketModal(ticket = null) {
  editingTicketId = ticket ? ticket.id : null;
  document.getElementById('modal-title').textContent = ticket ? 'Edit Ticket' : 'New Ticket';
  document.getElementById('ticket-title').value = ticket ? ticket.title : '';
  document.getElementById('ticket-desc').value = ticket ? (ticket.description || '') : '';
  document.getElementById('ticket-priority').value = ticket ? ticket.priority : 'medium';
  document.getElementById('ticket-status').value = ticket ? ticket.status : 'registered';
  openModal('ticket-modal');
}

export async function saveTicket() {
  const title = document.getElementById('ticket-title').value.trim();
  const description = document.getElementById('ticket-desc').value.trim();
  const priority = document.getElementById('ticket-priority').value;
  const status = document.getElementById('ticket-status').value;
  if (!title) { showToast('Title is required', 'error'); return; }
  const payload = { title, description, priority, status };
  try {
    if (editingTicketId) {
      await apiFetch(`/tickets/${editingTicketId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Ticket updated', 'success');
    } else {
      await apiFetch('/tickets', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Ticket created', 'success');
    }
    closeModal('ticket-modal');
    await loadTickets();
    const dashboardView = document.getElementById('view-dashboard');
    if (dashboardView && dashboardView.classList.contains('active')) {
      const { refreshDashboard } = await import('./dashboard.js');
      refreshDashboard();
    }
  } catch (err) { showToast('Failed to save ticket: ' + err.message, 'error'); }
}

async function openEditTicket(id) {
  try {
    const tickets = await apiFetch('/tickets');
    const ticket = tickets.find(t => t.id === id);
    if (ticket) openTicketModal(ticket);
    else showToast('Ticket not found', 'error');
  } catch (err) { showToast('Error loading ticket', 'error'); }
}

async function deleteTicket(id) {
  if (!confirm('Delete this ticket?')) return;
  try {
    await apiFetch(`/tickets/${id}`, { method: 'DELETE' });
    showToast('Ticket deleted', 'success');
    await loadTickets();
    const dashboardView = document.getElementById('view-dashboard');
    if (dashboardView && dashboardView.classList.contains('active')) {
      const { refreshDashboard } = await import('./dashboard.js');
      refreshDashboard();
    }
  } catch (err) { showToast('Failed to delete ticket: ' + err.message, 'error'); }
}

function updateTicketBadge(tickets) {
  const badge = document.getElementById('ticket-badge');
  if (badge) badge.textContent = tickets.filter(t => t.status !== 'resolved').length;
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

export function initTicketsModule() {
  document.getElementById('new-ticket-fab')?.addEventListener('click', () => openTicketModal());
  document.getElementById('save-ticket-btn')?.addEventListener('click', saveTicket);
  document.querySelector('#ticket-modal .close-modal')?.addEventListener('click', () => closeModal('ticket-modal'));
  document.querySelector('#ticket-modal .cancel-modal')?.addEventListener('click', () => closeModal('ticket-modal'));
}
