import React from 'react';
import { navigate } from '../App';
import { getEvents } from '../storage';

const FEATURES = [
  { icon: '♿', title: 'Accessibility-first RSVPs', desc: 'Every RSVP form collects mobility, dietary, communication, and sensory needs — so every guest can attend comfortably.' },
  { icon: '📊', title: 'Host dashboard', desc: 'Aggregate insights show you exactly what accommodations to prepare — sorted, counted, and exportable.' },
  { icon: '💾', title: 'Persistent data', desc: 'Events and RSVPs are saved locally so you can return, edit, and manage over time.' },
  { icon: '⌨️', title: 'WCAG AA compliant', desc: 'Full keyboard navigation, screen reader support, proper heading hierarchy, and 4.5:1+ contrast throughout.' },
];

export default function HomePage() {
  const events = getEvents();
  const recentEvents = events.slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="page-hero" aria-labelledby="hero-heading">
        <div className="container">
          <div style={{ maxWidth: 680 }}>
            <p style={{ color: 'var(--sage)', fontWeight: 500, marginBottom: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
              Inclusive events, from the first click
            </p>
            <h1 id="hero-heading" style={{ marginBottom: '1.25rem' }}>
              The RSVP platform built for everyone
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--sage-light)', maxWidth: 560, marginBottom: '2rem', lineHeight: 1.7 }}>
              AccessInvite puts accessibility at the centre of event planning — not as an afterthought. Create events, collect detailed accessibility needs, and make every guest feel genuinely welcome.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href="#/create"
                className="btn btn-accent btn-lg"
                onClick={e => { e.preventDefault(); navigate('/create'); }}
              >
                Create your first event
              </a>
              <a
                href="#/dashboard"
                className="btn btn-secondary btn-lg"
                style={{ color: 'var(--sage-light)', borderColor: 'var(--sage)' }}
                onClick={e => { e.preventDefault(); navigate('/dashboard'); }}
              >
                View dashboard
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 0', background: 'var(--cream)' }} aria-labelledby="features-heading">
        <div className="container">
          <h2 id="features-heading" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Built different</h2>
          <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-muted)' }}>Most RSVP tools bolt on accessibility. We built around it.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map(f => (
              <article key={f.title} className="card" aria-label={f.title}>
                <div style={{ fontSize: '2.25rem', marginBottom: '1rem', lineHeight: 1 }} aria-hidden="true">{f.icon}</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.05rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9rem' }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility needs preview */}
      <section style={{ padding: '5rem 0', background: 'var(--forest)', color: 'var(--cream)' }} aria-labelledby="needs-heading">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 id="needs-heading" style={{ color: 'var(--cream)', marginBottom: '1rem' }}>
                What we ask your guests
              </h2>
              <p style={{ color: 'var(--sage-light)', marginBottom: '2rem', lineHeight: 1.8 }}>
                Our RSVP form goes beyond "name and email." Guests can share exactly what they need — privately and simply — so you can prepare the right accommodations.
              </p>
              <a href="#/create" className="btn btn-accent" onClick={e => { e.preventDefault(); navigate('/create'); }}>
                Start planning →
              </a>
            </div>
            <div>
              {[
                { cat: 'Mobility', items: ['Wheelchair access', 'Step-free route', 'Accessible parking', 'Elevator needed'] },
                { cat: 'Sensory', items: ['Low-noise space', 'Low-light area', 'Fragrance-free', 'Quiet room'] },
                { cat: 'Communication', items: ['BSL / ASL interpreter', 'Live captions', 'Large print materials', 'Easy-read materials'] },
                { cat: 'Dietary', items: ['Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Nut-free'] },
              ].map(cat => (
                <div key={cat.cat} style={{ marginBottom: '1.25rem' }}>
                  <p style={{ color: 'var(--sage)', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{cat.cat}</p>
                  <div className="needs-tags">
                    {cat.items.map(i => (
                      <span key={i} className="need-tag" style={{ background: 'rgba(122,171,138,0.25)', color: 'var(--sage-light)' }}>{i}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent events */}
      {recentEvents.length > 0 && (
        <section style={{ padding: '4rem 0' }} aria-labelledby="recent-heading">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 id="recent-heading">Your recent events</h2>
              <a href="#/dashboard" className="btn btn-ghost btn-sm" onClick={e => { e.preventDefault(); navigate('/dashboard'); }}>View all →</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {recentEvents.map(ev => (
                <a
                  key={ev.id}
                  href={`#/event/${ev.id}`}
                  className="card"
                  style={{ textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s, transform 0.2s' }}
                  onClick={e => { e.preventDefault(); navigate(`/event/${ev.id}`); }}
                  aria-label={`${ev.name}, ${ev.date}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>{ev.name}</h3>
                    <span className="badge badge-sage">{ev.status || 'Active'}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    📅 {ev.date}{ev.time ? ` at ${ev.time}` : ''}
                  </p>
                  {ev.location && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {ev.location}</p>}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: 'var(--ink)', color: 'var(--cream)', padding: '3rem 0', marginTop: 'auto' }} role="contentinfo">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--cream)', marginBottom: '0.25rem' }}>AccessInvite</p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,0.6)' }}>Inclusive events, from the first click.</p>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'rgba(245,240,232,0.5)' }}>WCAG 2.1 AA compliant · Built for everyone</p>
        </div>
      </footer>
    </>
  );
}
