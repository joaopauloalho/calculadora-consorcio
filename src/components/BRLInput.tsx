import { useState } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}

export default function BRLInput({ value, onChange, placeholder = '0,00' }: Props) {
  const [editing, setEditing] = useState(false);
  const [editStr, setEditStr] = useState('');

  const formatted = value === 0
    ? ''
    : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  const handleFocus = () => {
    setEditing(true);
    setEditStr(value === 0 ? '' : String(value));
  };

  const handleBlur = () => {
    setEditing(false);
    const cleaned = editStr.replace(/\./g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    onChange(isNaN(n) ? 0 : n);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditStr(val);
    const cleaned = val.replace(/\./g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    if (!isNaN(n)) onChange(n);
    else if (val === '') onChange(0);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={editing ? editStr : formatted}
      placeholder={placeholder}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
}
