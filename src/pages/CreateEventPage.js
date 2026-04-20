import React, { useState, useEffect, useRef } from 'react';
import { navigate } from '../App';
import { saveEvent, getEvent } from '../storage';

const ACCESSIBILITY_OPTIONS = [
  { id: 'wheelchair', label: 'Wheelchair accessible entrance' },
  { id: 'stepfree', label: 'Step-free route throughout' },
  { id: 'accessible-parking', label: 'Accessible parking available' },
  { id: 'elevator', label: 'Elevator / lift access' },
  { id: 'accessible-toilets', label: 'Accessible restrooms' },
  { id: 'quiet-room', label: 'Quiet room available' },
  { id: 'low-sensory', label: 'Low-sensory option offered' },
  { id: 'fragrance-free', label: 'Fragrance-free space' },
  { id: 'bsl', label: 'BSL / ASL interpreter provided' },
  { id: 'captions', label: 'Live captions available' },
  { id: 'large-print', label: 'Large print materials' },
  { id: 'hearing-loop', label: 'Hearing loop installed' },
  { id: 'service-animals', label: 'Service animals welcome' },
  { id: 'seating', label: 'Ample seating throughout' },
];

const VENUE_TYPES = [
  { value: '', label: 'Select venue type…' },
  { value: 'indoor', label: 'Indoor venue' },
  { value: 'outdoor', label: 'Outdoor venue' },
  { value: 'hybrid', label: 'Hybrid (indoor + outdoor)' },
  { value: 'online', label: 'Online / virtual' },
  { value: 'mixed', label: 'In-person + online stream' },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const EMPTY = {
  name: '', date: '', time: '', endTime: '', location: '', venueType: '',
  description: '', maxGuests: '', accessibilityFeatures: [],
  accessibilityNotes: '', contactEmail: '', contactName: '',
  askGuestNeeds: true, showGuestList: false,
};

function validate(fields) {
  const errs = {};
  if (!fields.name.trim()) errs.name = 'Event name is required.';
  if (!fields.date) errs.date = 'Date is required.';
  if (!fields.contactEmail.trim()) errs.contactEmail = 'Host email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.contactEmail)) errs.contactEmail = 'Enter a valid email address.';
  if (fields.maxGuests && (isNaN(fields.maxGuests) || Number(fields.maxGuests) < 1)) errs.maxGuests = 'Must be a positive number.';
  return errs;
}

export default function CreateEventPage({ addToast, editId }) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const firstErrorRef = useRef(null);
  const isEdit = Boolean(editId);

  useEffect(() => {
    if (editId) {
      const ev = getEvent(editId);
      if (ev) setFields({ ...EMPTY, ...ev });
    }
  }, [editId]);

  function set(key, val) {
    setFields(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const c = { ...e }; delete c[key]; return c; });
  }

  function toggleFeature(id) {
    setFields(f => ({
      ...f,
      accessibilityFeatures: f.accessibilityFeatures.includes(id)
        ? f.accessibilityFeatures.filter(x => x !== id)
        : [...f.accessibilityFeatures, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Focus first error
      setTimeout(() => {
        const el = document.querySelector('[aria-invalid="true"]');
        if (el) el.focus();
      }, 50);
      return;
    }
    setSaving(true);
    const event = {
      ...fields,
      id: editId || generateId(),
      createdAt: editId ? fields.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
    };
    saveEvent(event);
    addToast(isEdit ? 'Event updated successfully!' : 'Event created! Share the link with your guests.', 'success');
    navigate(`/event/${event.id}`);
  }

  const fieldProps = (key) => ({
    id: key,
    value: fields[key],
    onChange: e => set(key, e.target.value),
    'aria-invalid': errors[key] ? 'true' : undefined,
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
    className: `form-input${errors[key] ? ' is-error' : ''}`,
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ background: 'var(--forest)', padding: '3rem 0 2.5rem' }}>
        <div className="container-narrow">
          <nav aria-label="Breadcrumb">
            <ol style={{ listStyle: 'none', display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--sage)', marginBottom: '1rem' }}>
              <li><a href="#/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: 'var(--sage)', textDecoration: 'underline' }}>Home</a></li>
              <li aria-hidden="true">›</li>
              <li aria-current="page" style={{ color: 'var(--cream)' }}>{isEdit ? 'Edit event' : 'Create event'}</li>
            </ol>
          </nav>
          <h1 style={{ color: 'var(--cream)', marginBottom: '0.5rem' }}>{isEdit ? 'Edit event' : 'Create an accessible event'}</h1>
          <p style={{ color: 'var(--sage-light)' }}>All fields marked with <span aria-label="required">*</span> are required.</p>
        </div>
      </div>

      <div className="container-narrow" style={{ paddingTop: '2.5rem' }}>
        {Object.keys(errors).length > 0 && (
          <div className="alert alert-error" role="alert" aria-live="assertive" style={{ marginBottom: '2rem' }} ref={firstErrorRef}>
            <span aria-hidden="true">⚠</span>
            <div>
              <strong>Please fix these errors before continuing:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                {Object.entries(errors).map(([k, v]) => (
                  <li key={k}><a href={`#${k}`} onClick={e => { e.preventDefault(); document.getElementById(k)?.focus(); }} style={{ color: 'inherit' }}>{v}</a></li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate aria-label={isEdit ? 'Edit event form' : 'Create event form'}>

          {/* ── Section 1: Basics ── */}
          <section aria-labelledby="section-basics" className="card card-lg" style={{ marginBottom: '2rem' }}>
            <h2 id="section-basics" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Event basics</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Event name <span className="required" aria-label="required">*</span>
              </label>
              <input {...fieldProps('name')} type="text" placeholder="e.g. Community Summer Gathering" autoComplete="off" maxLength={120} />
              {errors.name && <span className="form-error" id="name-error" role="alert">{errors.name}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="date">
                  Date <span className="required" aria-label="required">*</span>
                </label>
                <input {...fieldProps('date')} type="date" />
                {errors.date && <span className="form-error" id="date-error" role="alert">{errors.date}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="time">Start time</label>
                <input id="time" type="time" className="form-input" value={fields.time} onChange={e => set('time', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="endTime">End time</label>
                <input id="endTime" type="time" className="form-input" value={fields.endTime} onChange={e => set('endTime', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="maxGuests">Guest capacity <span className="hint">Optional</span></label>
                <input id="maxGuests" type="number" className={`form-input${errors.maxGuests ? ' is-error' : ''}`} value={fields.maxGuests} onChange={e => set('maxGuests', e.target.value)} min="1" placeholder="e.g. 50" aria-invalid={errors.maxGuests ? 'true' : undefined} aria-describedby={errors.maxGuests ? 'maxGuests-error' : undefined} />
                {errors.maxGuests && <span className="form-error" id="maxGuests-error" role="alert">{errors.maxGuests}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="venueType">Venue type</label>
              <select id="venueType" className="form-select" value={fields.venueType} onChange={e => set('venueType', e.target.value)}>
                {VENUE_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Location / address
                {fields.venueType === 'online' && <span className="hint">Paste meeting link</span>}
              </label>
              <input id="location" type="text" className="form-input" value={fields.location} onChange={e => set('location', e.target.value)} placeholder={fields.venueType === 'online' ? 'https://meet.example.com/…' : 'e.g. 12 Elm Street, London EC1A 1BB'} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Event description</label>
              <textarea id="description" className="form-textarea" value={fields.description} onChange={e => set('description', e.target.value)} placeholder="Tell guests what to expect — the programme, dress code, what's included…" rows={4} aria-describedby="description-hint" />
              <span className="form-hint" id="description-hint">This will appear on your public event page.</span>
            </div>
          </section>

          {/* ── Section 2: Host contact ── */}
          <section aria-labelledby="section-contact" className="card card-lg" style={{ marginBottom: '2rem' }}>
            <h2 id="section-contact" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Host contact</h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Guests with accessibility questions can reach you through these details.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contactName">Your name</label>
                <input id="contactName" type="text" className="form-input" value={fields.contactName} onChange={e => set('contactName', e.target.value)} autoComplete="name" placeholder="e.g. Maya Chen" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contactEmail">
                  Host email <span className="required" aria-label="required">*</span>
                </label>
                <input {...fieldProps('contactEmail')} type="email" autoComplete="email" placeholder="you@example.com" />
                {errors.contactEmail && <span className="form-error" id="contactEmail-error" role="alert">{errors.contactEmail}</span>}
              </div>
            </div>
          </section>

          {/* ── Section 3: Accessibility info ── */}
          <section aria-labelledby="section-a11y" className="card card-lg" style={{ marginBottom: '2rem' }}>
            <h2 id="section-a11y" style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Venue accessibility</h2>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Let guests know what's available. This information appears prominently on your event page.
            </p>

            <fieldset className="fieldset" aria-describedby="features-hint">
              <legend>Which of these does your venue offer?</legend>
              <span className="form-hint" id="features-hint" style={{ display: 'block', marginTop: '0.5rem', marginBottom: '0.75rem' }}>Select all that apply</span>
              <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.6rem' }}>
                {ACCESSIBILITY_OPTIONS.map(opt => (
                  <div key={opt.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={`feat-${opt.id}`}
                      checked={fields.accessibilityFeatures.includes(opt.id)}
                      onChange={() => toggleFeature(opt.id)}
                    />
                    <label htmlFor={`feat-${opt.id}`}>{opt.label}</label>
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" htmlFor="accessibilityNotes">Additional accessibility notes</label>
              <textarea
                id="accessibilityNotes" className="form-textarea"
                value={fields.accessibilityNotes} onChange={e => set('accessibilityNotes', e.target.value)}
                placeholder="e.g. There is one step at the main entrance — please call ahead if you need ramp access. Strobe lighting will be used 9–10 PM. Gender-neutral bathrooms on ground floor."
                rows={3} aria-describedby="a11y-notes-hint"
              />
              <span className="form-hint" id="a11y-notes-hint">Specific details guests might need to plan their visit.</span>
            </div>
          </section>

          {/* ── Section 4: Settings ── */}
          <section aria-labelledby="section-settings" className="card card-lg" style={{ marginBottom: '2rem' }}>
            <h2 id="section-settings" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>RSVP settings</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { key: 'askGuestNeeds', label: 'Ask guests about accessibility needs', desc: 'Adds a detailed accessibility section to the RSVP form — mobility, dietary, communication, and sensory preferences.' },
                { key: 'showGuestList', label: 'Show guest list publicly', desc: 'Attending guests will be able to see who else is coming.' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <label htmlFor={`toggle-${key}`} style={{ fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', display: 'block', marginBottom: '0.25rem' }}>{label}</label>
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>{desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    id={`toggle-${key}`}
                    aria-checked={fields[key]}
                    onClick={() => set(key, !fields[key])}
                    style={{
                      flexShrink: 0, width: 48, height: 26, borderRadius: 999,
                      background: fields[key] ? 'var(--forest)' : 'var(--border-strong)',
                      border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    aria-label={label}
                  >
                    <span style={{
                      position: 'absolute', top: 3, left: fields[key] ? 24 : 3,
                      width: 20, height: 20, borderRadius: '50%', background: 'white',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
                    }} aria-hidden="true" />
                    <span className="sr-only">{fields[key] ? 'On' : 'Off'}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving} aria-busy={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
