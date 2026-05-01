# Design Document

## Expense Budget Visualization

---

## Overview

Expense Budget Visualization adalah aplikasi web standalone yang dibangun dengan HTML, CSS, dan Vanilla JavaScript murni (tanpa framework). Aplikasi memungkinkan pengguna mencatat pengeluaran per kategori, melihat total saldo, dan memvisualisasikan distribusi pengeluaran melalui pie chart berbasis Chart.js. Semua data disimpan di browser Local Storage sehingga persisten tanpa backend.

**Tujuan desain utama:**
- Satu file HTML, satu file CSS (`css/style.css`), satu file JavaScript (`js/app.js`)
- Tidak memerlukan build tool, server, atau dependensi selain Chart.js (via CDN)
- Responsif dari 320px hingga 1920px
- Dapat berjalan sebagai standalone web app maupun browser extension

---

## Architecture

Aplikasi menggunakan arsitektur **MVC sederhana berbasis modul** dalam satu file JavaScript. Tidak ada framework — semua state dikelola secara manual melalui array in-memory yang disinkronkan ke Local Storage.

```
┌─────────────────────────────────────────────────────────┐
│                        index.html                        │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Balance      │  │ Input Form   │  │ Transaction   │  │
│  │ Display      │  │              │  │ List          │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
│  ┌──────────────────────────────────────────────────┐    │
│  │                  Pie Chart                        │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
  ┌─────────────┐     ┌──────────────┐
  │  js/app.js  │────▶│ Local Storage│
  │  (State +   │     │  (persisten) │
  │   Render)   │     └──────────────┘
  └─────────────┘
         │
         ▼
  ┌─────────────┐
  │  Chart.js   │
  │  (CDN)      │
  └─────────────┘
```

**Alur data (unidirectional):**
1. User action (submit form / klik hapus)
2. Validasi input
3. Update state (array `transactions`)
4. Simpan ke Local Storage
5. Re-render semua komponen UI (Balance, List, Chart)

---

## Components and Interfaces

### 1. State Manager

Modul internal yang menyimpan state aplikasi dan menyediakan fungsi mutasi.

```javascript
// State tunggal
let transactions = [];  // Array of Transaction objects

// Interface
function loadFromStorage()          // Muat dari Local Storage saat init
function saveToStorage()            // Simpan ke Local Storage
function addTransaction(item)       // Tambah transaksi, simpan, re-render
function deleteTransaction(id)      // Hapus transaksi by ID, simpan, re-render
function getTransactions()          // Getter (read-only copy)
function getTotalAmount()           // Hitung total semua amount
function getAmountByCategory()      // Hitung total per kategori → { Food, Transport, Fun }
```

### 2. Input Form Component

Mengelola form input dan validasi.

```javascript
// DOM Elements
const formEl        // <form id="transaction-form">
const nameInput     // <input id="item-name">
const amountInput   // <input id="item-amount">
const categorySelect // <select id="item-category">
const submitBtn     // <button type="submit">

// Interface
function initForm()             // Pasang event listener submit
function validateForm()         // Return { valid: bool, errors: string[] }
function clearForm()            // Reset semua field ke nilai awal
function showValidationError(msg) // Tampilkan pesan error di bawah field
function clearValidationErrors()  // Hapus semua pesan error
```

**Aturan validasi:**
- Item Name: tidak boleh kosong, tidak boleh hanya whitespace
- Amount: harus angka, harus > 0
- Category: harus salah satu dari `Food`, `Transport`, `Fun`

### 3. Transaction List Component

Merender daftar transaksi dan mengelola tombol hapus.

```javascript
// DOM Elements
const listContainerEl  // <ul id="transaction-list">
const emptyMessageEl   // <p id="empty-message">

// Interface
function renderTransactionList(transactions)  // Re-render seluruh list
function createTransactionItem(transaction)   // Buat <li> element untuk satu transaksi
function bindDeleteButtons()                  // Pasang event listener pada tombol hapus
```

**Struktur satu item list:**
```html
<li class="transaction-item" data-id="{id}">
  <span class="item-name">{name}</span>
  <span class="item-category category-{category}">{category}</span>
  <span class="item-amount">Rp {amount}</span>
  <button class="btn-delete" data-id="{id}" aria-label="Hapus {name}">×</button>
</li>
```

