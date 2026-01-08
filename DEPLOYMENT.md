# Panduan Deployment Backend & Database Notes App

## 1. Database Setup (MongoDB)

### **Konsep "Tabel" di MongoDB**

Di MongoDB, tidak ada "Table" atau "Row". Yang ada adalah:

- **Database**: Wadah utama (contoh: `notes_app`).
- **Collection**: Setara dengan tabel (contoh: `notes`).
- **Document**: Setara dengan baris/row (data catatan anda).

**Anda tidak perlu membuat Collection secara manual!**
Kode backend yang saya buat (menggunakan `mongoose`) akan **otomatis** membuat database `notes_app` dan collection `notes` begitu ada data pertama yang disimpan.

### **Persiapan Deployment (Wajib Pakai Atlas)**

Anda tidak bisa menggunakan MongoDB Compass (Localhost) untuk backend yang sudah di-deploy ke internet. Anda harus menggunakan **MongoDB Atlas** (Cloud Database Gratis).

#### **Langkah 1: Buat Database di MongoDB Atlas**

1.  Buka [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) dan Login/Register.
2.  Buat **Cluster** baru (pilih yang **Free/Shared M0**).
3.  Buat **Database User**:
    - Username: `admin` (contoh)
    - Password: `passwordanda` (simpan ini!)
4.  Di bagian **Network Access**, pilih **"Allow Access from Anywhere"** (atau `0.0.0.0/0`) agar backend bisa konek.
5.  Klik **Connect** > **Drivers** > Copy connection string-nya.
    - Format: `mongodb+srv://admin:passwordanda@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

## 2. Deployment Backend (Gratis via Render)

Kami merekomendasikan **Render.com** karena gratis dan mudah untuk Node.js.

### **Langkah 1: Upload Kode ke GitHub**

Pastikan folder `notes-app-back-end` sudah ada di GitHub repository Anda.

1.  Buka terminal di folder `notes-app-back-end`.
2.  Jalankan:
    ```bash
    git init
    git add .
    git commit -m "Siap deploy backend"
    # Hubungkan ke repo GitHub baru Anda
    ```

### **Langkah 2: Deploy di Render**

1.  Buka [dashboard.render.com](https://dashboard.render.com/).
2.  Klik **New +** -> **Web Service**.
3.  Hubungkan akun GitHub Anda dan pilih repository notes app Anda.
4.  **Isi Form Konfigurasi**:
    - **Name**: `notes-app-api` (bebas).
    - **Root Directory**: `notes-app-back-end` (PENTING: karena repo anda punya 2 folder frontend/backend).
    - **Environment**: `Node`.
    - **Build Command**: `npm install`.
    - **Start Command**: `npm start`.
5.  **Environment Variables (PENTING)**:
    Klik "Advanced" atau scroll ke bawah ke bagian Environment Variables. Tambahkan:
    - Key: `MONGODB_URI`
    - Value: _(Paste connection string dari MongoDB Atlas tadi)_
    - Key: `HOST`
    - Value: `0.0.0.0`
    - Key: `NODE_ENV`
    - Value: `production`
6.  Klik **Create Web Service**.

### **Langkah 3: Update Frontend**

Setelah backend aktif, Render akan memberi URL (contoh: `https://notes-app-api.onrender.com`).

1.  Buka kode Frontend (`src/services/noteService.js`).
2.  Ubah `API_BASE_URL` agar mengarah ke link Render tersebut saat mode production, atau buat file `.env` di frontend:
    ```env
    REACT_APP_API_URL=https://notes-app-api.onrender.com
    ```

---

## 3. Cara Cek Data di Compass

Meskipun database ada di Cloud (Atlas), Anda tetap bisa melihat isinya lewat Compass di laptop Anda.

1.  Buka MongoDB Compass.
2.  Paste connection string Atlas Anda di kolom URI.
3.  Connect.
4.  Anda akan melihat database `test` atau `notes_app` dan collection `notes`.
