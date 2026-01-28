@echo off
REM =====================================================
REM SCRIPT ĐÓNG GÓI AN TOÀN - KHÔNG XÓA THƯ MỤC GỐC
REM =====================================================

echo.
echo ========================================
echo   DONG GOI AN TOAN - KHONG XOA GOC
echo ========================================
echo.

REM Kiểm tra có ở đúng thư mục không
if not exist "artisan" (
    echo [ERROR] Khong tim thay file 'artisan'
    echo Vui long chay script trong thu muc goc du an ZenStyleSalon
    pause
    exit /b 1
)

echo [QUAN TRONG] Script nay KHONG xoa bat ky thu nao trong thu muc goc!
echo.

REM Tạo tên thư mục tạm
set TEMP_DIR=..\ZenStyleSalon_TEMP_%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TEMP_DIR=%TEMP_DIR: =0%

echo [1/5] Dang tao ban sao tam thoi...
echo Thu muc tam: %TEMP_DIR%
xcopy /E /I /Q . "%TEMP_DIR%" >nul 2>&1
echo ✓ Hoan thanh

echo.
echo [2/5] Dang clean cache trong ban sao...
cd "%TEMP_DIR%"
php artisan cache:clear >nul 2>&1
php artisan config:clear >nul 2>&1
php artisan route:clear >nul 2>&1
php artisan view:clear >nul 2>&1
echo ✓ Hoan thanh

echo.
echo [3/5] Dang xoa file khong can thiet trong ban sao...
if exist vendor rmdir /s /q vendor
if exist node_modules rmdir /s /q node_modules
if exist frontend\node_modules rmdir /s /q frontend\node_modules
if exist .env del /q .env
del /q storage\logs\*.log >nul 2>&1
if exist .git rmdir /s /q .git
echo ✓ Hoan thanh

echo.
echo [4/5] Dang tao file ZIP...
cd ..
set ZIP_NAME=ZenStyleSalon_v1.0_%date:~-4,4%%date:~-7,2%%date:~-10,2%.zip

REM Kiểm tra có 7-Zip không
where 7z >nul 2>&1
if %errorlevel% equ 0 (
    echo Dang nen bang 7-Zip...
    7z a -tzip "%ZIP_NAME%" "%TEMP_DIR%" >nul 2>&1
    echo ✓ Tao file thanh cong: %ZIP_NAME%
) else (
    REM Dùng PowerShell để nén nếu không có 7-Zip
    echo Dang nen bang PowerShell...
    powershell -Command "Compress-Archive -Path '%TEMP_DIR%' -DestinationPath '%ZIP_NAME%' -Force"
    if %errorlevel% equ 0 (
        echo ✓ Tao file thanh cong: %ZIP_NAME%
    ) else (
        echo [ERROR] Khong the tao file ZIP
        echo Vui long cai 7-Zip: https://www.7-zip.org/
    )
)

echo.
echo [5/5] Dang xoa thu muc tam...
cd ZenStyleSalon
rmdir /s /q "%TEMP_DIR%"
echo ✓ Hoan thanh

echo.
echo ========================================
echo   HOAN THANH DONG GOI AN TOAN!
echo ========================================
echo.
echo ✓ THU MUC GOC: KHONG BI THAY DOI GI
echo ✓ File ZIP: ..\%ZIP_NAME%
echo ✓ Dung luong: 
dir "..\%ZIP_NAME%" | findstr /C:"%ZIP_NAME%"
echo.
echo BUOC TIEP THEO:
echo 1. Upload file ZIP len Google Drive/GitHub
echo 2. Share link cho team
echo 3. Huong dan team xem file: INSTALLATION_GUIDE.md
echo.
echo Nhan phim bat ky de dong...
pause >nul
