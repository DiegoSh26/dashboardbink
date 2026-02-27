// Binkbe Dashboard v1.0.2

const VERSION = '1.0.2';

// --- Navigation ---
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const section = item.dataset.section;
    activateSection(section);
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
  });
});

function activateSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('section-' + name);
  if (target) target.classList.add('active');

  const titles = { overview: 'Resumen', analytics: 'Analíticas', users: 'Usuarios', settings: 'Configuración' };
  document.getElementById('page-title').textContent = titles[name] || name;
}

// --- Sample Data ---
const recentActivity = [
  { id: '#1042', user: 'Ana García', action: 'Nuevo pedido', date: '27 Feb 2026', status: 'success' },
  { id: '#1041', user: 'Carlos López', action: 'Actualización perfil', date: '27 Feb 2026', status: 'success' },
  { id: '#1040', user: 'María Torres', action: 'Pago procesado', date: '26 Feb 2026', status: 'pending' },
  { id: '#1039', user: 'Luis Martínez', action: 'Nuevo pedido', date: '26 Feb 2026', status: 'success' },
  { id: '#1038', user: 'Sofía Ruiz', action: 'Error de pago', date: '25 Feb 2026', status: 'error' },
];

const users = [
  { id: 1, name: 'Ana García', email: 'ana@binkbe.com', role: 'Administrador', status: 'success' },
  { id: 2, name: 'Carlos López', email: 'carlos@binkbe.com', role: 'Editor', status: 'success' },
  { id: 3, name: 'María Torres', email: 'maria@binkbe.com', role: 'Viewer', status: 'pending' },
  { id: 4, name: 'Luis Martínez', email: 'luis@binkbe.com', role: 'Editor', status: 'success' },
  { id: 5, name: 'Sofía Ruiz', email: 'sofia@binkbe.com', role: 'Viewer', status: 'error' },
];

const statusLabels = { success: 'Activo', pending: 'Pendiente', error: 'Inactivo' };

// --- Render Activity Table ---
function renderActivityTable() {
  const tbody = document.getElementById('activity-table');
  if (!tbody) return;
  tbody.innerHTML = recentActivity.map(row => `
    <tr>
      <td>${escapeHtml(row.id)}</td>
      <td>${escapeHtml(row.user)}</td>
      <td>${escapeHtml(row.action)}</td>
      <td>${escapeHtml(row.date)}</td>
      <td><span class="status-badge ${row.status}">${escapeHtml(statusLabels[row.status] || row.status)}</span></td>
    </tr>
  `).join('');
}

// --- Render Users Table ---
function renderUsersTable() {
  const tbody = document.getElementById('users-table');
  if (!tbody) return;
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${escapeHtml(String(u.id))}</td>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(u.role)}</td>
      <td><span class="status-badge ${u.status}">${escapeHtml(statusLabels[u.status] || u.status)}</span></td>
    </tr>
  `).join('');
}

// --- Escape HTML ---
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// --- Chart helpers (plain canvas) ---
function drawBarChart(canvasId, labels, values, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const padding = { top: 16, right: 16, bottom: 32, left: 40 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const max = Math.max(...values) * 1.15 || 1;
  const barW = (chartW / labels.length) * 0.55;
  const gap = (chartW / labels.length) * 0.45;

  ctx.clearRect(0, 0, w, h);

  // Grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + chartH - (i / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round((max * i) / 4), padding.left - 6, y + 4);
  }

  // Bars
  labels.forEach((label, i) => {
    const x = padding.left + i * (barW + gap) + gap / 2;
    const barH = (values[i] / max) * chartH;
    const y = padding.top + chartH - barH;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 4);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + barW / 2, padding.top + chartH + 18);
  });
}

function drawDonutChart(canvasId, slices) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = Math.min(cx, cy) - 20;
  const innerR = r * 0.55;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const total = slices.reduce((s, v) => s + v.value, 0);
  let startAngle = -Math.PI / 2;

  slices.forEach(slice => {
    const angle = (slice.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    startAngle += angle;
  });

  // Inner hole
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Center label
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy - 8);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('total', cx, cy + 10);
}

// --- Settings save ---
function saveSettings(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.btn-save');
  const original = btn.textContent;
  btn.textContent = '¡Guardado!';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 1800);
}

// --- Init ---
function init() {
  renderActivityTable();
  renderUsersTable();

  // Monthly activity chart
  drawBarChart(
    'activity-chart',
    ['Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'],
    [320, 410, 380, 520, 460, 610],
    '#4f46e5'
  );

  // Distribution donut
  drawDonutChart('distribution-chart', [
    { value: 540, color: '#4f46e5' },
    { value: 320, color: '#818cf8' },
    { value: 180, color: '#c7d2fe' },
    { value: 208, color: '#e0e7ff' },
  ]);

  // Visits chart
  drawBarChart(
    'visits-chart',
    ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    [2100, 2450, 1980, 2700, 3100, 1600, 1300],
    '#6366f1'
  );
}

document.addEventListener('DOMContentLoaded', init);
