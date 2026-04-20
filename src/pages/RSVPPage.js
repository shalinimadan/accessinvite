import React, { useState } from 'react';
import { navigate } from '../App';
import { getEvent, saveRsvp, getRsvps } from '../storage';

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const MOBILITY_NEEDS = [
  'Wheelchair access required',
  'Step-free route needed',
  'Accessible parking needed',
  'Elevator / lift access needed',
  'Walking aid (crutches / frame)',
  'Accessible restroom needed',
  'Seating required throughout',
];

const SENSORY_NEEDS = [
  'Low-noise / quiet space needed',
  'Low-light area needed',
  'Fragrance-free space needed',
  'Strobe / flashing light warning needed',
  'Quiet room access needed',
];

const COMMUNICATION_NEEDS = [
  'BSL interpreter required',
  'ASL interpreter required',
  'Live captions required',
  'Large print materials needed',
  'Easy-read materials needed',
  'Braille materials needed',
];

const DIETARY_OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Gluten-free',
  'Halal',
  'Kosher',
  'Nut-free / allergy',
  'Dairy-free',
  'Other (please specify in notes)',
];

const COMM_PREFS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone call' },
  { value: 'text', label: 'Text / SMS' },
  { value: 'any', label: 'Any method is fine' },
];

const EMPTY_RSVP = {
  name: '', email: '', phone: '', status: 'going',
  mobilityNeeds: [], sensoryNeeds: [], communicationNeeds: [], dietaryNeeds: [],
  accessibilityNeeds: [], communicationPref: 'any',
  additionalNotes: '', pronouns: '', guestCount: '1',
};

function validate(fields, event) {
  const errs = {};
  if (!fields.name.trim()) errs.name = 'Your name is required.';
  if (!fields.status) errs.status = 'Please select your attendance status.';
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email = 'Please enter a valid email address.';
  if (fields.guestCount && (isNaN(fields.guestCount) || Number(fields.guestCount) < 1)) errs.guestCount = 'Must be at least 1.';
  if (event?.maxGuests) {
    const current = getRsvps(event.id).filter(r => r.status === 'going').reduce((s, r) => s + (parseInt(r.guestCount) || 1), 0);
    if (current >= parseInt(event.maxGuests)) errs.capacity = 'Sorry — this event is at capacity.';
  }
  return errs;
}

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

