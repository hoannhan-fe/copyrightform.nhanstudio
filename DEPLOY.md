# Hướng dẫn Deploy lên Render

## Chuẩn bị

1. **Đảm bảo backend đã được deploy:**
   - Backend phải chạy trước và có URL (ví dụ: `https://your-backend.onrender.com`)
   - Cập nhật CORS trong backend để cho phép frontend URL

2. **Chuẩn bị code:**
   - Đảm bảo code đã được commit và push lên GitHub
   - Kiểm tra file `.env.example` có đầy đủ thông tin

## Các bước Deploy

### Bước 1: Tạo Repository trên GitHub

```bash
cd FE
git init
git add .
git commit -m "Prepare for deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

**Lưu ý:** Không commit file `.env` (đã có trong `.gitignore`)

### Bước 2: Tạo Web Service trên Render

1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Kết nối GitHub repository của bạn
4. Chọn repository chứa code FE

### Bước 3: Cấu hình Service

**Thông tin cơ bản:**
- **Name:** `react-portfolio-frontend` (hoặc tên bạn muốn)
- **Environment:** `Node`
- **Region:** Chọn region gần bạn nhất
- **Branch:** `main` (hoặc branch bạn muốn deploy)

**Build & Deploy:**
- **Root Directory:** `FE` (nếu repo chứa cả FE và BE) hoặc để trống nếu chỉ có FE
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run preview -- --host --port $PORT`

**Environment Variables:**
Thêm biến môi trường sau:
- **Key:** `VITE_API_BASE_URL`
- **Value:** `https://your-backend-url.onrender.com/api` (thay bằng URL backend thực tế của bạn)

### Bước 4: Deploy

1. Click **"Create Web Service"**
2. Render sẽ tự động:
   - Clone code từ GitHub
   - Install dependencies
   - Build project
   - Start service
3. Đợi deployment hoàn tất (thường 2-5 phút)

### Bước 5: Kiểm tra

1. Sau khi deploy xong, bạn sẽ nhận được URL như: `https://react-portfolio-frontend.onrender.com`
2. Mở URL và kiểm tra website hoạt động
3. Kiểm tra console để đảm bảo không có lỗi CORS

## Cập nhật CORS trong Backend

Đảm bảo backend của bạn cho phép requests từ frontend URL:

```javascript
// Trong BE/server.js hoặc file cấu hình CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://react-portfolio-frontend.onrender.com' // Thêm URL frontend của bạn
];
```

## Troubleshooting

### Lỗi Build

- Kiểm tra logs trong Render Dashboard
- Đảm bảo `package.json` có đầy đủ dependencies
- Kiểm tra Node version (Render thường dùng Node 18+)

### Lỗi CORS

- Kiểm tra `VITE_API_BASE_URL` đã đúng chưa
- Đảm bảo backend đã thêm frontend URL vào allowed origins
- Kiểm tra network tab trong browser console

### Website không load

- Kiểm tra Start Command có đúng không
- Đảm bảo PORT được sử dụng đúng (`$PORT` là biến môi trường của Render)
- Kiểm tra logs trong Render Dashboard

### Environment Variables không hoạt động

- Đảm bảo biến bắt đầu với `VITE_` prefix
- Sau khi thêm/sửa env vars, cần rebuild lại service
- Kiểm tra trong Settings → Environment của service

## Tự động Deploy

Render tự động deploy khi bạn push code lên branch đã kết nối. Bạn có thể:
- Tắt auto-deploy trong Settings
- Chỉ deploy khi có tag mới
- Sử dụng webhook để trigger deploy

## Free Tier Notes

- Service sẽ "sleep" sau 15 phút không có traffic
- Request đầu tiên sau khi sleep có thể mất 30-60 giây để wake up
- Có giới hạn về số lượng services và build time



