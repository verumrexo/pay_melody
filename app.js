const LIST_KEY = 'pay_melody_expenses';
const MONTH_KEY = 'pay_melody_month';

// state
let expenses = JSON.parse(localStorage.getItem(LIST_KEY)) || [];

// dom
const listEl = document.getElementById('expense-list');
const emptyStateEl = document.getElementById('empty-state');
const formEl = document.getElementById('add-form');
const inputEl = document.getElementById('expense-input');
const amountInputEl = document.getElementById('amount-input');
const dueInputEl = document.getElementById('due-input');
const totalEl = document.getElementById('total-count');
const completedEl = document.getElementById('completed-count');
const progressFill = document.getElementById('progress-fill');
const spentAmountEl = document.getElementById('spent-amount');
const totalAmountEl = document.getElementById('total-amount');
const moneyFill = document.getElementById('money-fill');
const dateEl = document.getElementById('current-date');
const remainingAmountEl = document.getElementById('remaining-amount');

// new dom
const mainScroll = document.getElementById('main-scroll');
const mainHeader = document.getElementById('main-header');
const fabBtn = document.getElementById('fab-btn');
const bottomSheet = document.getElementById('bottom-sheet');
const sheetBackdrop = document.getElementById('sheet-backdrop');
const closeSheetBtn = document.getElementById('close-sheet-btn');
const splashScreen = document.getElementById('splash-screen');

function vibrate(pattern = [15]) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) { }
  }
}

// scroll effect for header
if (mainScroll && mainHeader) {
  mainScroll.addEventListener('scroll', () => {
    if (mainScroll.scrollTop > 20) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });
}

// modal logic
function openSheet() {
  vibrate();
  bottomSheet.classList.add('open');
  setTimeout(() => inputEl.focus(), 300);
}

function closeSheet() {
  bottomSheet.classList.remove('open');
  inputEl.blur();
  amountInputEl.blur();
  dueInputEl.blur();
}

if (fabBtn) fabBtn.addEventListener('click', openSheet);
if (closeSheetBtn) closeSheetBtn.addEventListener('click', closeSheet);
if (sheetBackdrop) sheetBackdrop.addEventListener('click', closeSheet);

function verifyMonth() {
  const now = new Date();
  const currentMonthYear = `${now.getMonth()}-${now.getFullYear()}`;
  const stored = localStorage.getItem(MONTH_KEY);

  if (stored !== currentMonthYear) {
    expenses = expenses.map(e => ({ ...e, checked: false }));
    localStorage.setItem(MONTH_KEY, currentMonthYear);
    save();
  }
}

function renderDate() {
  const opts = { month: 'long', year: 'numeric' };
  dateEl.innerText = new Date().toLocaleDateString('en-US', opts);
}

function save() {
  localStorage.setItem(LIST_KEY, JSON.stringify(expenses));
}

function render() {
  listEl.innerHTML = '';

  let checked = 0;
  let totalMoney = 0;
  let spentMoney = 0;

  if (expenses.length === 0) {
    emptyStateEl.classList.remove('hidden');
  } else {
    emptyStateEl.classList.add('hidden');
  }

  expenses.forEach(ez => {
    if (ez.checked) {
      checked++;
      spentMoney += ez.amount || 0;
    }
    totalMoney += ez.amount || 0;

    const li = document.createElement('li');
    li.className = `expense-item ${ez.checked ? 'checked' : ''}`;

    const monthShort = new Date().toLocaleString('default', { month: 'short' });
    li.innerHTML = `
      <label class="checkbox-wrapper">
        <input type="checkbox" class="checkbox-input" data-id="${ez.id}" ${ez.checked ? 'checked' : ''}>
        <div class="checkbox-custom">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </label>
      <div class="expense-content">
        <div class="expense-name">${ez.name}</div>
        ${ez.due ? `<div class="expense-due">Pay by ${monthShort} ${ez.due}</div>` : ''}
      </div>
      <div class="expense-amount">€${(ez.amount || 0).toFixed(2)}</div>
      <button class="delete-btn" aria-label="delete">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;

    li.addEventListener('click', (e) => {
      if (e.target.closest('.delete-btn')) {
        vibrate([30]);
        destroy(ez.id);
        return;
      }
      vibrate([10]);
      toggle(ez.id);
    });

    listEl.appendChild(li);
  });

  totalEl.innerText = expenses.length;
  completedEl.innerText = checked;
  const pct = expenses.length === 0 ? 0 : (checked / expenses.length) * 100;
  progressFill.style.width = `${pct}%`;

  totalAmountEl.innerText = totalMoney.toFixed(2);
  spentAmountEl.innerText = spentMoney.toFixed(2);
  const moneyPct = totalMoney === 0 ? 0 : (spentMoney / totalMoney) * 100;
  remainingAmountEl.innerText = (totalMoney - spentMoney).toFixed(2);
  moneyFill.style.width = `${moneyPct}%`;
}

function add(name, amount, due) {
  expenses.push({
    id: Date.now().toString(),
    name: name.trim(),
    amount: parseFloat(amount) || 0,
    due: parseInt(due) || null,
    checked: false
  });
  expenses.sort((a, b) => {
    if (a.due && b.due) return a.due - b.due;
    if (a.due) return -1;
    if (b.due) return 1;
    return 0;
  });
  save();
  render();
}

function toggle(id) {
  const t = expenses.find(e => e.id === id);
  if (t) {
    t.checked = !t.checked;
    save();
    render();
  }
}

function destroy(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  render();
}

if (formEl) {
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = inputEl.value;
    const a = amountInputEl.value;
    const d = dueInputEl.value;
    if (v && a && d) {
      add(v, a, d);
      inputEl.value = '';
      amountInputEl.value = '';
      dueInputEl.value = '';

      vibrate([20, 50, 20]);
      closeSheet();
    }
  });
}

function boot() {
  verifyMonth();
  renderDate();
  render();

  // hide splash screen
  setTimeout(() => {
    if (splashScreen) {
      splashScreen.classList.add('hide');
      setTimeout(() => splashScreen.remove(), 600); // cleanup dom
    }
  }, 1200);
}

// init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
