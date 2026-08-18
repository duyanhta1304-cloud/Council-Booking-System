import { useNavigate } from 'react-router'
import { useState } from 'react'
export function DetailRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
        {label}
      </span>
      <span style={{
        color: 'var(--color-text)', fontSize: 'var(--font-size-sm)',
        textAlign: 'right', wordBreak: 'break-word',
      }}>
        {value || 'Not provided'}
      </span>
    </div>
  )
}

export function formatAddress(address) {
  if (!address) {
    return 'Not provided'
  }

  return [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postcode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ') || 'Not provided'
}



export function PageHeader({ title, description, action }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)',
    }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-text)', margin: '0 0 4px' }}>
          {title}
        </h1>
        {description && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

export function Badge({ children, tone = 'default' }) {
  const toneMap = {
    default: { bg: 'var(--color-primary-light)', text: 'var(--color-primary-dark)' },
    warning: { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' },
    danger: { bg: 'var(--color-danger-bg)', text: 'var(--color-danger-text)' },
    success: { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' },
  }
  const { bg, text } = toneMap[tone] ?? toneMap.default

  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 'var(--radius-full)',
      backgroundColor: bg, color: text, fontSize: 'var(--font-size-xs)',
      fontWeight: 'var(--font-weight-semibold)', whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

export function Card({ children, style }) {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      ...style,
    }}>
      {children}
    </div>
  )
}

const STATUS_TONES = {
  success: { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' },
  warning: { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' },
  danger: { bg: 'var(--color-danger-bg)', text: 'var(--color-danger-text)' },
  info: { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)' },
  neutral: { bg: 'var(--color-bg)', text: 'var(--color-text-secondary)' },
}

export function StatusBadge({ label, tone = 'neutral' }) {
  const { bg, text } = STATUS_TONES[tone] || STATUS_TONES.neutral
  return (
    <span style={{
      display: 'inline-block', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)',
      padding: '3px 10px', borderRadius: 'var(--radius-full)', backgroundColor: bg, color: text,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

export function Button({ children, variant = 'primary', style, ...props }) {
  const variants = {
    primary: { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-dark)', border: 'none' },
    secondary: { backgroundColor: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)' },
    danger: { backgroundColor: 'var(--color-danger)', color: 'var(--color-text-on-dark)', border: 'none' },
  }
  return (
    <button
      {...props}
      style={{
        padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)', cursor: 'pointer',
        transition: 'opacity var(--transition-fast)', ...variants[variant], ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
    >
      {children}
    </button>
  )
}

export function EmptyState({ message }) {
  return (
    <div style={{
      padding: 'var(--space-2xl)', textAlign: 'center',
      color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)',
    }}>
      {message}
    </div>
  )
}

export function StatCard({ label, value, tone = 'neutral' }) {
  const { text } = STATUS_TONES[tone] || STATUS_TONES.neutral
  return (
    <Card style={{ padding: 'var(--space-md)' }}>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{
        fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)',
        color: tone === 'neutral' ? 'var(--color-text)' : text,
      }}>
        {value}
      </div>
    </Card>
  )
}

export const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text)',
  fontFamily: 'inherit', boxSizing: 'border-box',
}

export const selectStyle = {
  ...inputStyle, width: 'auto', backgroundColor: 'var(--color-surface)', cursor: 'pointer',
}

export const labelStyle = {
  display: 'flex', flexDirection: 'column', gap: '6px',
  fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)',
}

export const tableStyles = {
  wrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' },
  th: {
    textAlign: 'left', padding: 'var(--space-sm) var(--space-md)', color: 'var(--color-text-secondary)',
    fontWeight: 'var(--font-weight-medium)', borderBottom: '1px solid var(--color-border)',
    fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.03em',
  },
  td: {
    padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  },
}

export const buttonStyle = {
  padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none',
  backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-dark)',
  fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)',
  cursor: 'pointer', transition: 'background-color var(--transition-fast)',
}

export const outlineButtonStyle = {
  padding: '8px 16px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border-strong)', backgroundColor: 'transparent',
  color: 'var(--color-text)', fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)', cursor: 'pointer',
}

export const dangerButtonStyle = {
  padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none',
  backgroundColor: 'var(--color-danger)', color: 'var(--color-text-on-dark)',
  fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer',
}

export const buttonOutlineStyle = {
  padding: '8px 16px', borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border-strong)', backgroundColor: 'transparent',
  color: 'var(--color-text)', fontSize: 'var(--font-size-sm)',
  fontWeight: 'var(--font-weight-medium)', cursor: 'pointer',
}

export const buttonDangerStyle = {
  padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none',
  backgroundColor: 'var(--color-danger)', color: 'var(--color-text-on-dark)',
  fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', cursor: 'pointer',
}