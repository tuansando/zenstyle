#!/bin/bash

# ZenStyle Salon - GitHub Preparation Script
# This script prepares the project for GitHub upload

echo "=========================================="
echo "  ZenStyle Salon - GitHub Prep Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    print_error "Error: Not in Laravel project root directory"
    exit 1
fi

echo "Starting cleanup process..."
echo ""

# 1. Backup .env file
echo "1. Backing up .env file..."
if [ -f ".env" ]; then
    cp .env .env.backup
    print_status ".env backed up to .env.backup"
else
    print_warning ".env file not found"
fi

# 2. Remove test and debug files
echo ""
echo "2. Removing test and debug files..."
files_to_remove=(
    "analyze_today.php"
    "check_appointments.php"
    "check_currency_settings.php"
    "debug_capacity.php"
    "fix_service_images.php"
    "init_settings.php"
    "update_admin.php"
    "verify_system.php"
    "test_*.php"
    "create()"
    "login_response.json"
)

for file in "${files_to_remove[@]}"; do
    if ls $file 1> /dev/null 2>&1; then
        rm -f $file
        print_status "Removed: $file"
    fi
done

# 3. Remove system files
echo ""
echo "3. Removing system files..."
find . -name ".DS_Store" -type f -delete
print_status "Removed all .DS_Store files"

# 4. Remove output directory
echo ""
echo "4. Cleaning output directories..."
if [ -d "output" ]; then
    rm -rf output
    print_status "Removed: output/"
fi

# 5. Update .gitignore
echo ""
echo "5. Updating .gitignore..."

cat >> .gitignore << 'EOF'

# Test and debug files
analyze_today.php
check_*.php
debug_*.php
fix_*.php
init_settings.php
update_admin.php
verify_system.php
test_*.php
create()
login_response.json

# System files
.DS_Store
Thumbs.db

# Output folders
output/
Documents/

# Frontend build
/frontend/dist
EOF

print_status "Updated .gitignore"

# 6. Create/Update .env.example
echo ""
echo "6. Updating .env.example..."

cat > .env.example << 'EOF'
APP_NAME="ZenStyle Salon"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"
EOF

print_status "Created .env.example with safe defaults"

# 7. Organize SQL files
echo ""
echo "7. Organizing database files..."

if [ ! -d "database/backups" ]; then
    mkdir -p database/backups
    print_status "Created database/backups/ directory"
fi

if [ -f "zenstyle_db.sql" ] || [ -f "zenstyle_db_schema.sql" ]; then
    mv zenstyle_db*.sql database/backups/ 2>/dev/null
    print_status "Moved SQL files to database/backups/"
fi

# Create README in backups folder
cat > database/backups/README.md << 'EOF'
# Database Backups

## Files:

1. **zenstyle_db.sql** - Full database backup with data
2. **zenstyle_db_schema.sql** - Database structure only

## How to Import:

### Full Database (with data):
```bash
mysql -u root -p < zenstyle_db.sql
```

### Schema Only:
```bash
mysql -u root -p < zenstyle_db_schema.sql
```

See INSTALLATION_GUIDE.md for detailed instructions.
EOF

print_status "Created README in database/backups/"

# 8. Check git status
echo ""
echo "8. Checking git status..."

if [ -d ".git" ]; then
    print_status "Git repository initialized"
else
    print_warning "Git not initialized. Run: git init"
fi

# 9. Summary
echo ""
echo "=========================================="
echo "  Cleanup Summary"
echo "=========================================="
echo ""
print_status "✓ Test files removed"
print_status "✓ System files cleaned"
print_status "✓ .gitignore updated"
print_status "✓ .env.example created"
print_status "✓ SQL files organized"
print_status "✓ .env backed up to .env.backup"
echo ""

# 10. Show what will be committed
echo "=========================================="
echo "  Files to be committed:"
echo "=========================================="
echo ""

if [ -d ".git" ]; then
    git status --short 2>/dev/null || echo "Run 'git status' to see files"
else
    echo "Git not initialized. Initialize with: git init"
fi

echo ""
echo "=========================================="
echo "  Next Steps:"
echo "=========================================="
echo ""
echo "1. Review the changes:"
echo "   git status"
echo ""
echo "2. Add files to git:"
echo "   git add ."
echo ""
echo "3. Make first commit:"
echo "   git commit -m \"Initial commit: ZenStyle Salon Management System\""
echo ""
echo "4. Create GitHub repository"
echo ""
echo "5. Add remote and push:"
echo "   git remote add origin https://github.com/yourusername/repo.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "=========================================="
echo "  IMPORTANT REMINDERS:"
echo "=========================================="
echo ""
print_warning "⚠ Your .env file is backed up to .env.backup"
print_warning "⚠ Make sure .env is NOT in git (it's in .gitignore)"
print_warning "⚠ Review GITHUB_DEPLOYMENT_CHECKLIST.md"
print_warning "⚠ Update README.md with your information"
echo ""
echo "✅ Project is ready for GitHub!"
echo ""
