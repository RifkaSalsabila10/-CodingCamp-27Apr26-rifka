# Requirements Document

## Introduction

Fitur **Expense Budget Visualization** adalah aplikasi web mandiri (standalone) yang memungkinkan pengguna mencatat, mengelola, dan memvisualisasikan pengeluaran berdasarkan kategori. Aplikasi dibangun menggunakan HTML, CSS, dan Vanilla JavaScript tanpa framework, dengan data disimpan di browser Local Storage. Tampilan mencakup form input transaksi, daftar transaksi, ringkasan saldo total, dan pie chart distribusi pengeluaran per kategori.

---

## Glossary

- **App**: Aplikasi web expense-budget-visualization secara keseluruhan.
- **Transaction**: Satu entri pengeluaran yang terdiri dari nama item, jumlah (amount), dan kategori.
- **Transaction_List**: Komponen UI yang menampilkan semua transaksi yang telah ditambahkan.
- **Input_Form**: Komponen UI berupa form untuk memasukkan data transaksi baru.
- **Category**: Klasifikasi pengeluaran; nilai yang valid adalah `Food`, `Transport`, dan `Fun`.
- **Balance_Display**: Komponen UI yang menampilkan total saldo (jumlah seluruh pengeluaran).
- **Pie_Chart**: Komponen visualisasi berbentuk lingkaran yang menampilkan distribusi pengeluaran per kategori.
- **Local_Storage**: Browser Local Storage API yang digunakan untuk menyimpan data transaksi di sisi klien.
- **Chart_Library**: Library pihak ketiga (misalnya Chart.js) yang digunakan untuk merender Pie_Chart.

---

## Requirements

### Requirement 1: Struktur Proyek dan Teknologi

**User Story:** Sebagai developer, saya ingin proyek menggunakan struktur file yang bersih dan teknologi yang ditentukan, agar kode mudah dipelihara dan tidak memerlukan setup yang rumit.

#### Acceptance Criteria

1. THE App SHALL dibangun menggunakan HTML untuk struktur, CSS untuk styling, dan Vanilla JavaScript tanpa framework (React, Vue, Angular, atau sejenisnya).
2. THE App SHALL dapat dijalankan langsung di browser modern (Chrome, Firefox, Edge, Safari) tanpa memerlukan build tool atau server backend.
3. THE App SHALL menyimpan seluruh data di sisi klien menggunakan Local_Storage API.
4. THE App SHALL memiliki tepat satu file CSS di dalam direktori `css/` dan tepat satu file JavaScript di dalam direktori `js/`.
5. THE App SHALL dapat digunakan sebagai standalone web app maupun browser extension.

---

### Requirement 2: Input Form Transaksi

**User Story:** Sebagai pengguna, saya ingin mengisi form untuk menambahkan pengeluaran baru, agar saya dapat mencatat setiap transaksi dengan mudah.

#### Acceptance Criteria

1. THE Input_Form SHALL menampilkan field: Item Name (teks), Amount (angka), dan Category (dropdown dengan pilihan: Food, Transport, Fun).
2. WHEN pengguna mengklik tombol submit pada Input_Form, THE App SHALL menambahkan transaksi baru ke Transaction_List dan menyimpannya ke Local_Storage.
3. WHEN pengguna mengklik tombol submit dan salah satu field kosong atau tidak valid, THE Input_Form SHALL menampilkan pesan validasi dan TIDAK menambahkan transaksi.
4. WHEN pengguna mengklik tombol submit dan transaksi berhasil ditambahkan, THE Input_Form SHALL mengosongkan semua field kembali ke kondisi awal.
5. WHEN nilai Amount diisi, THE Input_Form SHALL hanya menerima angka positif lebih dari nol.

---

### Requirement 3: Daftar Transaksi (Transaction List)

**User Story:** Sebagai pengguna, saya ingin melihat semua transaksi yang telah saya catat dalam sebuah daftar, agar saya dapat memantau riwayat pengeluaran saya.

#### Acceptance Criteria

1. THE Transaction_List SHALL menampilkan semua transaksi yang tersimpan, masing-masing menampilkan nama item, jumlah (amount), dan kategori.
2. WHILE terdapat lebih dari sejumlah item yang melebihi tinggi tampilan, THE Transaction_List SHALL dapat di-scroll secara vertikal.
3. WHEN pengguna mengklik tombol hapus pada sebuah transaksi, THE App SHALL menghapus transaksi tersebut dari Transaction_List dan dari Local_Storage.
4. WHEN tidak ada transaksi yang tersimpan, THE Transaction_List SHALL menampilkan pesan kosong yang informatif kepada pengguna.