export default function RSVPPage({ eventId, addToast }) {
  const event = getEvent(eventId);
  const [fields, setFields] = useState(EMPTY_RSVP);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = RSVP, 2 = accessibility

  if (!event) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Event not found</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>This RSVP link may be invalid or the event has been removed.</p>
        <a href="#/" className="btn btn-primary" onClick={e => { e.preventDefault(); navigate('/'); }}>Back to home</a>
      </div>
    );
  }

  function set(key, val) {
    setFields(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const c = { ...e }; delete c[key]; return c; });
  }

  function toggleArr(key, val) {
    setFields(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));
  }

  function handleStep1(e) {
    e.preventDefault();
    const step1Fields = { name: fields.name, email: fields.email, status: fields.status, guestCount: fields.guestCount };
    const errs = validate(fields, event);
    const step1Errs = {};
    if (errs.name) step1Errs.name = errs.name;
    if (errs.status) step1Errs.status = errs.status;
    if (errs.email) step1Errs.email = errs.email;
    if (errs.capacity) step1Errs.capacity = errs.capacity;
    if (Object.keys(step1Errs).length) {
      setErrors(step1Errs);
      setTimeout(() => { const el = document.querySelector('[aria-invalid="true"]'); if (el) el.focus(); }, 50);
      return;
    }
    if (!event.askGuestNeeds || fields.status === 'declined') {
      submitRsvp();
    } else {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function submitRsvp() {
    setSubmitting(true);
    const allNeeds = [...fields.mobilityNeeds, ...fields.sensoryNeeds, ...fields.communicationNeeds];
    const rsvp = {
      ...fields,
      accessibilityNeeds: allNeeds,
      id: generateId(),
      eventId: eventId,
      createdAt: new Date().toISOString(),
      guestCount: parseInt(fields.guestCount) || 1,
    };
    saveRsvp(rsvp);
    setTimeout(() => {
      navigate(`/event/${eventId}/rsvp-success/${encodeURIComponent(fields.name)}`);
    }, 600);
  }

  const CheckboxSection = ({ title, description, id, items, fieldKey }) => (
    <fieldset className="fieldset" style={{ marginBottom: '1.25rem' }} aria-describedby={`${id}-desc`}>
      <legend style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</legend>
      {description && <p className="form-hint" id={`${id}-desc`} style={{ marginTop: '0.35rem', marginBottom: '0.75rem' }}>{description}</p>}
      <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
        {items.map(item => (
          <div key={item} className="checkbox-item">
            <input
              type="checkbox"
              id={`${fieldKey}-${item}`}
              checked={fields[fieldKey].includes(item)}
              onChange={() => toggleArr(fieldKey, item)}
            />
            <label htmlFor={`${fieldKey}-${item}`}>{item}</label>
          </div>
        ))}
      </div>
    </fieldset>
  );

  const FEATURE_LABELS = {
    wheelchair: '♿ Wheelchair accessible', stepfree: '🚶 Step-free', 'accessible-parking': '🅿️ Accessible parking',
    elevator: '🛗 Elevator', 'accessible-toilets': '🚻 Accessible restrooms', 'quiet-room': '🔇 Quiet room',
    'low-sensory': '💡 Low-sensory', 'fragrance-free': '🌿 Fragrance-free', bsl: '🤟 BSL / ASL',
    captions: '📝 Live captions', 'large-print': '🔎 Large print', 'hearing-loop': '🔊 Hearing loop',
    'service-animals': '🦮 Service animals welcome', seating: '🪑 Ample seating',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Compact nav for RSVP page */}
      <header style={{ background: 'var(--forest)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="#/" className="nav-brand" style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--cream)', textDecoration: 'none' }} onClick={e => { e.preventDefault(); navigate('/'); }}>
            Access<span style={{ color: 'var(--sage)' }}>Invite</span>
          </a>
        </div>
      </header>
      <a href="#rsvp-form" className="skip-link">Skip to RSVP form</a>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        {/* Event info header */}
        <section aria-labelledby="event-name" style={{ marginBottom: '2.5rem' }}>
          <h1 id="event-name" style={{ marginBottom: '0.75rem' }}>{event.name}</h1>
          <dl style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 2rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {event.date && (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <dt><span aria-hidden="true">📅</span><span className="sr-only">Date:</span></dt>
                <dd>{formatDate(event.date)}{event.time && ` · ${formatTime(event.time)}`}</dd>
              </div>
            )}
            {event.location && (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <dt><span aria-hidden="true">📍</span><span className="sr-only">Location:</span></dt>
                <dd>{event.location}</dd>
              </div>
            )}
            {event.contactName && (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <dt><span aria-hidden="true">👤</span><span className="sr-only">Hosted by:</span></dt>
                <dd>{event.contactName}</dd>
              </div>
            )}
          </dl>
          {event.description && <p style={{ marginTop: '1rem', lineHeight: 1.8 }}>{event.description}</p>}

          {/* Venue accessibility */}
          {(event.accessibilityFeatures?.length > 0 || event.accessibilityNotes) && (
            <div className="card" style={{ marginTop: '1.5rem', background: '#e8f0ea', borderColor: '#b8d4c0' }} aria-labelledby="venue-a11y">
              <h2 id="venue-a11y" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                <span aria-hidden="true">♿ </span>Venue accessibility
              </h2>
              {event.accessibilityFeatures?.length > 0 && (
                <div className="needs-tags" style={{ marginBottom: event.accessibilityNotes ? '0.75rem' : 0 }}>
                  {event.accessibilityFeatures.map(id => (
                    <span key={id} className="need-tag">{FEATURE_LABELS[id] || id}</span>
                  ))}
                </div>
              )}
              {event.accessibilityNotes && <p style={{ fontSize: '0.88rem', margin: 0 }}>{event.accessibilityNotes}</p>}
              {event.contactEmail && (
                <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', marginBottom: 0, color: 'var(--text-muted)' }}>
                  Accessibility questions? <a href={`mailto:${event.contactEmail}`} style={{ color: 'var(--forest)' }}>{event.contactName || event.contactEmail}</a>
                </p>
              )}
            </div>
          )}
        </section>

        {/* Step indicator */}
        {event.askGuestNeeds && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }} role="navigation" aria-label="Form steps">
            {['Your details', 'Accessibility needs'].map((label, i) => (
              <React.Fragment key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.82rem', fontWeight: 700,
                      background: step > i + 1 ? 'var(--forest-light)' : step === i + 1 ? 'var(--forest)' : 'var(--cream-dark)',
                      color: step >= i + 1 ? 'white' : 'var(--text-muted)',
                    }}
                    aria-current={step === i + 1 ? 'step' : undefined}
                    aria-label={`Step ${i + 1}: ${label}${step === i + 1 ? ' (current)' : step > i + 1 ? ' (complete)' : ''}`}
                  >
                    {step > i + 1 ? '✓' : i + 1}
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                </div>
                {i < 1 && <div style={{ flex: 1, height: 1, background: step > 1 ? 'var(--forest-light)' : 'var(--border)' }} aria-hidden="true" />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* STEP 1: Basic RSVP */}
        {step === 1 && (
          <form id="rsvp-form" onSubmit={handleStep1} noValidate aria-label="RSVP form — your details">
            {Object.keys(errors).length > 0 && (
              <div className="alert alert-error" role="alert" aria-live="assertive" style={{ marginBottom: '1.5rem' }}>
                <span aria-hidden="true">⚠</span>
                <div>
                  <strong>Please fix these errors:</strong>
                  <ul style={{ marginTop: '0.4rem', paddingLeft: '1.25rem' }}>
                    {Object.values(errors).map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              </div>
            )}

            <div className="card card-lg" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Your details</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="name">
                    Full name <span className="required" aria-label="required">*</span>
                  </label>
                  <input
                    id="name" type="text" className={`form-input${errors.name ? ' is-error' : ''}`}
                    value={fields.name} onChange={e => set('name', e.target.value)}
                    autoComplete="name" placeholder="Your name" aria-required="true"
                    aria-invalid={errors.name ? 'true' : undefined} aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && <span className="form-error" id="name-error" role="alert">{errors.name}</span>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="pronouns">
                    Pronouns <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.82rem' }}>(optional)</span>
                  </label>
                  <input id="pronouns" type="text" className="form-input" value={fields.pronouns} onChange={e => set('pronouns', e.target.value)} placeholder="e.g. she/her, he/him, they/them" />
                </div>
              </div>
              <div className="divider" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="email">Email address</label>
                  <input
                    id="email" type="email" className={`form-input${errors.email ? ' is-error' : ''}`}
                    value={fields.email} onChange={e => set('email', e.target.value)}
                    autoComplete="email" placeholder="you@example.com"
                    aria-invalid={errors.email ? 'true' : undefined} aria-describedby="email-hint"
                  />
                  <span className="form-hint" id="email-hint">So the host can follow up on your needs.</span>
                  {errors.email && <span className="form-error" role="alert">{errors.email}</span>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="phone">Phone number</label>
                  <input id="phone" type="tel" className="form-input" value={fields.phone} onChange={e => set('phone', e.target.value)} autoComplete="tel" placeholder="Optional" />
                </div>
              </div>
              <div className="divider" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="guestCount">Number of guests attending</label>
                  <input id="guestCount" type="number" className="form-input" value={fields.guestCount} onChange={e => set('guestCount', e.target.value)} min="1" max={event.maxGuests || 100} aria-describedby="guestCount-hint" />
                  <span className="form-hint" id="guestCount-hint">Including yourself.</span>
                  {errors.guestCount && <span className="form-error" role="alert">{errors.guestCount}</span>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="communicationPref">Preferred contact method</label>
                  <select id="communicationPref" className="form-select" value={fields.communicationPref} onChange={e => set('communicationPref', e.target.value)}>
                    {COMM_PREFS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* RSVP status */}
            <div className="card card-lg" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Will you be attending?</h2>
              {errors.status && <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}><span aria-hidden="true">⚠</span> {errors.status}</div>}
              <div className="radio-group" role="radiogroup" aria-label="Attendance status" aria-required="true">
                {[
                  { value: 'going', label: '✓  Yes, I\'m going', desc: 'Count me in!' },
                  { value: 'maybe', label: '?  Maybe', desc: 'I\'m not sure yet' },
                  { value: 'declined', label: '✕  Can\'t make it', desc: 'Thanks for the invite' },
                ].map(opt => (
                  <div key={opt.value} className="radio-item" style={{ padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: `2px solid ${fields.status === opt.value ? 'var(--forest)' : 'var(--border)'}`, background: fields.status === opt.value ? '#e8f0ea' : 'white', transition: 'all 0.15s', cursor: 'pointer' }} onClick={() => set('status', opt.value)}>
                    <input type="radio" id={`status-${opt.value}`} name="status" value={opt.value} checked={fields.status === opt.value} onChange={() => set('status', opt.value)} />
                    <label htmlFor={`status-${opt.value}`} style={{ cursor: 'pointer', flex: 1 }}>
                      <span style={{ fontWeight: 600, display: 'block' }}>{opt.label}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{opt.desc}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-lg" aria-label={event.askGuestNeeds && fields.status !== 'declined' ? 'Continue to accessibility needs' : 'Submit RSVP'}>
                {event.askGuestNeeds && fields.status !== 'declined' ? 'Continue →' : 'Submit RSVP'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Accessibility needs */}
        {step === 2 && (
          <form id="rsvp-form" onSubmit={e => { e.preventDefault(); submitRsvp(); }} aria-label="RSVP form — accessibility needs">
            <div className="alert alert-info" role="note" style={{ marginBottom: '2rem' }}>
              <span aria-hidden="true">ℹ</span>
              <div>
                <strong>This section is entirely optional.</strong> Share only what you're comfortable with. Your responses go directly to the host ({event.contactName || 'the organiser'}) and are used only to prepare the right accommodations for you.
              </div>
            </div>

            <div className="card card-lg" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Mobility &amp; physical access</h2>
              <CheckboxSection title="Do you have any mobility or physical access needs?" id="mobility" items={MOBILITY_NEEDS} fieldKey="mobilityNeeds" />
            </div>

            <div className="card card-lg" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Sensory needs</h2>
              <CheckboxSection title="Do you have any sensory sensitivities or preferences?" id="sensory" items={SENSORY_NEEDS} fieldKey="sensoryNeeds" />
            </div>

            <div className="card card-lg" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Communication needs</h2>
              <CheckboxSection title="Do you need any communication support?" id="comm" items={COMMUNICATION_NEEDS} fieldKey="communicationNeeds" />
            </div>

            <div className="card card-lg" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>Dietary requirements</h2>
              <CheckboxSection title="Do you have any dietary needs?" id="dietary" items={DIETARY_OPTIONS} fieldKey="dietaryNeeds" />
            </div>

            <div className="card card-lg" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Anything else?</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="additionalNotes">
                  Additional notes <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.82rem' }}>(optional)</span>
                </label>
                <textarea
                  id="additionalNotes" className="form-textarea"
                  value={fields.additionalNotes} onChange={e => set('additionalNotes', e.target.value)}
                  placeholder="Anything else you'd like the host to know — specific requirements, questions, or preferences…"
                  rows={4} aria-describedby="notes-hint"
                />
                <span className="form-hint" id="notes-hint">This is shared only with the event host.</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost" onClick={() => { setStep(1); window.scrollTo({ top: 0 }); }}>
                ← Back
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} aria-busy={submitting}>
                {submitting ? 'Submitting…' : 'Submit RSVP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
