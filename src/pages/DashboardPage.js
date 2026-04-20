import React, { useState, useEffect } from 'react';
import { navigate } from '../App';
import { getEvents, getEventStats, getRsvps, deleteRsvp } from '../storage';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

export default function DashboardPage({ addToast }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tab, setTab] = useState('guests'); // guests | needs | summary
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const evs = getEvents();
    setEvents(evs);
    if (evs.length > 0 && !selectedEvent) setSelectedEvent(evs[0].id);
  }, []);

  const event = events.find(e => e.id === selectedEvent);
  const stats = selectedEvent ? getEventStats(selectedEvent) : null;
  const allRsvps = selectedEvent ? getRsvps(selectedEvent) : [];
  const filteredRsvps = filter === 'all' ? allRsvps : allRsvps.filter(r => r.status === filter);

  function handleDeleteRsvp(rsvpId, name) {
    if (!window.confirm(`Remove RSVP from ${name}? This cannot be undone.`)) return;
    deleteRsvp(rsvpId);
    addToast(`RSVP from ${name} removed.`, 'success');
    setEvents(getEvents()); // trigger re-render
  }

  const statusBadge = { going: 'badge-green', maybe: 'badge-amber', declined: 'badge-red' };
  const statusLabel = { going: 'Going', maybe: 'Maybe', declined: 'Declined' };

  // Sort needs by count
  const sortedNeeds = stats ? Object.entries(stats.needsCounts).sort((a, b) => b[1] - a[1]) : [];
  const sortedDietary = stats ? Object.entries(stats.dietaryCounts).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <div style={{ background: 'var(--forest)', padding: '2.5rem 0' }}>
        <div className="container-wide">
          <h1 style={{ color: 'var(--cream)', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--sage-light)' }}>Manage your events and guest accessibility needs.</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="container" style={{ paddingTop: '4rem' }}>
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h3>No events yet</h3>
            <p style={{ marginBottom: '1.5rem' }}>Create your first accessible event to get started.</p>
            <a href="#/create" className="btn btn-primary" onClick={e => { e.preventDefault(); navigate('/create'); }}>Create an event</a>
          </div>
        </div>
      ) : (
        <div className="container-wide" style={{ paddingTop: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>

            {/* Event list sidebar */}
            <aside aria-label="Your events">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '0.95rem', margin: 0 }}>Your events</h2>
                <a href="#/create" className="btn btn-accent btn-sm" onClick={e => { e.preventDefault(); navigate('/create'); }}>+ New</a>
              </div>
              <nav aria-label="Event list">
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {events.map(ev => {
                    const s = getEventStats(ev.id);
                    const isSelected = ev.id === selectedEvent;
                    return (
                      <li key={ev.id}>
                        <button
                          onClick={() => { setSelectedEvent(ev.id); setTab('guests'); setFilter('all'); }}
                          aria-current={isSelected ? 'true' : undefined}
                          aria-label={`${ev.name}, ${s.total} RSVPs`}
                          style={{
                            width: '100%', textAlign: 'left', padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-sm)', border: `2px solid ${isSelected ? 'var(--forest)' : 'var(--border)'}`,
                            background: isSelected ? '#e8f0ea' : 'white', cursor: 'pointer',
                            transition: 'all 0.15s', fontFamily: 'inherit',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{formatDate(ev.date)}</span>
                            <span>{s.total} RSVP{s.total !== 1 ? 's' : ''}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>

            {/* Main panel */}
            {event && stats && (
              <main aria-labelledby="dashboard-event-title">
                {/* Event header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 id="dashboard-event-title" style={{ marginBottom: '0.25rem' }}>{event.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {formatDate(event.date)}{event.location ? ` · ${event.location}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a href={`#/event/${event.id}`} className="btn btn-ghost btn-sm" onClick={e => { e.preventDefault(); navigate(`/event/${event.id}`); }}>View page</a>
                    <a href={`#/event/${event.id}/edit`} className="btn btn-ghost btn-sm" onClick={e => { e.preventDefault(); navigate(`/event/${event.id}/edit`); }}>Edit</a>
                    <a href={`#/event/${event.id}/rsvp`} className="btn btn-accent btn-sm" onClick={e => { e.preventDefault(); navigate(`/event/${event.id}/rsvp`); }}>RSVP form ↗</a>
                  </div>
                </div>

                {/* Stats row */}
                <section aria-labelledby="stats-heading" style={{ marginBottom: '1.5rem' }}>
                  <h3 id="stats-heading" className="sr-only">RSVP statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-card" aria-label={`${stats.total} total responses`}>
                      <div className="stat-number">{stats.total}</div>
                      <div className="stat-label">Total RSVPs</div>
                    </div>
                    <div className="stat-card" style={{ background: 'var(--forest-mid)' }} aria-label={`${stats.going} attending`}>
                      <div className="stat-number">{stats.going}</div>
                      <div className="stat-label">Going</div>
                    </div>
                    <div className="stat-card" style={{ background: '#a87320' }} aria-label={`${stats.maybe} maybe`}>
                      <div className="stat-number">{stats.maybe}</div>
                      <div className="stat-label">Maybe</div>
                    </div>
                    <div className="stat-card" style={{ background: '#5a2020' }} aria-label={`${stats.declined} declined`}>
                      <div className="stat-number">{stats.declined}</div>
                      <div className="stat-label">Declined</div>
                    </div>
                    <div className="stat-card light" aria-label={`${sortedNeeds.length} types of accessibility needs`}>
                      <div className="stat-number">{sortedNeeds.length}</div>
                      <div className="stat-label">Need types</div>
                    </div>
                    <div className="stat-card light" aria-label={`${stats.hasNotes} guests left additional notes`}>
                      <div className="stat-number">{stats.hasNotes}</div>
                      <div className="stat-label">With notes</div>
                    </div>
                  </div>
                </section>

                {/* Tab navigation */}
                <div role="tablist" aria-label="Dashboard sections" style={{ display: 'flex', gap: '0.25rem', background: 'var(--cream-dark)', padding: '4px', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', width: 'fit-content' }}>
                  {[
                    { id: 'guests', label: 'Guest list' },
                    { id: 'needs', label: 'Accessibility needs' },
                    { id: 'summary', label: 'Summary report' },
                  ].map(t => (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={tab === t.id}
                      aria-controls={`tabpanel-${t.id}`}
                      id={`tab-${t.id}`}
                      onClick={() => setTab(t.id)}
                      style={{
                        padding: '0.45rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: tab === t.id ? 600 : 400,
                        background: tab === t.id ? 'white' : 'transparent',
                        color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                        boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab: Guest list */}
                <div role="tabpanel" id="tabpanel-guests" aria-labelledby="tab-guests" hidden={tab !== 'guests'}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <label htmlFor="status-filter" className="form-label" style={{ margin: 0 }}>Filter:</label>
                    <select id="status-filter" className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
                      <option value="all">All ({allRsvps.length})</option>
                      <option value="going">Going ({stats.going})</option>
                      <option value="maybe">Maybe ({stats.maybe})</option>
                      <option value="declined">Declined ({stats.declined})</option>
                    </select>
                    <span aria-live="polite" aria-atomic="true" className="sr-only">Showing {filteredRsvps.length} results</span>
                  </div>
                  {filteredRsvps.length === 0 ? (
                    <div className="empty-state" style={{ padding: '3rem' }}>
                      <p>No RSVPs {filter !== 'all' ? `with status "${filter}"` : 'yet'}.</p>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table className="data-table" aria-label={`Guest list — ${filteredRsvps.length} guests`}>
                        <thead>
                          <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Status</th>
                            <th scope="col">Contact</th>
                            <th scope="col">Guests</th>
                            <th scope="col">Accessibility needs</th>
                            <th scope="col">Dietary</th>
                            <th scope="col">Notes</th>
                            <th scope="col">Date</th>
                            <th scope="col"><span className="sr-only">Actions</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRsvps.map(r => (
                            <tr key={r.id}>
                              <td>
                                <strong style={{ color: 'var(--text-primary)' }}>{r.name}</strong>
                                {r.pronouns && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.pronouns}</div>}
                              </td>
                              <td><span className={`badge ${statusBadge[r.status] || 'badge-sage'}`}>{statusLabel[r.status] || r.status}</span></td>
                              <td style={{ fontSize: '0.82rem' }}>
                                {r.email && <div><a href={`mailto:${r.email}`} style={{ color: 'var(--forest)' }}>{r.email}</a></div>}
                                {r.phone && <div style={{ color: 'var(--text-muted)' }}>{r.phone}</div>}
                                {r.communicationPref && r.communicationPref !== 'any' && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Prefers: {r.communicationPref}</div>}
                              </td>
                              <td style={{ textAlign: 'center' }}>{r.guestCount || 1}</td>
                              <td>
                                <div className="needs-tags">
                                  {(r.accessibilityNeeds || []).map(n => <span key={n} className="need-tag" style={{ fontSize: '0.72rem' }}>{n}</span>)}
                                  {(!r.accessibilityNeeds || r.accessibilityNeeds.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>}
                                </div>
                              </td>
                              <td>
                                <div className="needs-tags">
                                  {(r.dietaryNeeds || []).map(n => <span key={n} className="need-tag" style={{ fontSize: '0.72rem', background: '#fef3e0', color: 'var(--warning)' }}>{n}</span>)}
                                  {(!r.dietaryNeeds || r.dietaryNeeds.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>}
                                </div>
                              </td>
                              <td style={{ fontSize: '0.82rem', maxWidth: 160 }}>
                                {r.additionalNotes ? <span title={r.additionalNotes}>{r.additionalNotes.slice(0, 60)}{r.additionalNotes.length > 60 ? '…' : ''}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                              </td>
                              <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                              </td>
                              <td>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: 'var(--error)', borderColor: 'var(--error)' }}
                                  onClick={() => handleDeleteRsvp(r.id, r.name)}
                                  aria-label={`Remove RSVP from ${r.name}`}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Tab: Accessibility needs breakdown */}
                <div role="tabpanel" id="tabpanel-needs" aria-labelledby="tab-needs" hidden={tab !== 'needs'}>
                  {sortedNeeds.length === 0 && sortedDietary.length === 0 ? (
                    <div className="empty-state" style={{ padding: '3rem' }}>
                      <p>No accessibility needs recorded yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <section aria-labelledby="mobility-needs-heading" className="card">
                        <h3 id="mobility-needs-heading" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Accessibility &amp; communication needs</h3>
                        {sortedNeeds.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>None reported.</p>
                        ) : (
                          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {sortedNeeds.map(([need, count]) => (
                              <li key={need}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.88rem' }}>
                                  <span>{need}</span>
                                  <strong aria-label={`${count} guest${count !== 1 ? 's' : ''}`}>{count}</strong>
                                </div>
                                <div className="progress-bar" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={stats.going || stats.total} aria-label={`${need}: ${count} out of ${stats.going || stats.total}`}>
                                  <div className="progress-fill" style={{ width: `${Math.round((count / (stats.going || stats.total || 1)) * 100)}%` }} />
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>

                      <section aria-labelledby="dietary-heading" className="card">
                        <h3 id="dietary-heading" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Dietary requirements</h3>
                        {sortedDietary.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>None reported.</p>
                        ) : (
                          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                            {sortedDietary.map(([need, count]) => (
                              <li key={need}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.88rem' }}>
                                  <span>{need}</span>
                                  <strong aria-label={`${count} guest${count !== 1 ? 's' : ''}`}>{count}</strong>
                                </div>
                                <div className="progress-bar" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={stats.going || stats.total} aria-label={`${need}: ${count}`}>
                                  <div className="progress-fill" style={{ width: `${Math.round((count / (stats.going || stats.total || 1)) * 100)}%`, background: 'var(--amber)' }} />
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>

                      {/* Guests with notes */}
                      {allRsvps.filter(r => r.additionalNotes?.trim()).length > 0 && (
                        <section aria-labelledby="notes-heading" className="card" style={{ gridColumn: '1 / -1' }}>
                          <h3 id="notes-heading" style={{ fontSize: '1rem', marginBottom: '1rem' }}>Additional notes from guests</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {allRsvps.filter(r => r.additionalNotes?.trim()).map(r => (
                              <blockquote key={r.id} style={{ borderLeft: '3px solid var(--sage)', paddingLeft: '1rem', margin: 0 }}>
                                <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem', fontStyle: 'italic' }}>"{r.additionalNotes}"</p>
                                <footer style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>— {r.name}</footer>
                              </blockquote>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </div>

                {/* Tab: Summary report */}
                <div role="tabpanel" id="tabpanel-summary" aria-labelledby="tab-summary" hidden={tab !== 'summary'}>
                  <div className="card card-lg">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Accessibility preparation checklist</h3>
                    <p style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
                      Based on your guest responses, here's what to prepare for <strong>{event.name}</strong>:
                    </p>

                    {stats.total === 0 ? (
                      <div className="alert alert-info"><span aria-hidden="true">ℹ</span> No RSVPs yet — check back after guests have responded.</div>
                    ) : (
                      <>
                        {/* Accessibility checklist */}
                        {sortedNeeds.length > 0 && (
                          <section style={{ marginBottom: '2rem' }} aria-labelledby="checklist-a11y">
                            <h4 id="checklist-a11y" style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Accessibility arrangements needed</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {sortedNeeds.map(([need, count]) => (
                                <li key={need} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                  <input type="checkbox" id={`check-${need}`} style={{ marginTop: 4, accentColor: 'var(--forest)', width: 18, height: 18, flexShrink: 0 }} aria-label={`Prepared: ${need} (${count} guest${count !== 1 ? 's' : ''})`} />
                                  <label htmlFor={`check-${need}`} style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                                    {need} — <strong>{count} guest{count !== 1 ? 's' : ''}</strong>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}

                        {/* Dietary checklist */}
                        {sortedDietary.length > 0 && (
                          <section style={{ marginBottom: '2rem' }} aria-labelledby="checklist-dietary">
                            <h4 id="checklist-dietary" style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Dietary requirements to arrange</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {sortedDietary.map(([diet, count]) => (
                                <li key={diet} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                  <input type="checkbox" id={`diet-${diet}`} style={{ marginTop: 4, accentColor: 'var(--forest)', width: 18, height: 18, flexShrink: 0 }} aria-label={`Prepared: ${diet} (${count} guest${count !== 1 ? 's' : ''})`} />
                                  <label htmlFor={`diet-${diet}`} style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                                    {diet} — <strong>{count} guest{count !== 1 ? 's' : ''}</strong>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}

                        {sortedNeeds.length === 0 && sortedDietary.length === 0 && (
                          <div className="alert alert-success"><span aria-hidden="true">✓</span> No specific accessibility or dietary needs reported by guests so far.</div>
                        )}

                        {/* Venue feature gap analysis */}
                        <section aria-labelledby="gap-analysis">
                          <h4 id="gap-analysis" style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Venue provision vs. guest needs</h4>
                          {(() => {
                            const NEED_TO_FEATURE = {
                              'Wheelchair access required': 'wheelchair',
                              'Step-free route needed': 'stepfree',
                              'Accessible parking needed': 'accessible-parking',
                              'Elevator / lift access needed': 'elevator',
                              'Accessible restroom needed': 'accessible-toilets',
                              'Quiet room access needed': 'quiet-room',
                              'Low-noise / quiet space needed': 'quiet-room',
                              'Fragrance-free space needed': 'fragrance-free',
                              'BSL interpreter required': 'bsl',
                              'ASL interpreter required': 'bsl',
                              'Live captions required': 'captions',
                              'Large print materials needed': 'large-print',
                            };
                            const gaps = sortedNeeds.filter(([need]) => {
                              const featureId = NEED_TO_FEATURE[need];
                              return featureId && !(event.accessibilityFeatures || []).includes(featureId);
                            });
                            if (gaps.length === 0) return (
                              <div className="alert alert-success"><span aria-hidden="true">✓</span> Your venue features cover all reported guest needs. Great work!</div>
                            );
                            return (
                              <div className="alert alert-warning" role="alert">
                                <span aria-hidden="true">⚠</span>
                                <div>
                                  <strong>Potential gaps to address:</strong>
                                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                                    {gaps.map(([need, count]) => (
                                      <li key={need} style={{ fontSize: '0.88rem', marginBottom: '0.25rem' }}>{need} — needed by {count} guest{count !== 1 ? 's' : ''}, not listed in your venue features</li>
                                    ))}
                                  </ul>
                                  <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                                    <a href={`#/event/${event.id}/edit`} style={{ color: 'inherit', textDecoration: 'underline' }} onClick={e => { e.preventDefault(); navigate(`/event/${event.id}/edit`); }}>Update your event page</a> to add these features or contact affected guests directly.
                                  </p>
                                </div>
                              </div>
                            );
                          })()}
                        </section>
                      </>
                    )}
                  </div>
                </div>
              </main>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
