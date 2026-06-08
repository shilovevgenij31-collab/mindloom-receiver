import Link from 'next/link';
import { countIntakes, countIntakesByStatus } from '@/lib/intake-repository';
import { countReports } from '@/lib/reports-repository';

export const dynamic = 'force-dynamic';

const C = {
  bg: '#f5f3ef',
  card: '#ffffff',
  border: '1px solid #e8e3db',
  shadow: '0 1px 10px rgba(0,0,0,0.06)',
  radius: 20,
  text: '#1a1a1a',
  muted: '#8a8580',
  link: '#5c6bc0',
  font: 'system-ui, -apple-system, sans-serif',
} as const;

export default function AdminDashboard() {
  const totalIntakes = countIntakes();
  const newIntakes = countIntakesByStatus('new');
  const completedIntakes = countIntakesByStatus('completed');
  const totalReports = countReports();

  const stats = [
    { label: 'Всего заявок',    value: totalIntakes,     href: '/admin/intake',   color: C.text },
    { label: 'Новые заявки',    value: newIntakes,        href: '/admin/intake',   color: '#5b21b6' },
    { label: 'Завершённые',     value: completedIntakes,  href: '/admin/intake',   color: '#1a7a63' },
    { label: 'Всего отчётов',   value: totalReports,      href: '/admin/reports',  color: C.text },
  ];

  const nav = [
    { href: '/admin/intake',        label: 'Входящие заявки',        desc: 'Просмотр и обработка входящих заявок',        external: false },
    { href: '/admin/reports',       label: 'Отчёты',                  desc: 'Все созданные отчёты и публичные ссылки',      external: false },
    { href: '/api/health',          label: 'Статус системы',          desc: 'Статус сервиса и базы данных',                 external: true  },
    { href: '/openapi-intake.yaml', label: 'OpenAPI входящих заявок', desc: 'Схема для Custom GPT Action',                 external: true  },
    { href: '/openapi.yaml',        label: 'OpenAPI отчётов',         desc: 'Схема для прямой отправки отчётов',           external: true  },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, padding: '2.5rem 1.25rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.25rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: C.text, margin: '0 0 0.4rem' }}>
            Админка Mindloom
          </h1>
          <p style={{ color: C.muted, fontSize: '0.92rem', margin: 0, lineHeight: 1.5 }}>
            Панель оператора для входящих заявок и готовых отчётов
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.75rem' }}>
          {stats.map(({ label, value, href, color }) => (
            <Link key={`${href}-${label}`} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ background: C.card, border: C.border, borderRadius: C.radius, padding: '1.25rem 1.5rem', boxShadow: C.shadow }}>
                <p style={{ margin: '0 0 0.35rem', color: C.muted, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {label}
                </p>
                <p style={{ margin: 0, fontSize: '2.25rem', fontWeight: 700, color, lineHeight: 1 }}>
                  {value}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Nav cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {nav.map(({ href, label, desc, external }) => (
            <a
              key={href}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                background: C.card, border: C.border, borderRadius: 14,
                padding: '1rem 1.25rem', boxShadow: C.shadow,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
              }}>
                <div>
                  <p style={{ margin: '0 0 0.15rem', fontWeight: 600, color: C.text, fontSize: '0.92rem' }}>{label}</p>
                  <p style={{ margin: 0, color: C.muted, fontSize: '0.8rem' }}>{desc}</p>
                </div>
                <span style={{ color: C.link, fontSize: '1.1rem', flexShrink: 0 }}>→</span>
              </div>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}
