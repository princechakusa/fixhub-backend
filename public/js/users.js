export async function loadUsers() {
  const container = document.getElementById('view-users');
  if (!container) return;
  container.innerHTML = '<div class="table-container"><p style="padding:40px;text-align:center">User management coming soon.</p></div>';
}
