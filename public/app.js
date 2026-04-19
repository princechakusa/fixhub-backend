const API_BASE = '/api';
let tickets = [], users = [], inventory = [];
let currentView = 'dashboard';

const contentEl = document.getElementById('content');
const pageTitle = document.getElementById('pageTitle');
const ticketBadge = document.getElementById('ticketBadge');
const dbStatus = document.getElementById('dbStatus');

// Modal elements
const ticketModal = document.getElementById('ticketModal');
const closeModalBtn = document.getElementById('closeTicketModalBtn');
const cancelTicketBtn = document.getElementById('cancelTicketBtn');
const submitTicketBtn = document.getElementById('submitTicketBtn');
const ticketForm = document.getElementById('ticketForm');

// Form inputs
const titleInput = document.getElementById('ticketTitle');
const descInput = document.getElementById('ticketDescription');
const prioritySelect = document.getElementById('ticketPriority');
const categorySelect = document.getElementById('ticketCategory');
const techSelect = document.getElementById('ticketTechnician');
const targetDateInput = document.getElementById('ticketTargetDate');
const locationInput = document.getElementById('ticketLocation');

const views = {
  dashboard: 
    <div class='stats-grid'>
      <div class='stat-card'><div class='stat-icon'><i data-feather='clipboard'></i></div><div class='stat-content'><div class='stat-value' id='statActive'>—</div><div class='stat-label'>Active Tickets</div></div></div>
      <div class='stat-card'><div class='stat-icon'><i data-feather='check-circle'></i></div><div class='stat-content'><div class='stat-value' id='statResolved'>—</div><div class='stat-label'>Resolved Today</div></div></div>
      <div class='stat-card'><div class='stat-icon'><i data-feather='alert-triangle'></i></div><div class='stat-content'><div class='stat-value' id='statAlerts'>—</div><div class='stat-label'>Stock Alerts</div></div></div>
      <div class='stat-card'><div class='stat-icon'><i data-feather='target'></i></div><div class='stat-content'><div class='stat-value' id='statSLA'>—</div><div class='stat-label'>SLA Rate</div></div></div>
    </div>
    <div class='dash-grid'>
      <div class='panel'>
        <div class='panel-header'><span class='panel-title'>Recent Tickets</span><button class='btn-icon' data-goto='tickets'><i data-feather='arrow-right'></i></button></div>
        <table><thead><tr><th>ID</th><th>Title</th><th>Tech</th><th>Status</th></tr></thead><tbody id='recentTicketsBody'></tbody></table>
      </div>
      <div class='panel'>
        <div class='panel-header'><span class='panel-title'>Live Activity</span><span class='live-badge'>● LIVE</span></div>
        <div class='activity-feed' id='activityFeed'></div>
      </div>
    </div>
  ,
  tickets: 
    <div class='panel'>
      <div class='panel-header'><span class='panel-title'>All Tickets</span><button class='btn-primary' id='newTicketViewBtn'><i data-feather='plus'></i> New Ticket</button></div>
      <table><thead><tr><th>ID</th><th>Title</th><th>Tech</th><th>Priority</th><th>Status</th></tr></thead><tbody id='allTicketsBody'></tbody></table>
    </div>
  ,
  users: 
    <div class='panel'>
      <div class='panel-header'><span class='panel-title'>Team Members</span></div>
      <div class='users-grid' id='usersGrid'></div>
    </div>
  ,
  inventory: 
    <div class='panel'>
      <div class='panel-header'><span class='panel-title'>Inventory</span></div>
      <div class='inventory-grid' id='inventoryGrid'></div>
    </div>
  ,
  properties: 
    <div class='panel'>
      <div class='panel-header'>
        <span class='panel-title'>Properties</span>
        <button class='btn-primary' id='addPropertyBtn'><i data-feather='plus'></i> Add Property</button>
      </div>
      <div class='properties-grid' id='propertiesGrid'></div>
    </div>
  
};

// ---------- Initialization ----------
async function init() {
  await loadData();
  renderView('dashboard');
  setupEvents();
  startClock();
  setDefaultTargetDate();
  feather.replace();
}

async function loadData() {
  try {
    const [tRes, uRes, iRes] = await Promise.all([
      fetch(API_BASE + '/tickets'),
      fetch(API_BASE + '/users'),
      fetch(API_BASE + '/inventory')
    ]);
    tickets = await tRes.json();
    users = await uRes.json();
    inventory = await iRes.json();
    dbStatus.textContent = '● Connected';
    dbStatus.style.color = 'var(--success)';
    populateTechnicianDropdown();
  } catch (e) {
    dbStatus.textContent = '● Offline';
    dbStatus.style.color = 'var(--danger)';
  }
}

function renderView(view) {
  currentView = view;
  pageTitle.textContent = view.charAt(0).toUpperCase() + view.slice(1);
  contentEl.innerHTML = views[view] || '<p>Coming soon</p>';
  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.view === view));
  
  if (view === 'dashboard') renderDashboard();
  else if (view === 'tickets') renderTickets();
  else if (view === 'users') renderUsers();
  else if (view === 'inventory') renderInventory();
  else if (view === 'properties') renderProperties();
  
  feather.replace();
  const viewNewTicketBtn = document.getElementById('newTicketViewBtn');
  if (viewNewTicketBtn) viewNewTicketBtn.addEventListener('click', openTicketModal);
  const addPropertyBtn = document.getElementById('addPropertyBtn');
  if (addPropertyBtn) addPropertyBtn.addEventListener('click', () => showToast('Add property coming soon', 'info'));
}

