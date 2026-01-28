@echo off
REM ===========================================
REM SCRIPT TỰ ĐỘNG ĐÓNG GÓI DỰ ÁN ZENSTYLE SALON
REM ===========================================

echo.
echo ========================================
echo   DONG GOI DU AN ZENSTYLE SALON
echo ========================================
echo.

REM Kiểm tra có ở đúng thư mục không
if not exist "artisan" (
    echo [ERROR] Khong tim thay file 'artisan'
    echo Vui long chay script trong thu muc goc du an ZenStyleSalon
    pause
    exit /b 1
)

echo [1/7] Dang clean cache Laravel...
php artisan cache:clear >nul 2>&1
php artisan config:clear >nul 2>&1
php artisan route:clear >nul 2>&1
php artisan view:clear >nul 2>&1
echo ✓ Hoan thanh

echo.
echo [2/7] Dang xoa file logs cu...
del /q storage\logs\*.log >nul 2>&1
echo ✓ Hoan thanh

echo.
echo [3/7] Dang backup du an hien tai...
set BACKUP_DIR=..\ZenStyleSalon_BACKUP_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
xcopy /E /I /Q . "%BACKUP_DIR%" >nul 2>&1
echo ✓ Backup tai: %BACKUP_DIR%

echo.
echo [4/7] Dang xoa thu muc vendor/...
if exist vendor rmdir /s /q vendor
echo ✓ Hoan thanh

echo.
echo [5/7] Dang xoa thu muc node_modules/...
if exist node_modules rmdir /s /q node_modules
if exist frontend\node_modules rmdir /s /q frontend\node_modules
echo ✓ Hoan thanh

echo.
echo [6/7] Dang xoa file .env...
if exist .env del /q .env
echo ✓ Hoan thanh

echo.
echo [7/7] Dang tao file ZIP...
cd ..
set ZIP_NAME=ZenStyleSalon_v1.0_%date:~-4,4%%date:~-7,2%%date:~-10,2%.zip

REM Kiểm tra có 7-Zip không
where 7z >nul 2>&1
if %errorlevel% equ 0 (
    echo Dang nen bang 7-Zip...
    7z a -tzip "%ZIP_NAME%" ZenStyleSalon -xr!vendor -xr!node_modules -x!.env -x!.git >nul 2>&1
    echo ✓ Tao file thanh cong: %ZIP_NAME%
) else (
    echo [WARNING] Khong tim thay 7-Zip
    echo Vui long nen thu cong folder ZenStyleSalon hoac cai 7-Zip
    echo Download: https://www.7-zip.org/
)

cd ZenStyleSalon

echo.
echo ========================================
echo   HOAN THANH DONG GOI!
echo ========================================
echo.
echo File ZIP: ..\%ZIP_NAME%
echo Backup goc: %BACKUP_DIR%
echo.
echo BUOC TIEP THEO:
echo 1. Upload file ZIP len Google Drive/GitHub
echo 2. Share link cho team
echo 3. Huong dan team xem file: INSTALLATION_GUIDE.md
echo.
echo Nhan phim bat ky de dong...
pause >nul
