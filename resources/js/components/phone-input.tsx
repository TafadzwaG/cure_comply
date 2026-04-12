import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { combinePhoneValue, COUNTRY_PHONE_CODES, splitPhoneValue } from '@/lib/phone';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface PhoneInputProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> {
    value?: string | null;
    onChange: (value: string) => void;
    error?: string;
    containerClassName?: string;
    selectClassName?: string;
    inputClassName?: string;
    countryCodeAriaLabel?: string;
}

export function PhoneInput({
    value,
    onChange,
    error,
    className,
    containerClassName,
    selectClassName,
    inputClassName,
    countryCodeAriaLabel = 'Country code',
    ...props
}: PhoneInputProps) {
    const parsed = React.useMemo(() => splitPhoneValue(value), [value]);

    return (
        <div className={cn('grid gap-3 sm:grid-cols-[13rem_minmax(0,1fr)]', containerClassName)}>
            <Select value={parsed.countryCode} onValueChange={(countryCode) => onChange(combinePhoneValue(countryCode, parsed.localNumber))}>
                <SelectTrigger
                    aria-label={countryCodeAriaLabel}
                    className={cn(error ? 'border-destructive' : '', selectClassName)}
                >
                    <SelectValue placeholder="Country code" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                    {COUNTRY_PHONE_CODES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                            {country.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                {...props}
                type="tel"
                inputMode="tel"
                value={parsed.localNumber}
                onChange={(event) => onChange(combinePhoneValue(parsed.countryCode, event.target.value))}
                className={cn(error ? 'border-destructive' : '', className, inputClassName)}
            />
        </div>
    );
}
