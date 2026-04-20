import React, { useState, useEffect, useCallback } from 'react';
import './index.css';
import HomePage from './pages/HomePage';
import CreateEventPage from './pages/CreateEventPage';
import EventPage from './pages/EventPage';
import RSVPPage from './pages/RSVPPage';
import DashboardPage from './pages/DashboardPage';
import RSVPSuccessPage from './pages/RSVPSuccessPage';
import Nav from './components/Nav';
import ToastContainer from './components/ToastContainer';

// Minimal hash-based router
function parseRoute() {
  const hash = window.location.hash.replace('#', '') || '/';
  const parts = hash.split('/').filter(Boolean);
  if (parts.length === 0) return { page: 'home', params: {} };
  if (parts[0] === 'create') return { page: 'create', params: {} };
  if (parts[0] === 'dashboard') return { page: 'dashboard', params: {} };
  if (parts[0] === 'event' && parts[1]) {
    if (parts[2] === 'rsvp') return { page: 'rsvp', params: { eventId: parts[1] } };
    if (parts[2] === 'rsvp-success') return { page: 'rsvp-success', params: { eventId: parts[1], guestName: decodeURIComponent(parts[3] || '') } };
    if (parts[2] === 'edit') return { page: 'edit', params: { eventId: parts[1] } };
    return { page: 'event', params: { eventId: parts[1] } };
  }
  return { page: 'home', params: {} };
}

export function navigate(path) {
  window.location.hash = path;
}

export default function App() {
  const [route, setRoute] = useState(parseRoute());
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = () => setRoute(parseRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Focus main content on route change for accessibility
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) { main.setAttribute('tabindex', '-1'); main.focus(); main.removeAttribute('tabindex'); }
  }, [route]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const showNav = !['rsvp', 'rsvp-success'].includes(route.page);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {showNav && <Nav currentPage={route.page} />}
      <main id="main-content">
        {route.page === 'home' && <HomePage addToast={addToast} />}
        {route.page === 'create' && <CreateEventPage addToast={addToast} />}
        {route.page === 'edit' && <CreateEventPage addToast={addToast} editId={route.params.eventId} />}
        {route.page === 'event' && <EventPage eventId={route.params.eventId} addToast={addToast} />}
        {route.page === 'rsvp' && <RSVPPage eventId={route.params.eventId} addToast={addToast} />}
        {route.page === 'rsvp-success' && <RSVPSuccessPage eventId={route.params.eventId} guestName={route.params.guestName} />}
        {route.page === 'dashboard' && <DashboardPage addToast={addToast} />}
      </main>
      <ToastContainer toasts={toasts} />
    </>
  );
}
