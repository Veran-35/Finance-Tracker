# 💰 FinTrack — Personal Financial Tracker & Productivity Dashboard

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?style=flat-square&logo=supabase)

**FinTrack** adalah aplikasi web modern untuk mengelola keuangan pribadi, memantau tren pengeluaran, budgeting, serta mengatur daftar tugas (Todo List) dalam satu dashboard terintegrasi.

---

## ✨ Fitur Utama

- **📊 Dashboard Overview & Visual Analytics**:
  - Ringkasan Saldo, Total Pemasukan, dan Total Pengeluaran secara real-time.
  - **Grafik Tren Keuangan (Line Chart)** berbasis Recharts untuk memantau pergerakan bulanan.
  - **Donut Chart & Mini Bars** untuk rincian pengeluaran per kategori.
- **💳 Manajemen Transaksi**:
  - Pencatatan pemasukan dan pengeluaran dengan kategori dinamis, tanggal, dan deskripsi.
  - Filter transaksi berdasarkan tipe (*Semua*, *Pemasukan*, *Pengeluaran*).
  - Fitur Tambah, Edit, dan Hapus transaksi.
- **🎯 Monitoring Budget Bulanan**:
  - Buat target dan batas anggaran per kategori pengeluaran.
  - Pantau persentase anggaran terpakai.
- **✅ Todo List Terintegrasi**:
  - Pengelolaan tugas harian dengan level prioritas (*Rendah*, *Sedang*, *Tinggi*).
  - Filter status tugas (*Semua*, *Aktif*, *Selesai*) dan visual progress bar.
- **🔐 Autentikasi & Keamanan**:
  - Login dan Registrasi pengguna berbasis Supabase Auth.
  - Protected routes menggunakan Next.js proxy/middleware.
  - Row Level Security (RLS) pada database Supabase.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)

---

## 🚀 Memulai (Getting Started)

### 1. Clone Repository
```bash
git clone https://github.com/username/financetracker.git
cd financetracker
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di root direktori project dan isi dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Setup Database Supabase
Jalankan file SQL schema yang terdapat pada direktori:
```
supabase/migration.sql
```
Salin isi file tersebut ke **SQL Editor** pada dashboard Supabase Anda lalu klik **Run**.

### 5. Jalankan Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📁 Struktur Direktori

```
src/
├── app/
│   ├── components/       # Komponen UI (Cards, Charts, Modals, Sidebar, dll.)
│   │   └── tabs/         # Halaman Tab (Overview, Transaksi, Budget, Todo)
│   ├── context/          # React Context (AuthContext)
│   ├── dashboard/        # Halaman Dashboard utama
│   ├── hooks/            # Custom Hooks (useTransactions, useTodos, useBudgets, dll.)
│   ├── lib/              # Konfigurasi library (Supabase client/server/proxy)
│   ├── login/            # Halaman Login / Registrasi
│   ├── types/            # TypeScript interface & types
│   └── utils/            # Helper format mata uang & tanggal
├── proxy.ts              # Next.js Middleware untuk proteksi route
└── supabase/             # Skema & migrasi database SQL
```

---

## 📝 Lisensi

Project ini dibuat untuk keperluan pembelajaran dan portofolio personal.
