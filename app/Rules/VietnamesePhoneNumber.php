<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class VietnamesePhoneNumber implements ValidationRule
{
    /**
     * Run the validation rule.
     * 
     * Validates Vietnamese phone number format:
     * - Must be exactly 10 digits
     * - Must start with 0
     * - No letters, special characters, or spaces
     * - Common prefixes: 03, 05, 07, 08, 09
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Allow null or empty (use 'required' separately if needed)
        if (empty($value)) {
            return;
        }

        // Check if value is string
        if (!is_string($value)) {
            $fail('Số điện thoại phải là chuỗi ký tự.');
            return;
        }

        // Check for whitespace - reject if found
        if (preg_match('/\s/', $value)) {
            $fail('Số điện thoại không được chứa khoảng trắng.');
            return;
        }

        // Check if contains any non-digit characters
        if (!ctype_digit($value)) {
            $fail('Số điện thoại chỉ được chứa các chữ số (0-9).');
            return;
        }

        // Check if exactly 10 digits
        if (strlen($value) !== 10) {
            $fail('Số điện thoại phải có đúng 10 chữ số.');
            return;
        }

        // Check if starts with 0
        if ($value[0] !== '0') {
            $fail('Số điện thoại phải bắt đầu bằng số 0.');
            return;
        }

        // Check valid Vietnamese mobile prefixes (optional but recommended)
        $validPrefixes = ['03', '05', '07', '08', '09'];
        $prefix = substr($value, 0, 2);

        if (!in_array($prefix, $validPrefixes)) {
            $fail('Số điện thoại không hợp lệ. Đầu số phải là 03, 05, 07, 08, hoặc 09.');
            return;
        }
    }
}
