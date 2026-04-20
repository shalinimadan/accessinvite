import React from 'react';
import { navigate } from '../App';
import { getEvent } from '../storage';

export default function RSVPSuccessPage({ eventId, guestName }) {
  const event = getEvent(eventId);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div
          style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.25rem' }}
          role="img" aria-label="Success checkmark"
        >
          ✓
        </div>
        <h1 style={{ marginBottom: '0.75rem' }}>RSVP received!</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Thanks{guestName ? `, ${guestName}` : ''}! Your response has been recorded.
        </p>
        {event && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            The host of <strong style={{ color: 'var(--text-primary)' }}>{event.name}</strong> will be in touch if they need anything from you.
          </p>
        )}

        <div className="card" style={{ background: 'var(--success-light)', borderColor: '#b8d4c0', marginBottom: '2rem', textAlign: 'left' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--success)' }}>What happens next?</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--success)' }}>
            {[
              'The host has your details and any accessibility needs you shared.',
              'If you provided an email, they may follow up to confirm arrangements.',
              event?.contactEmail ? `Questions? Reach the host at ${event.contactEmail}.` : null,
            ].filter(Boolean).map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
                <span aria-hidden="true">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        {event && (
          <a
            href={`#/event/${eventId}`}
            className="btn btn-secondary"
            onClick={e => { e.preventDefault(); navigate(`/event/${eventId}`); }}
          >
            View event details
          </a>
        )}
      </div>
    </div>
  );
}
