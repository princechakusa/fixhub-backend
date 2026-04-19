import { checkAuth, login, logout, updateUserUI } from './auth.js';
import { showToast } from './utils.js';
import { loadDashboard, refreshDashboard } from './dashboard.js';
import { loadTickets, initTicketsModule } from './tickets.js';
import { loadUsers } from './users.js';

async function gotoView(viewName) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`.nav-item[data-view="${viewName}"]`)?.classList.add('active');
  const titles = { dashboard:'Dashboard', tickets:'Tickets', users:'Users' };
  document.getElementById('page-title').textContent = titles[viewName] || viewName;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewName}`).classList.add('active');
  if (viewName === 'dashboard') await loadDashboard();
  else if (viewName === 'tickets') await loadTickets();
  else if (viewName === 'users') await loadUsers();
}

function setupEventListeners() {
  document.querySelectorAll('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', () => gotoView(item.dataset.view));
  });
  document.getElementById('logout-btn')?.addEventListener('click', async () => { await logout(); });
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    const active = document.querySelector('.view.active')?.id;
    if (active === 'view-dashboard') refreshDashboard();
    else if (active === 'view-tickets') loadTickets();
    else if (active === 'view-users') loadUsers();
    showToast('Refreshed', 'success');
  });
  document.getElementById('collapse-btn')?.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('collapsed'));
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('mobile-open'));
}

async function initApp() {
  const user = await checkAuth();
  if (user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    updateUserUI(user);
    setupEventListeners();
    initTicketsModule();
    await gotoView('dashboard');
    setInterval(() => { document.getElementById('live-clock').innerText = new Date().toLocaleTimeString(); }, 1000);
  } else {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
    setupLoginHandler();
  }
}

function setupLoginHandler() {
  const loginBtn = document.getElementById('login-btn');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const errorDiv = document.getElementById('login-error');
  const doLogin = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) { errorDiv.textContent = 'Please enter email and password'; errorDiv.style.display = 'block'; return; }
    try {
      await login(email, password);
      errorDiv.style.display = 'none';
      initApp();
    } catch (err) { errorDiv.textContent = err.message || 'Login failed'; errorDiv.style.display = 'block'; }
  };
  loginBtn.addEventListener('click', doLogin);
  emailInput.addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });
  passwordInput.addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });
}

initApp();
