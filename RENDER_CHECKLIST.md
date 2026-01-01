# ✅ Render Deployment Checklist

## Pre-Deployment Verification

### ✅ 1. Package Configuration
- [x] `package.json` có script `build`
- [x] `package.json` có script `start` hoặc `preview`
- [x] Tất cả dependencies đã được khai báo

### ✅ 2. Build Configuration
- [x] `vite.config.js` đã được cấu hình đúng
- [x] `index.html` tồn tại và đúng cấu trúc
- [x] Entry point (`src/index.jsx`) tồn tại

### ✅ 3. Environment Variables
- [x] `api.js` sử dụng `import.meta.env.VITE_API_BASE_URL`
- [x] File `.env.example` đã được tạo
- [x] `.gitignore` đã ignore file `.env`

### ✅ 4. Render Configuration
- [x] File `render.yaml` đã được tạo (tùy chọn)
- [x] Build command: `npm install && npm run build`
- [x] Start command: `npm run preview -- --host --port $PORT`

### ✅ 5. Git Repository
- [x] Code đã được push lên GitHub
- [x] `node_modules` không có trong repository
- [x] `.env` không có trong repository

## Render Setup Steps

### Bước 1: Tạo Web Service trên Render
1. Đăng nhập [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Kết nối GitHub repository
4. Chọn repository chứa code FE

### Bước 2: Cấu hình Service

**Basic Settings:**
- **Name:** `react-portfolio-frontend` (hoặc tên bạn muốn)
- **Environment:** `Node`
- **Region:** Chọn region gần nhất
- **Branch:** `main` (hoặc branch bạn muốn)

**Build & Deploy:**
- **Root Directory:** `FE` (nếu repo chứa cả FE và BE) hoặc để trống
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run preview -- --host --port $PORT`

**Environment Variables:**
Thêm biến sau trong tab **Environment**:
- **Key:** `VITE_API_BASE_URL`
- **Value:** `https://your-backend-url.onrender.com/api`

### Bước 3: Deploy
1. Click **"Create Web Service"**
2. Đợi build và deploy hoàn tất
3. Kiểm tra logs nếu có lỗi

## Post-Deployment Checklist

### ✅ Sau khi deploy thành công:
- [ ] Website có thể truy cập được
- [ ] Không có lỗi trong browser console
- [ ] API calls hoạt động đúng (kiểm tra Network tab)
- [ ] Không có lỗi CORS
- [ ] Tất cả routes hoạt động đúng

### 🔧 Nếu có lỗi:

**Lỗi Build:**
- Kiểm tra logs trong Render Dashboard
- Đảm bảo Node version phù hợp (Render dùng Node 18+)
- Kiểm tra tất cả dependencies đã được install

**Lỗi CORS:**
- Đảm bảo backend đã thêm frontend URL vào allowed origins
- Kiểm tra `VITE_API_BASE_URL` đã đúng chưa

**Website không load:**
- Kiểm tra Start Command có đúng không
- Kiểm tra PORT được sử dụng đúng (`$PORT` là biến của Render)
- Xem logs trong Render Dashboard

## Test Build Locally

Trước khi deploy, bạn có thể test build locally:

```bash
cd FE
npm install
npm run build
npm run preview
```

Nếu build thành công và preview chạy được, thì deploy lên Render sẽ không có vấn đề.

## Quick Reference

**Build Command:** `npm install && npm run build`
**Start Command:** `npm run preview -- --host --port $PORT`
**Environment Variable:** `VITE_API_BASE_URL=https://your-backend.onrender.com/api`



