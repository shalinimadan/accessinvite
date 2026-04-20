import React, { useState } from 'react';
import { navigate } from '../App';
import { getEvent, getRsvps, getEventStats, deleteEvent } from '../storage';

const FEATURE_LABELS = {
  wheelchair: 'Wheelchair accessible entrance',
  stepfree: 'Step-free route throughout',
  'accessible-parking': 'Accessible parking',
  elevator: 'Elevator / lift access',
  'accessible-toilets': 'Accessible restrooms',
  'quiet-room': 'Quiet room available',
  'low-sensory': 'Low-sensory option',
  'fragrance-free': 'Fragrance-free space',
  bsl: 'BSL / ASL interpreter',
  captions: 'Live captions',
  'large-print': 'Large print materials',
  'hearing-loop': 'Hearing loop',
  'service-animals': 'Service animals welcome',
  seating: 'Ample seating',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return dateStr; }
}

function formatTime(t) {
  if (!t) return '';
  try {
    const [h, m] = t.split(':');
    const hr = parseInt(h, 10);
    const ampm = hr >= 12 ? 'pm' : 'am';
    const h12 = hr % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  } catch { return t; }
}

export default function EventPage({ eventId, addToast }) {
  const event = getEvent(eventId);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!event) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>Event not found</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>This event may have been deleted or the link is incorrect.</p>
        <a href="#/" className="btn btn-primary" onClick={e => { e.preventDefault(); navigate('/'); }}>Back to home</a>
      </div>
    );
  }

  const stats = getEventStats(eventId);
  const rsvpUrl = `${window.location.origin}${window.location.pathname}#/event/${eventId}/rsvp`;

  function copyLink() {
    navigator.clipboard.writeText(rsvpUrl).then(() => {
      setCopied(true);
      addToast('RSVP link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 3000);
    });
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteEvent(eventId);
    addToast('Event deleted.', 'success');
    navigate('/dashboard');
  }

  const features = (event.accessibilityFeatures || []).map(id => FEATURE_LABELS[id]).filter(Boolean);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Hero */}
      <div style={{ background: 'var(--forest)', padding: '3rem 0 2.5rem', color: 'var(--cream)' }}>
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ marginBottom: '1rem' }}>
            <ol style={{ listStyle: 'none', display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--sage)' }}>
              <li><a href="#/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: 'var(--sage)', textDecoration: 'underline' }}>Home</a></li>
              <li aria-hidden="true">›</li>
              <li><a href="#/dashboard" onClick={e => { e.preventDefault(); navigate('/dashboard'); }} style={{ color: 'var(--sage)', textDecoration: 'underline' }}>Dashboard</a></li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" style={{ color: 'var(--cream)' }}>{event.name}</li>
            </ol>
          </nav>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <span className="badge badge-sage" style={{ marginBottom: '0.75rem' }}>
                {event.status === 'active' ? '● Active' : event.status}
              </span>
              <h1 style={{ color: 'var(--cream)', marginBottom: '0.75rem' }}>{event.name}</h1>
              <dl style={{ color: 'var(--sage-light)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {event.date && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <dt><span aria-hidden="true">📅</span><span className="sr-only">Date:</span></dt>
                    <dd>{formatDate(event.date)}{event.time && ` at ${formatTime(event.time)}`}{event.endTime && ` – ${formatTime(event.endTime)}`}</dd>
                  </div>
                )}
                {event.location && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <dt><span aria-hidden="true">📍</span><span className="sr-only">Location:</span></dt>
                    <dd>{event.location}</dd>
                  </div>
                )}
                {event.contactName && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <dt><span aria-hidden="true">👤</span><span className="sr-only">Hosted by:</span></dt>
                    <dd>Hosted by {event.contactName}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--sage-light)', borderColor: 'rgba(122,171,138,0.4)' }} onClick={() => navigate(`/event/${eventId}/edit`)}>
                ✏️ Edit event
              </button>
              <button className={`btn btn-sm ${confirmDelete ? 'btn-danger' : 'btn-ghost'}`} style={!confirmDelete ? { color: 'var(--sage-light)', borderColor: 'rgba(122,171,138,0.4)' } : {}} onClick={handleDelete}>
                {confirmDelete ? 'Confirm delete?' : '🗑 Delete'}
              </button>
              {confirmDelete && (
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--sage-light)', borderColor: 'rgba(122,171,138,0.4)' }} onClick={() => setConfirmDelete(false)}>Cancel</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* Left col */}
          <div>
            {/* Share RSVP link */}
            <section aria-labelledby="share-heading" className="card" style={{ marginBottom: '1.5rem', background: 'var(--forest)', color: 'var(--cream)' }}>
              <h2 id="share-heading" style={{ color: 'var(--cream)', fontSize: '1.05rem', marginBottom: '0.75rem' }}>Share RSVP link</h2>
              <p style={{ color: 'var(--sage-light)', fontSize: '0.88rem', marginBottom: '1rem' }}>Send this link to your guests so they can RSVP:</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="text" readOnly value={rsvpUrl}
                  className="form-input"
                  style={{ flex: 1, minWidth: 200, fontSize: '0.82rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--cream)' }}
                  aria-label="RSVP link for this event"
                  onFocus={e => e.target.select()}
                />
                <button className="btn btn-accent btn-sm" onClick={copyLink} aria-live="polite" aria-label={copied ? 'Link copied!' : 'Copy RSVP link'}>
                  {copied ? '✓ Copied!' : 'Copy link'}
                </button>
                <a href={`#/event/${eventId}/rsvp`} className="btn btn-ghost btn-sm" style={{ color: 'var(--sage-light)', borderColor: 'rgba(122,171,138,0.4)' }} onClick={e => { e.preventDefault(); navigate(`/event/${eventId}/rsvp`); }}>
                  Preview RSVP →
                </a>
              </div>
            </section>

            {/* Stats */}
            <section aria-labelledby="stats-heading" style={{ marginBottom: '1.5rem' }}>
              <h2 id="stats-heading" className="sr-only">RSVP summary</h2>
              <div className="stats-grid">
                <div className="stat-card light" aria-label={`${stats.total} total RSVPs`}>
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-label">Total RSVPs</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--forest-mid)' }} aria-label={`${stats.going} attending`}>
                  <div className="stat-number">{stats.going}</div>
                  <div className="stat-label">Going</div>
                </div>
                <div className="stat-card" style={{ background: 'var(--amber)' }} aria-label={`${stats.maybe} maybe attending`}>
                  <div className="stat-number">{stats.maybe}</div>
                  <div className="stat-label">Maybe</div>
                </div>
                <div className="stat-card light" aria-label={`${stats.declined} declined`}>
                  <div className="stat-number">{stats.declined}</div>
                  <div className="stat-label">Declined</div>
                </div>
              </div>
            </section>

            {/* Description */}
            {event.description && (
              <section aria-labelledby="about-heading" className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 id="about-heading" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>About this event</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>
              </section>
            )}

            {/* Guest RSVPs */}
            <section aria-labelledby="guests-heading" className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 id="guests-heading" style={{ fontSize: '1.1rem' }}>Guest RSVPs</h2>
                <a href="#/dashboard" className="btn btn-ghost btn-sm" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>Full dashboard →</a>
              </div>
              <GuestList eventId={eventId} />
            </section>
          </div>

          {/* Right col */}
          <div>
            {/* Accessibility info */}
            <section aria-labelledby="a11y-heading" className="card" style={{ marginBottom: '1.5rem' }}>
              <h2 id="a11y-heading" style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
                <span aria-hidden="true">♿ </span>Accessibility
              </h2>
              {features.length > 0 ? (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      <span aria-hidden="true" style={{ color: 'var(--forest-light)', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No specific features listed yet.</p>
              )}
              {event.accessibilityNotes && (
                <>
                  <div className="divider" />
                  <h3 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Additional notes</h3>
                  <p style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>{event.accessibilityNotes}</p>
                </>
              )}
              {event.contactEmail && (
                <>
                  <div className="divider" />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Questions? Contact{' '}
                    <a href={`mailto:${event.contactEmail}`} style={{ color: 'var(--forest)' }}>
                      {event.contactName || event.contactEmail}
                    </a>
                  </p>
                </>
              )}
            </section>

            {/* Accessibility needs summary */}
            {stats.total > 0 && Object.keys(stats.needsCounts).length > 0 && (
              <section aria-labelledby="needs-summary-heading" className="card" style={{ marginBottom: '1.5rem' }}>
                <h2 id="needs-summary-heading" style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Guest needs summary</h2>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {Object.entries(stats.needsCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                    <li key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>{k}</span>
                      <strong>{v}</strong>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Event details card */}
            <div className="card" style={{ background: 'var(--cream-dark)' }}>
              <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Event info</h2>
              <dl style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                {event.maxGuests && (
                  <div>
                    <dt style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Capacity</dt>
                    <dd>{event.maxGuests} guests max</dd>
                  </div>
                )}
                {event.venueType && (
                  <div>
                    <dt style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Venue type</dt>
                    <dd style={{ textTransform: 'capitalize' }}>{event.venueType}</dd>
                  </div>
                )}
                <div>
                  <dt style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Accessibility RSVP</dt>
                  <dd>{event.askGuestNeeds ? '✓ Guests asked about their needs' : 'Not collecting accessibility info'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestList({ eventId }) {
  const rsvps = getRsvps(eventId);
  if (rsvps.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem' }}>
        <p>No RSVPs yet. Share your event link to get started.</p>
      </div>
    );
  }
  const statusBadge = { going: 'badge-green', maybe: 'badge-amber', declined: 'badge-red' };
  const statusLabel = { going: 'Going', maybe: 'Maybe', declined: 'Declined' };
  return (
    <div className="table-wrap">
      <table className="data-table" aria-label="Guest RSVP list">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Status</th>
            <th scope="col">Needs</th>
            <th scope="col">Responded</th>
          </tr>
        </thead>
        <tbody>
          {rsvps.map(r => (
            <tr key={r.id}>
              <td>
                <strong style={{ color: 'var(--text-primary)' }}>{r.name}</strong>
                {r.email && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.email}</div>}
              </td>
              <td><span className={`badge ${statusBadge[r.status] || 'badge-sage'}`}>{statusLabel[r.status] || r.status}</span></td>
              <td>
                <div className="needs-tags" style={{ flexWrap: 'wrap', gap: '0.25rem' }}>
                  {(r.accessibilityNeeds || []).slice(0, 3).map(n => (
                    <span key={n} className="need-tag" style={{ fontSize: '0.72rem' }}>{n}</span>
                  ))}
                  {(r.accessibilityNeeds || []).length > 3 && (
                    <span className="need-tag" style={{ fontSize: '0.72rem' }}>+{(r.accessibilityNeeds || []).length - 3} more</span>
                  )}
                  {(!r.accessibilityNeeds || r.accessibilityNeeds.length === 0) && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>None specified</span>
                  )}
                </div>
              </td>
              <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
