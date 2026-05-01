# Implementation Plan: Expense Budget Visualization

## Overview

Implementasi aplikasi web standalone untuk mencatat dan memvisualisasikan pengeluaran berdasarkan kategori. Dibangun dengan HTML, CSS, dan Vanilla JavaScript murni — tanpa framework, tanpa build tool. Data disimpan di Local Storage. Pie chart dirender menggunakan Chart.js via CDN.

Pendekatan implementasi bersifat inkremental: mulai dari struktur file dan HTML, lalu styling, kemudian modul JavaScript dari lapisan bawah (storage, state) ke atas (komponen UI), dan diakhiri dengan inisialisasi aplikasi.

---

## Tasks

- [x] 1. Buat struktur file proyek
  - Buat file `index.html` di root proyek
  - Buat direktori `css/` dan file `css/style.css`
  - Buat direktori `js/` dan file `js/app.js`
  - _Requirements: 1.4_

- [x] 2. Implementasi HTML structure dan layout
  - [x] 2.1 Tulis boilerplate HTML5 di `index.html`
    - Tambahkan `<meta charset>`, `<meta name="viewport">`, dan `<title>`
    - Sertakan tag `<link>` untuk `css/style.css`
    - Sertakan tag `<script>` untuk Chart.js via CDN (`https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`)
    - Sertakan tag `<script src="js/app.js" defer>`
    - _Requirements: 1.1, 1.2, 5.6_

  - [x] 2.2 Tambahkan elemen Balance Display
    - Buat elemen dengan `id="balance-display"` di bagian atas `<body>`
    - Sertakan `<span id="total-balance">` untuk nilai total
    - Tambahkan `id="storage-warning"` untuk banner peringatan Local Storage (tersembunyi secara default)
    - _Requirements: 4.1, 4.4, 6.4_

  - [x] 2.3 Tambahkan elemen Input Form
    - Buat `<form id="transaction-form">` dengan field:
      - `<input id="item-name" type="text">`
      - `<input id="item-amount" type="number">`
      - `<select id="item-category">` dengan opsi: Food, Transport, Fun
      - `<button type="submit">`
    - Tambahkan `<span class="field-error">` di bawah setiap field untuk pesan validasi inline
    - _Requirements: 2.1, 2.3_

  - [x] 2.4 Tambahkan elemen Transaction List
    - Buat `<section>` dengan heading "Riwayat Transaksi"
    - Buat `<ul id="transaction-list">` untuk daftar transaksi
    - Buat `<p id="empty-message">` untuk pesan saat list kosong
    - _Requirements: 3.1, 3.4_

  - [x] 2.5 Tambahkan elemen Pie Chart
    - Buat `<section>` dengan heading "Distribusi Pengeluaran"
    - Buat `<div id="chart-wrapper">` yang membungkus `<canvas id="expense-chart">`
    - Buat `<p id="chart-no-data">` untuk pesan empty state chart (tersembunyi secara default)
    - _Requirements: 5.1, 5.5_

- [x] 3. Implementasi CSS styling dan responsivitas
  - [x] 3.1 Tulis CSS base dan variabel
    - Definisikan CSS custom properties (variabel) untuk warna, spacing, dan font
    - Terapkan CSS reset/normalize dasar
    - Atur tipografi: font-family, ukuran font yang memadai untuk semua elemen teks
    - _Requirements: 7.2_

  - [x] 3.2 Styling komponen Balance Display
    - Style elemen balance agar menonjol di bagian atas halaman
    - Style banner peringatan storage (`#storage-warning`) dengan warna peringatan
    - _Requirements: 4.4, 7.1_

  - [x] 3.3 Styling komponen Input Form
    - Style semua field input, select, dan tombol submit
    - Style pesan error validasi (`.field-error`) agar terlihat jelas
    - Tambahkan visual feedback pada elemen interaktif: hover, focus state dalam < 100ms
    - _Requirements: 2.1, 7.4_

  - [x] 3.4 Styling komponen Transaction List
    - Style setiap item list (`.transaction-item`) dengan layout yang rapi
    - Style badge kategori (`.category-Food`, `.category-Transport`, `.category-Fun`) dengan warna berbeda
    - Atur `max-height` dan `overflow-y: auto` pada container list agar scrollable
    - Style tombol hapus (`.btn-delete`) dengan visual feedback hover
    - Style pesan kosong (`#empty-message`)
    - _Requirements: 3.1, 3.2, 7.4_

  - [x] 3.5 Styling komponen Pie Chart
    - Style wrapper chart dengan ukuran yang proporsional
    - Style pesan empty state chart (`#chart-no-data`)
    - _Requirements: 5.4, 5.5_

  - [x] 3.6 Implementasi responsive layout
    - Mobile (< 768px): single-column, semua komponen stack vertikal
    - Tablet (768px–1023px): form dan list bisa side-by-side, chart di bawah
    - Desktop (≥ 1024px): 3-column grid — form di kiri, list di tengah, chart di kanan
    - Pastikan layout berfungsi dari lebar 320px hingga 1920px
    - _Requirements: 7.3_

