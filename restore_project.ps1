# ==========================================
# SCRIPT KHÔI PHỤC DỰ ÁN SAU KHI ĐÓNG GÓI
# Chạy sau khi đã package để restore lại vendor và node_modules
# ==========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   KHÔI PHỤC DỰ ÁN ZENSTYLE SALON" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra có ở đúng thư mục không
if (-not (Test-Path "artisan")) {
    Write-Host "[ERROR] Không tìm thấy file 'artisan'" -ForegroundColor Red
    Write-Host "Vui lòng chạy script trong thư mục gốc dự án ZenStyleSalon" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "[1/5] Đang cài đặt PHP dependencies (composer install)..." -ForegroundColor Yellow
composer install --no-interaction
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Hoàn thành" -ForegroundColor Green
} else {
    Write-Host "✗ Lỗi khi cài Composer" -ForegroundColor Red
}

Write-Host ""
Write-Host "[2/5] Đang cài đặt frontend dependencies (npm install)..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Hoàn thành" -ForegroundColor Green
} else {
    Write-Host "✗ Lỗi khi cài npm" -ForegroundColor Red
}
Set-Location ..

Write-Host ""
Write-Host "[3/5] Đang tạo file .env từ .env.example..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Đã tạo file .env" -ForegroundColor Green
} else {
    Write-Host "! File .env đã tồn tại, bỏ qua" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/5] Đang generate application key..." -ForegroundColor Yellow
php artisan key:generate --force
Write-Host "✓ Hoàn thành" -ForegroundColor Green

Write-Host ""
Write-Host "[5/5] Đang tạo storage link..." -ForegroundColor Yellow
php artisan storage:link
Write-Host "✓ Hoàn thành" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   KHÔI PHỤC HOÀN TẤT!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "BƯỚC TIẾP THEO:" -ForegroundColor Yellow
Write-Host "1. Cấu hình database trong file .env"
Write-Host "2. Tạo database: CREATE DATABASE zenstyle_db"
Write-Host "3. Chạy: php artisan migrate"
Write-Host "4. Chạy server: php artisan serve"
Write-Host "5. Chạy frontend: cd frontend && npm run dev"
Write-Host ""
Write-Host "Nhấn phím bất kỳ để đóng..."
pause