### 4. Balance Display Component

Menampilkan total pengeluaran.

```javascript
// DOM Elements
const balanceEl  // <span id="total-balance">

// Interface
function renderBalance(total)  // Update teks balance display
```

### 5. Pie Chart Component

Merender dan memperbarui pie chart menggunakan Chart.js.

```javascript
// DOM Elements
const chartCanvas    // <canvas id="expense-chart">
const chartWrapper   // <div id="chart-wrapper">
const noDataMsg      // <p id="chart-no-data">

let chartInstance = null;  // Referensi Chart.js instance

// Interface
function initChart()                          // Inisialisasi Chart.js instance
function renderChart(amountByCategory)        // Update/destroy-recreate chart
function showEmptyChartState()                // Sembunyikan canvas, tampilkan pesan
function hideEmptyChartState()                // Tampilkan canvas, sembunyikan pesan
```

**Konfigurasi warna per kategori:**
```javascript
const CATEGORY_COLORS = {
  Food:      '#FF6384',
  Transport: '#36A2EB',
  Fun:       '#FFCE56'
};
```

### 6. Storage Module

Abstraksi tipis di atas `localStorage` untuk isolasi dan error handling.

```javascript
const STORAGE_KEY = 'expense_transactions';

function storageGet()           // Parse JSON dari localStorage, return [] jika error
function storageSet(data)       // JSON.stringify dan simpan ke localStorage
function storageAvailable()     // Cek apakah localStorage tersedia
```

---

## Data Models

### Transaction Object

```javascript
/**
 * @typedef {Object} Transaction
 * @property {string} id          - UUID unik (menggunakan crypto.randomUUID() atau fallback)
 * @property {string} name        - Nama item pengeluaran (non-empty string)
 * @property {number} amount      - Jumlah pengeluaran (float > 0)
 * @property {string} category    - Salah satu dari: 'Food' | 'Transport' | 'Fun'
 * @property {number} createdAt   - Unix timestamp (Date.now()) saat transaksi dibuat
 */
```