- [x] 4. Implementasi Storage Module di `js/app.js`
  - Definisikan konstanta `STORAGE_KEY = 'expense_transactions'`
  - Implementasikan `storageAvailable()` — cek ketersediaan localStorage dengan try/catch
  - Implementasikan `storageGet()` — baca dan parse JSON dari localStorage; return `[]` jika error atau data korup
  - Implementasikan `storageSet(data)` — stringify dan simpan array ke localStorage
  - _Requirements: 1.3, 6.1, 6.2, 6.4_

- [x] 5. Implementasi State Manager di `js/app.js`
  - Deklarasikan `let transactions = []` sebagai state tunggal aplikasi
  - Implementasikan `loadFromStorage()` — muat data dari storage ke `transactions`
  - Implementasikan `saveToStorage()` — simpan `transactions` ke storage
  - Implementasikan `addTransaction(item)` — tambah objek Transaction ke array, panggil `saveToStorage()`, lalu `renderAll()`
  - Implementasikan `deleteTransaction(id)` — filter array berdasarkan id, panggil `saveToStorage()`, lalu `renderAll()`
  - Implementasikan `getTransactions()` — return salinan array (spread/slice)
  - Implementasikan `getTotalAmount()` — reduce array untuk menjumlahkan semua `amount`; return 0 jika kosong
  - Implementasikan `getAmountByCategory()` — reduce array menjadi objek `{ Food: n, Transport: n, Fun: n }`
  - _Requirements: 2.2, 3.3, 4.2, 4.3, 5.2, 5.3, 6.1, 6.2_

