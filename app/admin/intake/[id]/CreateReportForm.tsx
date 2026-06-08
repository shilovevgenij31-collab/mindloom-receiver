'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreateReportFormProps {
  intakeId: string;
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function friendlyError(apiError: string): string {
  if (apiError.includes('not valid JSON') || apiError.includes('must be a JSON object')) {
    return 'JSON невалиден. Скопируйте содержимое блока кода от Mindloom без лишнего текста. Проверьте, что ответ начинается с { и заканчивается }.';
  }
  return apiError;
}

export default function CreateReportForm({ intakeId }: CreateReportFormProps) {
  const router = useRouter();
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingUrl, setExistingUrl] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [repairPrompt, setRepairPrompt] = useState<string | null>(null);
  const [repairCopied, setRepairCopied] = useState(false);
  const [canForceCreate, setCanForceCreate] = useState(false);
  const [cleaningNotes, setCleaningNotes] = useState<string[]>([]);

  const submitReport = async (forceCreate: boolean) => {
    setLoading(true);
    setError(null);
    setExistingUrl(null);
    if (!forceCreate) {
      setWarnings([]);
      setRepairPrompt(null);
      setCanForceCreate(false);
      setCleaningNotes([]);
    }

    try {
      const cleanedText = stripJsonFences(jsonText);
      const res = await fetch(`/api/admin/intake/${intakeId}/create-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ mindloom_json_text: cleanedText, force_create: forceCreate }),
      });

      const data = await res.json();
      if (Array.isArray(data.cleaning_notes)) {
        setCleaningNotes(data.cleaning_notes);
      }

      if (res.status === 409) {
        setError('Отчёт для этой заявки уже создан.');
        if (data.report_url) setExistingUrl(data.report_url);
        return;
      }

      if (res.status === 422 && Array.isArray(data.warnings)) {
        setError('Качество JSON низкое. Лучше перегенерировать отчёт в Mindloom GPT или создать его явно на свой риск.');
        setWarnings(data.warnings);
        setRepairPrompt(data.repair_prompt ?? null);
        setCanForceCreate(data.allow_force_create === true);
        return;
      }

      if (data.ok && data.report_url) {
        setReportUrl(data.report_url);
        if (Array.isArray(data.warnings) && data.warnings.length > 0) {
          setWarnings(data.warnings);
          setRepairPrompt(data.repair_prompt ?? null);
        }
        router.refresh();
      } else {
        if (data.repair_prompt) setRepairPrompt(data.repair_prompt);
        setError(friendlyError(data.error ?? 'Неизвестная ошибка'));
      }
    } catch {
      setError('Ошибка сети. Проверьте соединение и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReport(false);
  };

  const copyRepairPrompt = async () => {
    if (!repairPrompt) return;
    try {
      await navigator.clipboard.writeText(repairPrompt);
      setRepairCopied(true);
      setTimeout(() => setRepairCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  if (reportUrl) {
    return (
      <div>
        <div style={{
          padding: '1rem 1.25rem',
          background: warnings.length > 0 ? '#fef3c7' : '#d9f2eb',
          border: warnings.length > 0 ? '1px solid #f59e0b' : '1px solid #a8dfd1',
          borderRadius: 12,
          marginBottom: warnings.length > 0 ? '0.75rem' : '0',
        }}>
          <p style={{ margin: '0 0 0.3rem', fontWeight: 600, color: warnings.length > 0 ? '#92400e' : '#1a7a63', fontSize: '0.9rem' }}>
            {warnings.length > 0 ? 'Отчёт создан, но качество JSON низкое.' : 'Отчёт создан. Заявка завершена.'}
          </p>
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', color: '#207a63', wordBreak: 'break-all', fontSize: '0.88rem', marginBottom: '0.85rem', textDecoration: 'none' }}
          >
            {reportUrl}
          </a>
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '0.45rem 1.1rem',
              background: '#1a7a63', color: '#fff', borderRadius: 10,
              textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
            }}
          >
            Открыть отчёт ↗
          </a>
        </div>

        {warnings.length > 0 && (
          <div style={{
            padding: '1rem 1.25rem',
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: 12,
          }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#92400e', fontSize: '0.88rem' }}>
              Предупреждения качества отчёта
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              {warnings.map((w, i) => (
                <li key={i} style={{ fontSize: '0.83rem', color: '#92400e', lineHeight: 1.55, marginBottom: '0.2rem' }}>
                  {w}
                </li>
              ))}
            </ul>
            {repairPrompt && (
              <div>
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', fontWeight: 600, color: '#78350f' }}>
                  Repair prompt — скопируйте и отправьте в Mindloom GPT для перегенерации:
                </p>
                <pre style={{
                  margin: '0 0 0.5rem', padding: '0.6rem 0.75rem',
                  background: '#fde68a', borderRadius: 8,
                  fontSize: '0.78rem', color: '#78350f', lineHeight: 1.5,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace',
                }}>
                  {repairPrompt}
                </pre>
                <button
                  type="button"
                  onClick={copyRepairPrompt}
                  style={{
                    padding: '0.35rem 0.9rem',
                    background: repairCopied ? '#d97706' : '#f59e0b',
                    color: '#fff', border: 'none', borderRadius: 8,
                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                    fontFamily: 'inherit',
                  }}
                >
                  {repairCopied ? '✓ Скопировано' : 'Скопировать repair prompt'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder="Вставьте JSON отчёта Mindloom Report v2..."
        rows={12}
        spellCheck={false}
        style={{
          width: '100%',
          fontFamily: 'monospace',
          fontSize: '0.82rem',
          padding: '0.875rem 1rem',
          borderRadius: 12,
          border: error ? '1px solid #f5a8a8' : '1px solid #e8e3db',
          resize: 'vertical',
          boxSizing: 'border-box',
          lineHeight: 1.55,
          background: '#faf9f7',
          color: '#1a1a1a',
          outline: 'none',
        }}
      />
      <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#8a8580', lineHeight: 1.5 }}>
        Если Mindloom вернул один блок кода `json`, можно скопировать его целиком — система уберёт fences автоматически.
      </p>

      {error && (
        <div style={{
          margin: '0.6rem 0 0',
          padding: '0.75rem 1rem',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 10,
        }}>
          <p style={{ margin: '0 0 0.2rem', color: '#991b1b', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {error}
          </p>
          {existingUrl && (
            <a
              href={existingUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#5c6bc0', fontSize: '0.83rem', wordBreak: 'break-all' }}
            >
              {existingUrl}
            </a>
          )}
          {repairPrompt && warnings.length === 0 && (
            <div style={{ marginTop: '0.65rem' }}>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', fontWeight: 600, color: '#7f1d1d' }}>
                Repair prompt — используйте его, если JSON реально сломан:
              </p>
              <pre style={{
                margin: '0 0 0.5rem', padding: '0.6rem 0.75rem',
                background: '#fee2e2', borderRadius: 8,
                fontSize: '0.78rem', color: '#7f1d1d', lineHeight: 1.5,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace',
              }}>
                {repairPrompt}
              </pre>
              <button
                type="button"
                onClick={copyRepairPrompt}
                style={{
                  padding: '0.35rem 0.9rem',
                  background: repairCopied ? '#b91c1c' : '#dc2626',
                  color: '#fff', border: 'none', borderRadius: 8,
                  cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                  fontFamily: 'inherit',
                }}
              >
                {repairCopied ? '✓ Скопировано' : 'Скопировать repair prompt'}
              </button>
            </div>
          )}
        </div>
      )}

      {cleaningNotes.length > 0 && (
        <div style={{
          margin: '0.6rem 0 0',
          padding: '0.65rem 0.9rem',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 10,
        }}>
          <p style={{ margin: 0, color: '#1d4ed8', fontSize: '0.8rem', lineHeight: 1.5 }}>
            JSON был автоматически очищен перед проверкой: {cleaningNotes.join('; ')}.
          </p>
        </div>
      )}

      {warnings.length > 0 && !reportUrl && (
        <div style={{
          margin: '0.6rem 0 0',
          padding: '1rem 1.25rem',
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: 12,
        }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>
            Отчёт не создан: найдены предупреждения качества
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            {warnings.map((w, i) => (
              <li key={i} style={{ fontSize: '0.83rem', color: '#92400e', lineHeight: 1.55, marginBottom: '0.2rem' }}>
                {w}
              </li>
            ))}
          </ul>
          {repairPrompt && (
            <div>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', fontWeight: 600, color: '#78350f' }}>
                Repair prompt — скопируйте и отправьте в Mindloom GPT:
              </p>
              <pre style={{
                margin: '0 0 0.5rem', padding: '0.6rem 0.75rem',
                background: '#fde68a', borderRadius: 8,
                fontSize: '0.78rem', color: '#78350f', lineHeight: 1.5,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace',
              }}>
                {repairPrompt}
              </pre>
              <button
                type="button"
                onClick={copyRepairPrompt}
                style={{
                  padding: '0.35rem 0.9rem',
                  background: repairCopied ? '#d97706' : '#f59e0b',
                  color: '#fff', border: 'none', borderRadius: 8,
                  cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                  fontFamily: 'inherit', marginRight: '0.5rem',
                }}
              >
                {repairCopied ? '✓ Скопировано' : 'Скопировать repair prompt'}
              </button>
            </div>
          )}
          {canForceCreate && (
            <button
              type="button"
              disabled={loading}
              onClick={() => submitReport(true)}
              style={{
                marginTop: '0.75rem',
                padding: '0.45rem 1.1rem',
                background: '#991b1b',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.83rem',
                fontFamily: 'inherit',
                fontWeight: 600,
              }}
            >
              Создать всё равно
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !jsonText.trim()}
        style={{
          marginTop: '0.875rem',
          padding: '0.55rem 1.5rem',
          background: loading || !jsonText.trim() ? '#d4d0ca' : '#5c6bc0',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          cursor: loading || !jsonText.trim() ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          fontWeight: 500,
          transition: 'background 0.15s',
        }}
      >
        {loading ? 'Создаём отчёт…' : 'Создать отчёт'}
      </button>
    </form>
  );
}
