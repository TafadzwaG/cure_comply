export interface CountryPhoneCode {
    code: string;
    label: string;
}

export const DEFAULT_COUNTRY_PHONE_CODE = '+263';

export const COUNTRY_PHONE_CODES: CountryPhoneCode[] = [
    { code: '+263', label: 'Zimbabwe (+263)' },
    { code: '+27', label: 'South Africa (+27)' },
    { code: '+267', label: 'Botswana (+267)' },
    { code: '+260', label: 'Zambia (+260)' },
    { code: '+258', label: 'Mozambique (+258)' },
    { code: '+264', label: 'Namibia (+264)' },
    { code: '+265', label: 'Malawi (+265)' },
    { code: '+266', label: 'Lesotho (+266)' },
    { code: '+268', label: 'Eswatini (+268)' },
    { code: '+254', label: 'Kenya (+254)' },
    { code: '+255', label: 'Tanzania (+255)' },
    { code: '+256', label: 'Uganda (+256)' },
    { code: '+250', label: 'Rwanda (+250)' },
    { code: '+251', label: 'Ethiopia (+251)' },
    { code: '+234', label: 'Nigeria (+234)' },
    { code: '+233', label: 'Ghana (+233)' },
    { code: '+20', label: 'Egypt (+20)' },
    { code: '+212', label: 'Morocco (+212)' },
    { code: '+216', label: 'Tunisia (+216)' },
    { code: '+243', label: 'DR Congo (+243)' },
    { code: '+244', label: 'Angola (+244)' },
    { code: '+1', label: 'United States / Canada (+1)' },
    { code: '+44', label: 'United Kingdom (+44)' },
    { code: '+353', label: 'Ireland (+353)' },
    { code: '+49', label: 'Germany (+49)' },
    { code: '+33', label: 'France (+33)' },
    { code: '+34', label: 'Spain (+34)' },
    { code: '+39', label: 'Italy (+39)' },
    { code: '+351', label: 'Portugal (+351)' },
    { code: '+31', label: 'Netherlands (+31)' },
    { code: '+32', label: 'Belgium (+32)' },
    { code: '+41', label: 'Switzerland (+41)' },
    { code: '+46', label: 'Sweden (+46)' },
    { code: '+47', label: 'Norway (+47)' },
    { code: '+45', label: 'Denmark (+45)' },
    { code: '+971', label: 'United Arab Emirates (+971)' },
    { code: '+966', label: 'Saudi Arabia (+966)' },
    { code: '+91', label: 'India (+91)' },
    { code: '+92', label: 'Pakistan (+92)' },
    { code: '+86', label: 'China (+86)' },
    { code: '+81', label: 'Japan (+81)' },
    { code: '+65', label: 'Singapore (+65)' },
    { code: '+61', label: 'Australia (+61)' },
    { code: '+64', label: 'New Zealand (+64)' },
    { code: '+55', label: 'Brazil (+55)' },
    { code: '+54', label: 'Argentina (+54)' },
    { code: '+52', label: 'Mexico (+52)' },
];

const sortedCountryCodes = [...COUNTRY_PHONE_CODES].sort((left, right) => right.code.length - left.code.length);

export function splitPhoneValue(value: string | null | undefined): { countryCode: string; localNumber: string } {
    if (!value) {
        return { countryCode: DEFAULT_COUNTRY_PHONE_CODE, localNumber: '' };
    }

    const normalized = value.trim().replace(/^00/, '+').replace(/[^\d+]/g, '');

    if (!normalized) {
        return { countryCode: DEFAULT_COUNTRY_PHONE_CODE, localNumber: '' };
    }

    if (!normalized.startsWith('+')) {
        return {
            countryCode: DEFAULT_COUNTRY_PHONE_CODE,
            localNumber: normalized.replace(/\D/g, ''),
        };
    }

    const match = sortedCountryCodes.find((country) => normalized.startsWith(country.code));

    if (!match) {
        return {
            countryCode: DEFAULT_COUNTRY_PHONE_CODE,
            localNumber: normalized.slice(1).replace(/\D/g, ''),
        };
    }

    return {
        countryCode: match.code,
        localNumber: normalized.slice(match.code.length).replace(/\D/g, ''),
    };
}

export function combinePhoneValue(countryCode: string, localNumber: string): string {
    const digits = localNumber.replace(/\D/g, '');

    if (!digits) {
        return '';
    }

    return `${countryCode || DEFAULT_COUNTRY_PHONE_CODE}${digits}`;
}
