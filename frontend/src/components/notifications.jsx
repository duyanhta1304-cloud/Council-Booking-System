import { useEffect, useRef, useState } from 'react'
import api from '../lib/axios'
import { Badge } from './ui'

export function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    api.get('/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const markRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
    try {
      await api.patch(`/notifications/${id}/read`)
    } catch {
      // Best-effort — a failed mark-as-read just means it shows unread again next fetch.
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--color-text-secondary)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            minWidth: '16px', height: '16px', padding: '0 3px',
            borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-danger)',
            color: 'var(--color-text-on-dark)', fontSize: '10px', fontWeight: 'var(--font-weight-semibold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 'var(--z-modal)',
          width: '300px', maxHeight: '360px', overflowY: 'auto',
          backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{
            padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
              Notifications
            </span>
            {unreadCount > 0 && <Badge tone="danger">{unreadCount} new</Badge>}
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: 'var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => markRead(n._id)}
                style={{
                  width: '100%', textAlign: 'left', border: 'none', borderBottom: '1px solid var(--color-border)',
                  backgroundColor: n.read ? 'transparent' : 'var(--color-primary-light)',
                  padding: 'var(--space-sm) var(--space-md)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '4px',
                }}
              >
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{n.message}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
