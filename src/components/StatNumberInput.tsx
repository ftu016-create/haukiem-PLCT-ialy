import React, { useState, useEffect } from 'react';

interface StatNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

export const StatNumberInput: React.FC<StatNumberInputProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = '0',
  min = 0,
  max,
}) => {
  // Keep string representation for fluid typing and backspacing
  const [displayVal, setDisplayVal] = useState<string>(() => (value != null ? String(value) : '0'));

  // Synchronize when value changes externally (e.g. from database sync or report switch)
  useEffect(() => {
    const num = parseInt(displayVal, 10);
    const currentNum = isNaN(num) ? 0 : num;
    if (value !== currentNum || (value === 0 && displayVal === '')) {
      if (displayVal !== '' || value !== 0) {
        setDisplayVal(value != null ? String(value) : '0');
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const raw = e.target.value;

    // Allow deleting everything to empty string while typing
    if (raw === '') {
      setDisplayVal('');
      onChange(0);
      return;
    }

    // Only allow digits
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly === '') {
      setDisplayVal('');
      onChange(0);
      return;
    }

    // Strip any leading zeros if followed by other digits (e.g. '090' -> '90', '06' -> '6')
    const clean = digitsOnly.replace(/^0+(?=\d)/, '');

    let num = parseInt(clean, 10);
    if (isNaN(num)) num = 0;
    if (min != null && num < min) num = min;
    if (max != null && num > max) num = max;

    setDisplayVal(String(num));
    onChange(num);
  };

  const handleBlur = () => {
    // If left empty on blur, restore to '0' or minimum
    if (displayVal.trim() === '') {
      const fallback = min != null ? min : 0;
      setDisplayVal(String(fallback));
      onChange(fallback);
    } else {
      // Ensure no leading zeros remaining
      const num = parseInt(displayVal, 10);
      const clean = isNaN(num) ? 0 : num;
      setDisplayVal(String(clean));
      onChange(clean);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Auto-select text on click/focus so typing immediately replaces existing number
    e.target.select();
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      disabled={disabled}
      value={displayVal}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={className}
    />
  );
};