---

### Requirement 4: Tampilan Total Saldo (Balance Display)

**User Story:** Sebagai pengguna, saya ingin melihat total keseluruhan pengeluaran saya di bagian atas halaman, agar saya dapat langsung mengetahui total yang telah dikeluarkan.

#### Acceptance Criteria

1. THE Balance_Display SHALL menampilkan jumlah total dari seluruh nilai Amount pada semua transaksi yang tersimpan.
2. WHEN sebuah transaksi baru ditambahkan, THE Balance_Display SHALL memperbarui nilai total secara otomatis tanpa perlu me-reload halaman.
3. WHEN sebuah transaksi dihapus, THE Balance_Display SHALL memperbarui nilai total secara otomatis tanpa perlu me-reload halaman.
4. THE Balance_Display SHALL diletakkan di bagian atas antarmuka sehingga terlihat tanpa perlu scroll.

---

### Requirement 5: Visualisasi Pie Chart

**User Story:** Sebagai pengguna, saya ingin melihat pie chart distribusi pengeluaran berdasarkan kategori, agar saya dapat memahami pola pengeluaran saya secara visual.

#### Acceptance Criteria

1. THE Pie_Chart SHALL menampilkan distribusi persentase pengeluaran untuk setiap Category (Food, Transport, Fun) berdasarkan total Amount per kategori.
2. WHEN sebuah transaksi baru ditambahkan, THE Pie_Chart SHALL memperbarui tampilannya secara otomatis tanpa perlu me-reload halaman.
3. WHEN sebuah transaksi dihapus, THE Pie_Chart SHALL memperbarui tampilannya secara otomatis tanpa perlu me-reload halaman.
4. THE Pie_Chart SHALL menggunakan warna yang berbeda untuk setiap Category agar mudah dibedakan secara visual.
5. WHEN tidak ada transaksi yang tersimpan, THE Pie_Chart SHALL menampilkan kondisi kosong atau pesan yang sesuai, bukan chart kosong yang membingungkan.
6. THE App SHALL menggunakan Chart_Library (seperti Chart.js) untuk merender Pie_Chart.

---

### Requirement 6: Persistensi Data dengan Local Storage

**User Story:** Sebagai pengguna, saya ingin data transaksi saya tetap tersimpan meskipun browser ditutup atau halaman di-refresh, agar saya tidak kehilangan riwayat pengeluaran.

#### Acceptance Criteria

1. WHEN pengguna menambahkan sebuah transaksi, THE App SHALL menyimpan data transaksi tersebut ke Local_Storage sebelum memperbarui tampilan.
2. WHEN pengguna menghapus sebuah transaksi, THE App SHALL menghapus data transaksi tersebut dari Local_Storage sebelum memperbarui tampilan.
3. WHEN halaman dimuat ulang (reload) atau dibuka kembali, THE App SHALL memuat semua transaksi dari Local_Storage dan menampilkannya di Transaction_List, Balance_Display, dan Pie_Chart.
4. IF Local_Storage tidak tersedia atau terjadi error saat membaca data, THEN THE App SHALL menampilkan pesan error yang informatif dan tetap berfungsi dengan data kosong.

---

### Requirement 7: Desain Visual dan Responsivitas

**User Story:** Sebagai pengguna, saya ingin antarmuka yang bersih, minimal, dan mudah dibaca, agar pengalaman menggunakan aplikasi terasa nyaman.

#### Acceptance Criteria

1. THE App SHALL menampilkan antarmuka dengan hierarki visual yang jelas: Balance_Display di bagian atas, diikuti Input_Form, Transaction_List, dan Pie_Chart.
2. THE App SHALL menggunakan tipografi yang mudah dibaca dengan ukuran font yang memadai untuk semua elemen teks.
3. THE App SHALL merender tampilan yang dapat digunakan pada lebar layar minimal 320px hingga 1920px.
4. WHEN pengguna berinteraksi dengan elemen interaktif (tombol, input, dropdown), THE App SHALL memberikan umpan balik visual (misalnya perubahan warna atau efek hover) dalam waktu kurang dari 100ms.
