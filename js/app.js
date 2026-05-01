// STATE
const defaultCategories = [
  { name: 'Food', color: '#3ecf8e' },
  { name: 'Transport', color: '#7c6af7' },
  { name: 'Fun', color: '#ff8c5a' },
  { name: 'Health', color: '#5bc4e0' },
  { name: 'Shopping', color: '#f5c842' },
];

let state = {
  transactions: [],
  categories: [...defaultCategories],
  spendingLimit: 0,
  currentView: 'dashboard',
  sortBy: 'date',
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  theme: 'dark',
};

// STORAGE 
function saveState() {
  localStorage.setItem('expenseAppState', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('expenseAppState');
  if (saved) {
    const parsed = JSON.parse(saved);
    state = { ...state, ...parsed };
    // Ensure categories have correct structure
    if (!state.categories || !state.categories.length) {
      state.categories = [...defaultCategories];
    }
  }
}

// CHART
let pieChart = null;

function initChart() {
  const ctx = document.getElementById('pieChart').getContext('2d');
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(28, 28, 38, 0.95)',
          titleColor: '#f0f0f8',
          bodyColor: '#8888aa',
          borderColor: '#2a2a3a',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: ctx => ` ${formatCurrency(ctx.raw)}  (${ctx.label})`
          }
        }
      },
      animation: { animateRotate: true, duration: 600 }
    }
  });
}

// UTILS
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getCategoryColor(catName) {
  const cat = state.categories.find(c => c.name === catName);
  return cat ? cat.color : '#8888aa';
}

function getTotalExpenses() {
  return state.transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

function getThisMonthTransactions() {
  const now = new Date();
  return state.transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

function showToast(message, icon = '✓') {
  const toast = document.getElementById('toast');
  toast.innerHTML = `<span>${icon}</span> ${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// RENDER
function renderAll() {
  renderBalance();
  renderTransactions();
  renderChart();
  renderCategoryBreakdown();
  renderCategorySelect();
  renderLimitWarning();
  renderMonthlyView();
}

function renderBalance() {
  const total = getTotalExpenses();
  const monthTotal = getThisMonthTransactions().reduce((s, t) => s + t.amount, 0);
  const txCount = state.transactions.length;

  document.getElementById('balanceAmount').textContent = formatCurrency(total);
  document.getElementById('statMonth').textContent = formatCurrency(monthTotal);
  document.getElementById('statCount').textContent = txCount + ' items';
}

function renderLimitWarning() {
  const total = getTotalExpenses();
  const warning = document.getElementById('limitWarning');
  const limit = state.spendingLimit;

  if (limit > 0 && total > limit) {
    warning.classList.add('show');
    warning.innerHTML = `⚠️ <strong>Batas terlampaui!</strong> Pengeluaran (${formatCurrency(total)}) sudah melebihi batas ${formatCurrency(limit)}.`;
  } else {
    warning.classList.remove('show');
  }
}

function getSortedTransactions(transactions) {
  const list = [...transactions];
  if (state.sortBy === 'amount-asc') return list.sort((a, b) => a.amount - b.amount);
  if (state.sortBy === 'amount-desc') return list.sort((a, b) => b.amount - a.amount);
  if (state.sortBy === 'category') return list.sort((a, b) => a.category.localeCompare(b.category));
  return list.sort((a, b) => new Date(b.date) - new Date(a.date)); // default: newest first
}

function renderTransactions() {
  const container = document.getElementById('transactionList');
  const sorted = getSortedTransactions(state.transactions);

  if (!sorted.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>Belum ada transaksi.<br>Tambah yang pertama!</p>
      </div>`;
    return;
  }

  const total = getTotalExpenses();
  container.innerHTML = sorted.map(tx => {
    const color = getCategoryColor(tx.category);
    const isOver = state.spendingLimit > 0 && tx.amount > state.spendingLimit * 0.5;
    const date = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return `
      <div class="transaction-item ${isOver ? 'over-limit' : ''}" data-id="${tx.id}">
        <div class="tx-dot" style="background:${color}"></div>
        <div class="tx-info">
          <div class="tx-name">${tx.name}</div>
          <div class="tx-meta">
            <span class="tx-category">${tx.category}</span>
            <span class="tx-date">${date}</span>
          </div>
        </div>
        <div class="tx-amount">${formatCurrency(tx.amount)}</div>
        <button class="tx-delete" onclick="deleteTransaction('${tx.id}')">✕</button>
      </div>`;
  }).join('');
}

function renderChart() {
  if (!pieChart) return;
  const catTotals = {};
  state.transactions.forEach(tx => {
    catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount;
  });

  const labels = Object.keys(catTotals);
  const data = Object.values(catTotals);
  const colors = labels.map(l => getCategoryColor(l));

  pieChart.data.labels = labels;
  pieChart.data.datasets[0].data = data;
  pieChart.data.datasets[0].backgroundColor = colors;
  pieChart.update();
}

function renderCategoryBreakdown() {
  const container = document.getElementById('categoryBreakdown');
  const total = getTotalExpenses();
  const catTotals = {};
  state.transactions.forEach(tx => {
    catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount;
  });

  const entries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  if (!entries.length) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px 0">Belum ada data kategori</p>';
    return;
  }

  container.innerHTML = entries.map(([cat, amount]) => {
    const pct = total > 0 ? (amount / total * 100).toFixed(1) : 0;
    const color = getCategoryColor(cat);
    return `
      <div class="category-row">
        <div class="cat-dot" style="background:${color}"></div>
        <span class="cat-name">${cat}</span>
        <div class="cat-bar-wrap">
          <div class="cat-bar" style="width:${pct}%;background:${color}"></div>
        </div>
        <span class="cat-amount" style="color:${color}">${formatCurrency(amount)}</span>
      </div>`;
  }).join('');
}

