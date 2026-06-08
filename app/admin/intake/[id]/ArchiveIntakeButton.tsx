'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ArchiveIntakeButton({ intakeId }: { intakeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArchive = async () => {
    const confirmed = window.confirm(
      'Вы уверены? Запись будет скрыта из рабочих списков. Это не удаляет данные физически.'
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/intake/${intakeId}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ reason: 'Archived from admin intake detail' }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Не удалось архивировать заявку.');
        return;
      }

      router.push('/admin/intake');
      router.refresh();
    } catch {
      setError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleArchive}
        disabled={loading}
        style={{
          padding: '0.45rem 1rem',
          background: loading ? '#d4d0ca' : '#991b1b',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.83rem',
          fontFamily: 'inherit',
          fontWeight: 600,
        }}
      >
        {loading ? 'Архивируем...' : 'Archive intake'}
      </button>
      {error && (
        <p style={{ margin: '0.5rem 0 0', color: '#991b1b', fontSize: '0.82rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
