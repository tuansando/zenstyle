#!/bin/bash

# ===========================================
# SCRIPT TỰ ĐỘNG ĐÓNG GÓI DỰ ÁN ZENSTYLE SALON
# Cho macOS và Linux
# ===========================================

echo ""
echo "========================================"
echo "   ĐÓNG GÓI DỰ ÁN ZENSTYLE SALON"
echo "========================================"
echo ""

# Kiểm tra có ở đúng thư mục không
if [ ! -f "artisan" ]; then
    echo "[ERROR] Không tìm thấy file 'artisan'"
    echo "Vui lòng chạy script trong thư mục gốc dự án ZenStyleSalon"
    exit 1
fi

echo "[1/7] Đang clean cache Laravel..."
php artisan cache:clear > /dev/null 2>&1
php artisan config:clear > /dev/null 2>&1
php artisan route:clear > /dev/null 2>&1
php artisan view:clear > /dev/null 2>&1
echo "✓ Hoàn thành"

echo ""
echo "[2/7] Đang xóa file logs cũ..."
rm -f storage/logs/*.log
echo "✓ Hoàn thành"

echo ""
echo "[3/7] Đang backup dự án hiện tại..."
BACKUP_DIR="../ZenStyleSalon_BACKUP_$(date +%Y%m%d_%H%M%S)"
cp -r . "$BACKUP_DIR"
echo "✓ Backup tại: $BACKUP_DIR"

echo ""
echo "[4/7] Đang xóa thư mục vendor/..."
rm -rf vendor/
echo "✓ Hoàn thành"

echo ""
echo "[5/7] Đang xóa thư mục node_modules/..."
rm -rf node_modules/
rm -rf frontend/node_modules/
echo "✓ Hoàn thành"

echo ""
echo "[6/7] Đang xóa file .env..."
rm -f .env
echo "✓ Hoàn thành"

echo ""
echo "[7/7] Đang tạo file ZIP..."
cd ..
ZIP_NAME="ZenStyleSalon_v1.0_$(date +%Y%m%d).zip"

zip -r "$ZIP_NAME" ZenStyleSalon \
    -x "*/vendor/*" \
    -x "*/node_modules/*" \
    -x "*/.env" \
    -x "*/.git/*" \
    -x "*/.DS_Store" \
    > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Tạo file thành công: $ZIP_NAME"
else
    echo "[ERROR] Không thể tạo file ZIP"
    echo "Vui lòng nén thủ công folder ZenStyleSalon"
    exit 1
fi

cd ZenStyleSalon

echo ""
echo "========================================"
echo "   HOÀN THÀNH ĐÓNG GÓI!"
echo "========================================"
echo ""
echo "File ZIP: ../$ZIP_NAME"
echo "Backup gốc: $BACKUP_DIR"
echo ""
echo "BƯỚC TIẾP THEO:"
echo "1. Upload file ZIP lên Google Drive/GitHub"
echo "2. Share link cho team"
echo "3. Hướng dẫn team xem file: INSTALLATION_GUIDE.md"
echo ""

# macOS: Mở Finder tại vị trí file ZIP
if [[ "$OSTYPE" == "darwin"* ]]; then
    open ..
fi

echo "Nhấn Enter để đóng..."
read