function renderDashboard() {
  const open = tickets.filter(t => t.status !== 'resolved').length;
  const resolved = tickets.filter(t => t.status === 'resolved').length;
  const alerts = inventory.filter(i => i.quantity < i.min_quantity).length;
  const sla = tickets.length ? Math.round((resolved / tickets.length) * 100) : 0;
  
  document.getElementById('statActive').textContent = open;
  document.getElementById('statResolved').textContent = resolved;
  document.getElementById('statAlerts').textContent = alerts;
  document.getElementById('statSLA').textContent = sla + '%';
  ticketBadge.textContent = open;

  const recent = tickets.slice(0, 8);
  document.getElementById('recentTicketsBody').innerHTML = recent.map(t => 
    <tr><td></td><td></td><td></td><td><span class='pill '></span></td></tr>
  ).join('');
  
  document.getElementById('activityFeed').innerHTML = recent.map(t => 
    <div class='activity-item'><div class='activity-dot'></div><div><div class='activity-title'><strong></strong> </div><div class='activity-time'></div></div></div>
  ).join('') || '<p>No recent activity</p>';
}

function renderTickets() {
  document.getElementById('allTicketsBody').innerHTML = tickets.map(t => 
    <tr><td></td><td></td><td></td><td><span class='prio-tag '></span></td><td><span class='pill '></span></td></tr>
  ).join('');
}

function renderUsers() {
  const grid = document.getElementById('usersGrid');
  grid.innerHTML = users.map(u => 
    <div class='user-card'>
      <div class='avatar' style='background:'></div>
      <div class='user-name'></div>
      <div class='user-role'></div>
    </div>
  ).join('');
}

function renderInventory() {
  const grid = document.getElementById('inventoryGrid');
  grid.innerHTML = inventory.map(i => 
    <div class='inventory-item'>
      <strong></strong> —  
      
    </div>
  ).join('');
}

function renderProperties() {
  const grid = document.getElementById('propertiesGrid');
  const sampleProperties = [
    { name: 'Sunset Towers', type: 'Residential', units: 24, openTickets: 3 },
    { name: 'Tech Park Office', type: 'Commercial', units: 12, openTickets: 1 },
    { name: 'Riverside Villa', type: 'Villa', units: 1, openTickets: 0 },
    { name: 'Greenwood Apartments', type: 'Residential', units: 48, openTickets: 5 }
  ];
  grid.innerHTML = sampleProperties.map(p => 
    <div class='property-card'>
      <div class='property-name'></div>
      <div class='property-type'></div>
      <div class='property-stats'>
        <span> units</span>
        <span> open</span>
      </div>
    </div>
  ).join('');
}

function startClock() {
  const update = () => {
    const now = new Date();
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    document.getElementById('liveClock').textContent = ${days[now.getDay()]},    · :;
  };
  update(); setInterval(update, 1000);
}

function setupEvents() {
  document.querySelectorAll('.nav-item[data-view]').forEach(i => i.addEventListener('click', () => renderView(i.dataset.view)));
  document.getElementById('refreshBtn').addEventListener('click', async () => { await loadData(); renderView(currentView); showToast('Refreshed', 'success'); });
  document.getElementById('sidebarToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('collapsed'));
  document.getElementById('mobileMenuBtn').addEventListener('click', () => document.getElementById('sidebar').classList.add('mobile-open'));
  document.addEventListener('click', e => { if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-btn')) document.getElementById('sidebar').classList.remove('mobile-open'); });
  document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => renderView(b.dataset.goto)));
  
  // Ticket Modal
  document.getElementById('newTicketBtn').addEventListener('click', openTicketModal);
  document.getElementById('topNewTicketBtn').addEventListener('click', openTicketModal);
  closeModalBtn.addEventListener('click', closeTicketModal);
  cancelTicketBtn.addEventListener('click', closeTicketModal);
  ticketModal.addEventListener('click', (e) => { if (e.target === ticketModal) closeTicketModal(); });
  submitTicketBtn.addEventListener('click', submitTicket);
}

function openTicketModal() {
  setDefaultTargetDate();
  ticketModal.classList.add('active');
}

function closeTicketModal() {
  ticketModal.classList.remove('active');
  ticketForm.reset();
  setDefaultTargetDate();
}

function setDefaultTargetDate() {
  const today = new Date();
  today.setDate(today.getDate() + 3);
  targetDateInput.value = today.toISOString().split('T')[0];
}

function populateTechnicianDropdown() {
  techSelect.innerHTML = '<option value="">Unassigned</option>';
  users.filter(u => u.access_level !== 'manager').forEach(u => {
    const option = document.createElement('option');
    option.value = u.name;
    option.textContent = u.name;
    techSelect.appendChild(option);
  });
}

async function submitTicket() {
  const title = titleInput.value.trim();
  const targetDate = targetDateInput.value;
  if (!title) { showToast('Title is required', 'error'); return; }
  if (!targetDate) { showToast('Target date is required', 'error'); return; }

  const ticketData = {
    title,
    description: descInput.value.trim() || '—',
    technician: techSelect.value || 'Unassigned',
    priority: prioritySelect.value,
    status: 'registered',
    target_date: targetDate,
    created_by: 'Prince Chakusa',
    location: locationInput.value.trim(),
    category: categorySelect.value
  };

  try {
    const res = await fetch(API_BASE + '/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData)
    });
    if (!res.ok) throw new Error('Failed to create ticket');
    const newTicket = await res.json();
    tickets.unshift(newTicket);
    closeTicketModal();
    renderView(currentView);
    showToast(Ticket  created, 'success');
  } catch (err) {
    showToast('Error creating ticket', 'error');
    console.error(err);
  }
}

function showToast(msg, type='') {
  const toast = document.createElement('div');
  toast.className = 	oast ;
  toast.textContent = msg;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

init();
