<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\SalonSetting;

echo "currency_locale: " . SalonSetting::getValue('currency_locale', '(missing)') . PHP_EOL;
echo "currency_code: " . SalonSetting::getValue('currency_code', '(missing)') . PHP_EOL;
echo "currency_fraction_digits: " . SalonSetting::getValue('currency_fraction_digits', '(missing)') . PHP_EOL;