**Contoh:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Makan siang",
  "amount": 35000,
  "category": "Food",
  "createdAt": 1700000000000
}
```

**Format Local Storage:**
```json
// Key: "expense_transactions"
// Value: JSON array of Transaction objects
[
  { "id": "...", "name": "Makan siang", "amount": 35000, "category": "Food", "createdAt": 1700000000000 },
  { "id": "...", "name": "Ojek",        "amount": 15000, "category": "Transport", "createdAt": 1700000001000 }
]
```

### Validation Rules (tipe data)

| Field      | Tipe     | Constraint                          |
|------------|----------|-------------------------------------|
| `id`       | string   | UUID, auto-generated                |
| `name`     | string   | Tidak kosong, tidak hanya whitespace |
| `amount`   | number   | Float, > 0                          |
| `category` | string   | Enum: `Food` \| `Transport` \| `Fun` |
| `createdAt`| number   | Unix timestamp, auto-generated      |

---

## Error Handling

### Local Storage Tidak Tersedia

Beberapa browser (mode private/incognito ketat, atau browser extension context tertentu) dapat melempar exception saat mengakses `localStorage`.

**Strategi:**
```javascript
function storageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
```

- Jika `storageAvailable()` return `false`: tampilkan banner peringatan di atas halaman (`"Data tidak akan tersimpan — Local Storage tidak tersedia di browser ini."`) dan lanjutkan dengan data in-memory saja.
- Jika `storageGet()` gagal parse JSON (data korup): log error ke console, return `[]`, dan lanjutkan normal.

### Validasi Form

- Error ditampilkan inline di bawah field yang bermasalah menggunakan elemen `<span class="field-error">`.
- Error dihapus saat user mulai mengetik di field tersebut (event `input`).
- Tombol submit tidak di-disable — validasi terjadi saat submit untuk UX yang lebih natural.

### Chart.js Tidak Tersedia

Jika CDN Chart.js gagal dimuat (offline, CDN down):
- `initChart()` akan gagal — tangkap dengan `try/catch`.
- Tampilkan pesan fallback di area chart: `"Visualisasi tidak tersedia. Pastikan koneksi internet aktif."`.
- Fitur lain (form, list, balance) tetap berfungsi normal.

### Amount Parsing

- Input amount di-parse dengan `parseFloat()`.
- Jika hasilnya `NaN` atau `<= 0` atau `!isFinite()`, validasi menolak input.
- Format tampilan menggunakan `toLocaleString('id-ID')` untuk format Rupiah yang readable.

---

## Testing Strategy

Karena fitur ini adalah UI rendering + CRUD sederhana berbasis DOM dan Local Storage, **property-based testing tidak applicable**. Pengujian difokuskan pada:

### Unit Tests (Manual / Example-Based)

Fungsi-fungsi pure yang dapat diuji secara terisolasi:

| Fungsi | Skenario yang diuji |
|--------|---------------------|
| `validateForm()` | Input valid → return `{ valid: true }` |
| `validateForm()` | Name kosong → return error |
| `validateForm()` | Name hanya whitespace → return error |
| `validateForm()` | Amount = 0 → return error |
| `validateForm()` | Amount negatif → return error |
| `validateForm()` | Amount bukan angka → return error |
| `getTotalAmount()` | Array kosong → return 0 |
| `getTotalAmount()` | Array dengan beberapa transaksi → return jumlah yang benar |
| `getAmountByCategory()` | Transaksi campuran → return total per kategori yang benar |
| `storageGet()` | JSON valid → return array |
| `storageGet()` | JSON korup → return `[]` tanpa throw |

### Integration Tests (Manual)

Skenario end-to-end yang diuji secara manual di browser:

1. **Add transaction flow**: Isi form → submit → item muncul di list → balance update → chart update → reload halaman → data masih ada
2. **Delete transaction flow**: Klik hapus → item hilang dari list → balance update → chart update → reload halaman → data sudah hilang
3. **Validation flow**: Submit form kosong → error muncul → isi field → error hilang → submit → berhasil
4. **Empty state flow**: Hapus semua transaksi → list menampilkan pesan kosong → chart menampilkan empty state
5. **Persistence flow**: Tambah beberapa transaksi → tutup tab → buka kembali → semua data masih ada

### Responsiveness Tests (Manual)

Uji di breakpoint berikut menggunakan DevTools:
- 320px (mobile minimum)
- 375px (iPhone SE)
- 768px (tablet)
- 1024px (laptop)
- 1440px (desktop)
- 1920px (wide desktop)

### Browser Compatibility Tests (Manual)

Uji di: Chrome (latest), Firefox (latest), Edge (latest), Safari (latest).

---

## Appendix: File Structure

```
expense-budget-visualization/
├── index.html          ← Satu-satunya file HTML
├── css/
│   └── style.css       ← Semua styling (responsive, komponen)
└── js/
    └── app.js          ← Semua logic (state, validasi, render, chart)
```

**Dependensi eksternal (CDN):**
```html
<!-- Chart.js via CDN di index.html -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

---

## Appendix: Layout Wireframe

```
┌─────────────────────────────────────────┐
│  💰 Total Pengeluaran: Rp 50.000        │  ← Balance Display (sticky/top)
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │  Item Name: [____________]      │    │  ← Input Form
│  │  Amount:    [____________]      │    │
│  │  Category:  [Food ▼]            │    │
│  │             [+ Tambah]          │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  Riwayat Transaksi                      │
│  ┌─────────────────────────────────┐    │
│  │ Makan siang  Food   Rp35.000 [×]│    │  ← Transaction List (scrollable)
│  │ Ojek      Transport Rp15.000 [×]│    │
│  │ ...                             │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  Distribusi Pengeluaran                 │
│  ┌─────────────────────────────────┐    │
│  │         [  Pie Chart  ]         │    │  ← Chart.js Pie Chart
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Responsive behavior:**
- Mobile (< 768px): layout single-column, semua komponen stack vertikal
- Tablet (768px–1023px): form dan list bisa side-by-side, chart di bawah
- Desktop (≥ 1024px): form di kiri, list di tengah, chart di kanan (3-column grid)
