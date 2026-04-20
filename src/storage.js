// Storage keys
const EVENTS_KEY = 'ai_events';
const RSVPS_KEY = 'ai_rsvps';

// Safely parse JSON from localStorage
function safeParse(val, fallback) {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

// ---- Events ----
export function getEvents() {
  return safeParse(localStorage.getItem(EVENTS_KEY), []);
}

export function getEvent(id) {
  return getEvents().find(e => e.id === id) || null;
}

export function saveEvent(event) {
  const events = getEvents();
  const idx = events.findIndex(e => e.id === event.id);
  if (idx >= 0) events[idx] = event;
  else events.unshift(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return event;
}

export function deleteEvent(id) {
  const events = getEvents().filter(e => e.id !== id);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  // also delete RSVPs
  const rsvps = getRsvps().filter(r => r.eventId !== id);
  localStorage.setItem(RSVPS_KEY, JSON.stringify(rsvps));
}

// ---- RSVPs ----
export function getRsvps(eventId) {
  const all = safeParse(localStorage.getItem(RSVPS_KEY), []);
  return eventId ? all.filter(r => r.eventId === eventId) : all;
}

export function saveRsvp(rsvp) {
  const rsvps = getRsvps();
  const idx = rsvps.findIndex(r => r.id === rsvp.id);
  if (idx >= 0) rsvps[idx] = rsvp;
  else rsvps.unshift(rsvp);
  localStorage.setItem(RSVPS_KEY, JSON.stringify(rsvps));
  return rsvp;
}

export function deleteRsvp(id) {
  const rsvps = getRsvps().filter(r => r.id !== id);
  localStorage.setItem(RSVPS_KEY, JSON.stringify(rsvps));
}

// ---- Analytics helpers ----
export function getEventStats(eventId) {
  const rsvps = getRsvps(eventId);
  const going = rsvps.filter(r => r.status === 'going');
  const maybe = rsvps.filter(r => r.status === 'maybe');
  const declined = rsvps.filter(r => r.status === 'declined');

  // Aggregate accessibility needs
  const needsCounts = {};
  rsvps.forEach(r => {
    (r.accessibilityNeeds || []).forEach(n => {
      needsCounts[n] = (needsCounts[n] || 0) + 1;
    });
  });

  // Dietary
  const dietaryCounts = {};
  rsvps.forEach(r => {
    (r.dietaryNeeds || []).forEach(n => {
      dietaryCounts[n] = (dietaryCounts[n] || 0) + 1;
    });
  });

  // Communication prefs
  const commCounts = {};
  rsvps.forEach(r => {
    if (r.communicationPref) {
      commCounts[r.communicationPref] = (commCounts[r.communicationPref] || 0) + 1;
    }
  });

  return {
    total: rsvps.length,
    going: going.length,
    maybe: maybe.length,
    declined: declined.length,
    needsCounts,
    dietaryCounts,
    commCounts,
    hasNotes: rsvps.filter(r => r.additionalNotes && r.additionalNotes.trim()).length,
  };
}
