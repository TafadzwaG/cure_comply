<?php

namespace App\Support;

class PhoneNumber
{
    /**
     * Common international dial codes used by the app's country-code dropdown.
     *
     * @var list<string>
     */
    private const COUNTRY_CODES = [
        '+1242', '+1246', '+1264', '+1268', '+1284', '+1340', '+1345', '+1441', '+1473', '+1649', '+1664',
        '+1670', '+1671', '+1684', '+1721', '+1758', '+1767', '+1784', '+1787', '+1809', '+1829', '+1849',
        '+1868', '+1869', '+1876',
        '+211', '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', '+224', '+225', '+226',
        '+227', '+228', '+229', '+230', '+231', '+232', '+233', '+234', '+235', '+236', '+237', '+238',
        '+239', '+240', '+241', '+242', '+243', '+244', '+245', '+246', '+248', '+249', '+250', '+251',
        '+252', '+253', '+254', '+255', '+256', '+257', '+258', '+260', '+261', '+262', '+263', '+264',
        '+265', '+266', '+267', '+268', '+269',
        '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', '+40', '+41', '+43', '+44', '+45', '+46',
        '+47', '+48', '+49', '+51', '+52', '+53', '+54', '+55', '+56', '+57', '+58', '+60', '+61', '+62',
        '+63', '+64', '+65', '+66', '+81', '+82', '+84', '+86', '+90', '+91', '+92', '+93', '+94', '+95',
        '+98', '+211', '+212', '+213', '+216', '+218',
        '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357', '+358', '+359',
        '+370', '+371', '+372', '+380', '+385', '+386', '+387', '+420', '+421', '+423',
        '+500', '+501', '+502', '+503', '+504', '+505', '+506', '+507', '+508', '+509',
        '+593', '+594', '+595', '+597', '+598',
        '+852', '+853', '+855', '+856', '+880', '+886',
        '+960', '+961', '+962', '+963', '+964', '+965', '+966', '+967', '+968', '+970', '+971', '+972',
        '+973', '+974', '+975', '+976', '+977', '+992', '+993', '+994', '+995', '+996', '+998',
        '+1', '+7', '+20',
    ];

    public static function normalize(null|string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim($value);

        if ($normalized === '') {
            return null;
        }

        $normalized = preg_replace('/[\s\-\(\)\.]+/', '', $normalized) ?? '';

        if (str_starts_with($normalized, '00')) {
            $normalized = '+'.substr($normalized, 2);
        }

        if (! str_starts_with($normalized, '+')) {
            return preg_replace('/\D+/', '', $normalized) ?: null;
        }

        $digits = preg_replace('/\D+/', '', substr($normalized, 1)) ?? '';

        if ($digits === '') {
            return null;
        }

        return self::stripTrunkPrefix('+'.$digits);
    }

    public static function isValid(null|string $value, bool $required = false): bool
    {
        if ($value === null || trim($value) === '') {
            return ! $required;
        }

        $normalized = self::normalize($value);

        if ($normalized === null) {
            return ! $required;
        }

        return (bool) preg_match('/^\+[1-9]\d{6,14}$/', $normalized);
    }

    private static function stripTrunkPrefix(string $normalized): string
    {
        $digits = substr($normalized, 1);

        foreach (self::countryCodes() as $code) {
            $countryDigits = ltrim($code, '+');

            if (! str_starts_with($digits, $countryDigits)) {
                continue;
            }

            $subscriber = substr($digits, strlen($countryDigits));

            if ($subscriber === '') {
                return $normalized;
            }

            $trimmedSubscriber = ltrim($subscriber, '0');

            if ($trimmedSubscriber === '') {
                return $normalized;
            }

            return '+'.$countryDigits.$trimmedSubscriber;
        }

        return $normalized;
    }

    /**
     * @return list<string>
     */
    private static function countryCodes(): array
    {
        static $codes = null;

        if ($codes !== null) {
            return $codes;
        }

        $codes = array_values(array_unique(self::COUNTRY_CODES));

        usort($codes, fn (string $left, string $right) => strlen($right) <=> strlen($left));

        return $codes;
    }
}
