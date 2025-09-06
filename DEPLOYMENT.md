# VIDABOT ATM Video Affiliate - Deployment Guide

## Deployment di Vercel

### Prasyarat
- Akun Vercel
- Repository GitHub yang sudah di-push
- Node.js v18+ (untuk development)

### Langkah-langkah Deployment

1. **Login ke Vercel**
   - Kunjungi [vercel.com](https://vercel.com)
   - Login dengan GitHub account

2. **Import Project**
   - Klik "New Project"
   - Pilih repository ini dari GitHub
   - Vercel akan otomatis mendeteksi sebagai React app

3. **Environment Variables** (Opsional)
   - Jika ada API keys yang perlu di-set di production
   - Tambahkan di dashboard Vercel

4. **Deploy**
   - Klik "Deploy"
   - Vercel akan menjalankan `npm run build` secara otomatis
   - Tunggu hingga deployment selesai

### Konfigurasi yang Sudah Disiapkan

- ✅ `vercel.json` - Konfigurasi routing dan functions
- ✅ `package.json` - Dependencies dan build scripts
- ✅ `.vercelignore` - File yang dikecualikan dari deployment
- ✅ API Routes di folder `/api` untuk serverless functions

### API Endpoints yang Tersedia

- `/api/generate-video` - Video generation endpoint
- `/api/test-api-key` - API key validation
- `/api/health` - Health check

### Troubleshooting

1. **Build Error**: Pastikan `npm run build` berjalan tanpa error di local
2. **Missing Dependencies**: Pastikan semua dependencies ada di `package.json`
3. **API Routes Error**: Cek logs di Vercel dashboard
4. **Routing Issues**: Periksa konfigurasi di `vercel.json`

### Local Development

```bash
npm install
npm start
```

### Production Build Test

```bash
npm run build
npx serve -s build
```