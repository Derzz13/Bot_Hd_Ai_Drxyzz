Penjernih-AI (Replicate Real-ESRGAN) - README

Langkah menjalankan lokal:
1. Pastikan Node.js >= 18 terpasang.
2. Ekstrak folder penjernih-ai ke komputermu.
3. Masuk ke folder:
   cd penjernih-ai
4. Install dependensi:
   npm install
5. Salin .env.example menjadi .env lalu isi token replicate kamu:
   cp .env.example .env
   # edit .env -> REPLICATE_API_TOKEN=r8_xxx
6. Jalankan server:
   npm start
7. Buka browser ke http://localhost:3000

Catatan teknis:
- Server menerima upload gambar via POST /api/enhance (form field 'file') dan meneruskannya ke model nightmareai/real-esrgan di Replicate.
- Untuk video, gunakan model khusus video (contoh: lucataco/real-esrgan-video) dan sesuaikan kode.
- Jangan commit token ke repositori publik.
