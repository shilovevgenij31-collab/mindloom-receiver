'use client';

import { useState } from 'react';

export default function CopyButton({ text, label = 'Скопировать' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: '0.35rem 0.9rem',
        border: '1px solid #e0dbd4',
        borderRadius: 8,
        background: copied ? '#d9f2eb' : '#fff',
        color: copied ? '#1a7a63' : '#555',
        cursor: 'pointer',
        fontSize: '0.82rem',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
        transition: 'background 0.15s',
      }}
    >
      {copied ? '✓ Скопировано' : label}
    </button>
  );
}