function renderCategorySelect() {
  const select = document.getElementById('categorySelect');
  const current = select.value;
  select.innerHTML = state.categories.map(c =>
    `<option value="${c.name}" ${c.name === current ? 'selected' : ''}>${c.name}</option>`
  ).join('');
}

function renderMonthlyView() {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  document.getElementById('monthLabel').textContent =
    `${monthNames[state.currentMonth]} ${state.currentYear}`;

  const monthTx = state.transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === state.currentMonth && d.getFullYear() === state.currentYear;
  });

  const total = monthTx.reduce((s, t) => s + t.amount, 0);
  const count = monthTx.length;
  const avg = count > 0 ? total / count : 0;

  document.getElementById('monthTotal').textContent = formatCurrency(total);
  document.getElementById('monthCount').textContent = count;
  document.getElementById('monthAvg').textContent = formatCurrency(avg);

  // Monthly transactions
  const sorted = getSortedTransactions(monthTx);
  const list = document.getElementById('monthTransactionList');

  if (!sorted.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div><p>Tidak ada transaksi bulan ini</p></div>`;
    return;
  }

  list.innerHTML = sorted.map(tx => {
    const color = getCategoryColor(tx.category);
    const date = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return `
      <div class="transaction-item" data-id="${tx.id}">
        <div class="tx-dot" style="background:${color}"></div>
        <div class="tx-info">
          <div class="tx-name">${tx.name}</div>
          <div class="tx-meta">
            <span class="tx-category">${tx.category}</span>
            <span class="tx-date">${date}</span>
          </div>
        </div>
        <div class="tx-amount">${formatCurrency(tx.amount)}</div>
        <button class="tx-delete" onclick="deleteTransaction('${tx.id}')">✕</button>
      </div>`;
  }).join('');
}

// ACTIONS 
function addTransaction(e) {
  e.preventDefault();

  const name = document.getElementById('itemName').value.trim();
  const amount = parseFloat(document.getElementById('itemAmount').value);
  const category = document.getElementById('categorySelect').value;

  // Validate
  let valid = true;
  if (!name) {
    document.getElementById('nameError').classList.add('show');
    document.getElementById('itemName').classList.add('error');
    valid = false;
  }
  if (!amount || amount <= 0) {
    document.getElementById('amountError').classList.add('show');
    document.getElementById('itemAmount').classList.add('error');
    valid = false;
  }
  if (!valid) return;

  const tx = {
    id: Date.now().toString(),
    name,
    amount,
    category,
    date: new Date().toISOString(),
  };

  state.transactions.push(tx);
  saveState();
  renderAll();

  // Reset form
  document.getElementById('itemName').value = '';
  document.getElementById('itemAmount').value = '';
  document.getElementById('itemName').classList.remove('error');
  document.getElementById('itemAmount').classList.remove('error');

  showToast(`"${name}" ditambahkan`, '✓');
}

function deleteTransaction(id) {
  const tx = state.transactions.find(t => t.id === id);
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveState();
  renderAll();
  if (tx) showToast(`"${tx.name}" dihapus`, '🗑');
}

function addCustomCategory() {
  const input = document.getElementById('customCatInput');
  const name = input.value.trim();
  if (!name) return;
  if (state.categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
    showToast('Kategori sudah ada!', '⚠');
    return;
  }

  const colors = ['#e05ce0', '#5ce0d8', '#e0b05c', '#5c8ee0', '#e0605c'];
  const color = colors[state.categories.length % colors.length];
  state.categories.push({ name, color });
  saveState();
  renderCategorySelect();
  input.value = '';
  showToast(`Kategori "${name}" ditambahkan`, '🏷');
}

function setSpendingLimit() {
  const val = parseFloat(document.getElementById('limitInput').value) || 0;
  state.spendingLimit = val;
  saveState();
  renderLimitWarning();
  showToast(val > 0 ? `Batas diset ke ${formatCurrency(val)}` : 'Batas pengeluaran dihapus', '🎯');
}

function setSort(type) {
  state.sortBy = type;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`sort-${type}`)?.classList.add('active');
  saveState();
  renderTransactions();
  renderMonthlyView();
}

function switchView(view) {
  state.currentView = view;
  document.getElementById('dashboardView').style.display = view === 'dashboard' ? 'block' : 'none';
  document.getElementById('monthlyView').style.display = view === 'monthly' ? 'block' : 'none';
  document.getElementById('btnDashboard').classList.toggle('active', view === 'dashboard');
  document.getElementById('btnMonthly').classList.toggle('active', view === 'monthly');
  if (view === 'monthly') renderMonthlyView();
}

function changeMonth(delta) {
  state.currentMonth += delta;
  if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
  if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
  renderMonthlyView();
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  document.getElementById('themeIcon').textContent = state.theme === 'dark' ? '☀️' : '🌙';
  saveState();
}

// FORM VALIDATION (clear errors on input) 
function clearError(inputId, errorId) {
  document.getElementById(inputId)?.addEventListener('input', () => {
    document.getElementById(inputId).classList.remove('error');
    document.getElementById(errorId).classList.remove('show');
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Apply saved theme
  document.documentElement.setAttribute('data-theme', state.theme);
  document.getElementById('themeIcon').textContent = state.theme === 'dark' ? '☀️' : '🌙';

  // Init chart
  initChart();

  // Set limit input
  if (state.spendingLimit) {
    document.getElementById('limitInput').value = state.spendingLimit;
  }

  // Set active sort
  const sortId = `sort-${state.sortBy}`;
  document.getElementById(sortId)?.classList.add('active');

  // Clear error on type
  clearError('itemName', 'nameError');
  clearError('itemAmount', 'amountError');

  // Custom category on Enter
  document.getElementById('customCatInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') addCustomCategory();
  });

  // Limit input on Enter
  document.getElementById('limitInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') setSpendingLimit();
  });

  renderAll();
});