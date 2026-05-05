# Sistem Presensi Pegawai Aqua Danone

Aplikasi presensi karyawan berbasis web dengan tema hijau muda khas Aqua Danone, lengkap dengan login, absen masuk/pulang via foto selfie, manajemen pegawai, riwayat presensi, dan dasbor admin.

## Struktur project (versi standalone untuk dideploy ke server lain)

```
.
├── backend/                  # REST API: Node.js + Express + MySQL
│   ├── src/
│   ├── dist/                 # Hasil build (dibuat saat `npm run build`)
│   ├── uploads/
│   │   └── attendance/       # File foto selfie pegawai disimpan di sini
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/                 # Web UI: React + Vite + Tailwind
│   ├── src/
│   ├── dist/                 # Hasil build (dibuat saat `npm run build`)
│   ├── .env.example
│   ├── package.json
│   └── index.html
├── database.sql              # CREATE DATABASE + skema + data awal (MySQL)
└── README.md                 # Anda di sini
```

> Folder `artifacts/` dan `lib/` adalah versi monorepo yang dipakai untuk preview di Replit. Tidak perlu diubah/digunakan jika Anda mendeploy ke server biasa.

## Prasyarat

- **Node.js 20** atau lebih baru
- **MySQL 8.x** atau **MariaDB 10.6+**
- **PM2** terpasang global: `npm install -g pm2`

## Cara deploy dengan PM2 (production)

### 1. Buat database

File `database.sql` sudah berisi `CREATE DATABASE presensi_aqua`, jadi langsung jalankan:

```bash
mysql -u root -p < database.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env             # sesuaikan DATABASE_URL ke MySQL Anda
npm install
npm run build                    # compile TypeScript -> dist/
pm2 start dist/index.js --name presensi-backend
```

Backend mendengarkan di port dari `.env` (default 3001) dan menyajikan:
- API: `http://server:3001/api/...`
- File foto: `http://server:3001/uploads/attendance/...`

### 3. Frontend

```bash
cd frontend
cp .env.example .env             # set VITE_API_URL ke alamat backend Anda
npm install
npm run build                    # build static files -> dist/
pm2 start npm --name presensi-frontend -- start
```

Script `npm start` di frontend menjalankan `serve -s dist -l 5173` (static file server). Frontend tersedia di `http://server:5173`.

> **Penting:** `VITE_API_URL` di-bake ke dalam build-nya Vite, jadi pastikan `.env` sudah benar **sebelum** menjalankan `npm run build`. Kalau ganti URL, build ulang.

### 4. Simpan konfigurasi PM2 supaya auto-start saat reboot

```bash
pm2 save
pm2 startup                       # ikuti instruksi yang ditampilkan
```

### Perintah PM2 yang sering dipakai

```bash
pm2 status                        # lihat semua proses
pm2 logs presensi-backend         # log realtime backend
pm2 logs presensi-frontend        # log realtime frontend
pm2 restart presensi-backend
pm2 restart presensi-frontend
pm2 stop presensi-backend
pm2 delete presensi-backend
```

## Cara menjalankan untuk pengembangan (tanpa PM2)

```bash
mysql -u root -p < database.sql
cd backend  && npm install && npm run dev   # auto-reload, port 3001
cd frontend && npm install && npm run dev   # vite dev server, port 5173
```

## Penyimpanan foto selfie

Foto presensi (absen masuk/pulang) **tidak disimpan di database**. Backend menyimpannya sebagai file di folder `backend/uploads/attendance/` dengan nama:

```
checkin_<tanggal>_<idPegawai>_<acak>.png
checkout_<tanggal>_<idPegawai>_<acak>.png
```

Di tabel `attendance`, kolom `check_in_photo` dan `check_out_photo` hanya menyimpan path publiknya, contoh:

```
/uploads/attendance/checkin_2026-04-30_2_a1b2c3d4.png
```

Backend menyajikan folder ini sebagai static files di `/uploads/...`, dan frontend otomatis menyusun URL absolutnya berdasarkan `VITE_API_URL`.

**Saat deploy:**
- Pastikan folder `backend/uploads/attendance/` bisa ditulis oleh proses Node (chmod yang sesuai).
- Backup folder `uploads/` bersamaan dengan backup database — keduanya saling melengkapi.
- Jika di-deploy di belakang Nginx / reverse proxy, pastikan path `/uploads/` ikut di-proxy ke port backend (3001) — atau mount langsung folder `uploads/` ke Nginx.

## Akun demo

| Username | Password | Role     |
| -------- | -------- | -------- |
| admin    | admin123 | admin    |
| budi     | budi123  | employee |
| sari     | sari123  | employee |
| rizky    | rizky123 | employee |
| dewi     | dewi123  | employee |
| agus     | agus123  | employee |

## Aturan presensi

- Absen masuk lewat jam **08:30 WIB** otomatis berstatus **Terlambat**.
- Satu pegawai hanya boleh satu record per tanggal (unique index `(employee_id, date)`).
- Foto selfie disimpan sebagai file di `backend/uploads/attendance/` (maksimal ±2MB per foto, format JPG/PNG/WebP).
- Status presensi: `hadir`, `terlambat`, `izin`.

## Frontend (frontend/)
|Kategori	            |Teknologi                                              |
| ------------------- | ----------------------------------------------------  |
|Language	            |TypeScript                                             |
|UI Framework	        |React 18                                               |
|Build Tool	          |Vite                                                   |
|Styling	            |Tailwind CSS v4                                        |
|Routing	            |Wouter (router ringan pengganti React Router)          |
|State / Data fetching|TanStack Query (React Query v5)                        |
|Komponen UI	        |Radix UI + shadcn/ui (Accordion, Dialog, Select, dll)  |
|Form	                |React Hook Form + Zod                                  |
|Grafik/chart	        |Recharts                                               |
|Notifikasi	          |Sonner (toast)                                         |
|Ikon	                |Lucide React                                           |
|Animasi	            |Framer Motion                                          |
|Static server (prod)	|serve (untuk PM2)                                      |

## Backend (backend/)
|Kategori	            |Teknologi                                              |
| ------------------- | ------------------------------------------------------|
|Runtime	            |Node.js 20+                                            |
|Language	            |TypeScript                                             |
|Web Framework	      |Express.js v5                                          |
|Database	            |MySQL (via driver mysql2)                              |
|Auth	                |Session berbasis cookie (bcryptjs untuk hash password) |
|Validasi input	      |Zod                                                    |
|Penyimpanan foto	    |File lokal (uploads/attendance/)                       |
|Dev runner	          |tsx (jalankan TS langsung tanpa build)                 |
|Prod runner	        |Node.js (setelah npm run build → dist/)                |



