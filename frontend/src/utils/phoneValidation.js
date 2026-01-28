/**
 * Validate Vietnamese phone number
 *
 * Rules:
 * - Must be exactly 10 digits
 * - Must start with 0
 * - No letters, special characters, or spaces
 * - Valid prefixes: 03, 05, 07, 08, 09
 *
 * @param {string} phone - Phone number to validate
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateVietnamesePhone = (phone) => {
    // Allow empty (use required validation separately if needed)
    if (!phone || phone.trim() === "") {
        return { isValid: true, message: "" };
    }

    // Remove all whitespace
    const cleaned = phone.replace(/\s+/g, "");

    // Check if contains only digits
    if (!/^\d+$/.test(cleaned)) {
        return {
            isValid: false,
            message: "Số điện thoại chỉ được chứa các chữ số (0-9)",
        };
    }

    // Check if exactly 10 digits
    if (cleaned.length !== 10) {
        return {
            isValid: false,
            message: "Số điện thoại phải có đúng 10 chữ số",
        };
    }

    // Check if starts with 0
    if (cleaned[0] !== "0") {
        return {
            isValid: false,
            message: "Số điện thoại phải bắt đầu bằng số 0",
        };
    }

    // Check valid Vietnamese mobile prefixes
    const validPrefixes = ["03", "05", "07", "08", "09"];
    const prefix = cleaned.substring(0, 2);

    if (!validPrefixes.includes(prefix)) {
        return {
            isValid: false,
            message:
                "Số điện thoại không hợp lệ. Đầu số phải là 03, 05, 07, 08, hoặc 09",
        };
    }

    return { isValid: true, message: "" };
};

/**
 * Format phone number for display
 * Example: 0901234567 -> 090 123 4567
 *
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return "";

    const cleaned = phone.replace(/\s+/g, "");

    if (cleaned.length !== 10) return phone;

    // Format: XXX XXX XXXX
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
};

/**
 * Clean phone number (remove spaces)
 *
 * @param {string} phone - Phone number to clean
 * @returns {string} Cleaned phone number
 */
export const cleanPhoneNumber = (phone) => {
    if (!phone) return "";
    return phone.replace(/\s+/g, "");
};