- [x] 6. Implementasi Input Form Component di `js/app.js`
  - [x] 6.1 Implementasikan fungsi validasi dan helper form
    - Implementasikan `validateForm()` — validasi name (non-empty, non-whitespace), amount (angka, > 0, finite), category (enum check); return `{ valid: bool, errors: object }`
    - Implementasikan `clearForm()` — reset semua field ke nilai awal
    - Implementasikan `showValidationError(fieldId, msg)` — tampilkan pesan error di `<span class="field-error">` yang sesuai
    - Implementasikan `clearValidationErrors()` — hapus semua pesan error yang tampil
    - _Requirements: 2.3, 2.5_

  - [x] 6.2 Implementasikan `initForm()` dan submit handler
    - Pasang event listener `submit` pada `<form id="transaction-form">`
    - Pada submit: panggil `clearValidationErrors()`, lalu `validateForm()`
    - Jika tidak valid: panggil `showValidationError()` untuk setiap error, hentikan proses
    - Jika valid: buat objek Transaction baru dengan `id` (crypto.randomUUID() atau fallback timestamp), `name`, `amount` (parseFloat), `category`, `createdAt` (Date.now()); panggil `addTransaction()`; panggil `clearForm()`
    - Pasang event listener `input` pada setiap field untuk menghapus error saat user mengetik
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 7. Implementasi Transaction List Component di `js/app.js`
  - Implementasikan `createTransactionItem(transaction)` — buat dan return elemen `<li class="transaction-item" data-id="{id}">` dengan struktur: `<span class="item-name">`, `<span class="item-category category-{category}">`, `<span class="item-amount">` (format `toLocaleString('id-ID')`), dan `<button class="btn-delete" data-id="{id}" aria-label="Hapus {name}">`
  - Implementasikan `renderTransactionList(transactions)` — kosongkan `#transaction-list`, iterasi array dan append setiap item; tampilkan `#empty-message` jika array kosong, sembunyikan jika tidak
  - Implementasikan `bindDeleteButtons()` — pasang event listener `click` pada semua `.btn-delete`; pada klik, ambil `data-id` dan panggil `deleteTransaction(id)`
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 8. Implementasi Balance Display Component di `js/app.js`
  - Implementasikan `renderBalance(total)` — update teks `#total-balance` dengan nilai total yang diformat menggunakan `toLocaleString('id-ID')`
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 9. Implementasi Pie Chart Component di `js/app.js`
  - [x] 9.1 Implementasikan inisialisasi dan helper chart
    - Deklarasikan `let chartInstance = null`
    - Definisikan konstanta `CATEGORY_COLORS = { Food: '#FF6384', Transport: '#36A2EB', Fun: '#FFCE56' }`
    - Implementasikan `showEmptyChartState()` — sembunyikan `#chart-wrapper`, tampilkan `#chart-no-data`
    - Implementasikan `hideEmptyChartState()` — tampilkan `#chart-wrapper`, sembunyikan `#chart-no-data`
    - Implementasikan `initChart()` — inisialisasi Chart.js instance pada `#expense-chart` dengan tipe `'doughnut'` atau `'pie'`; bungkus dengan try/catch untuk menangani CDN gagal muat
    - _Requirements: 5.4, 5.5, 5.6_

  - [x] 9.2 Implementasikan `renderChart(amountByCategory)`
    - Jika semua nilai kategori adalah 0: panggil `showEmptyChartState()` dan return
    - Panggil `hideEmptyChartState()`
    - Jika `chartInstance` sudah ada: update `chartInstance.data.datasets[0].data` dan panggil `chartInstance.update()`
    - Jika belum ada: panggil `initChart()` terlebih dahulu
    - Tangani kasus Chart.js tidak tersedia: tampilkan pesan fallback di area chart
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 10. Implementasi fungsi `renderAll()` dan inisialisasi aplikasi
  - Implementasikan `renderAll()` — panggil secara berurutan: `renderBalance(getTotalAmount())`, `renderTransactionList(getTransactions())`, `bindDeleteButtons()`, `renderChart(getAmountByCategory())`
  - Implementasikan logika inisialisasi yang dijalankan saat DOM siap (`DOMContentLoaded`):
    - Cek `storageAvailable()`; jika false, tampilkan `#storage-warning`
    - Panggil `loadFromStorage()`
    - Panggil `initForm()`
    - Panggil `renderAll()`
  - _Requirements: 1.2, 6.3, 6.4_

- [ ] 11. Checkpoint akhir
  - Buka `index.html` langsung di browser (tanpa server)
  - Verifikasi alur tambah transaksi: isi form → submit → item muncul di list → balance update → chart update
  - Verifikasi alur hapus transaksi: klik hapus → item hilang → balance dan chart update
  - Verifikasi validasi form: submit kosong → error muncul; isi field → error hilang
  - Verifikasi empty state: hapus semua transaksi → pesan kosong di list dan chart
  - Verifikasi persistensi: tambah transaksi → reload halaman → data masih ada
  - Verifikasi responsivitas di lebar 320px, 768px, dan 1024px menggunakan DevTools

---

## Notes

- Semua logic JavaScript ditulis dalam satu file `js/app.js` — tidak ada file JS tambahan
- Tidak ada build tool, bundler, atau test runner yang diperlukan
- Chart.js dimuat via CDN; fitur lain tetap berfungsi jika CDN gagal
- Format angka menggunakan `toLocaleString('id-ID')` untuk tampilan Rupiah yang readable
- Setiap task mereferensikan requirement spesifik untuk keterlacakan
