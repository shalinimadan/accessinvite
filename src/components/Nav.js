import React from 'react';
import { navigate } from '../App';

export default function Nav({ currentPage }) {
  return (
    <nav className="nav" aria-label="Main navigation">
      <div className="container nav-inner">
        <a
          href="#/"
          className="nav-brand"
          aria-label="AccessInvite home"
          onClick={e => { e.preventDefault(); navigate('/'); }}
        >
          Access<span>Invite</span>
        </a>
        <div className="nav-actions" role="list">
          <a
            href="#/dashboard"
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--sage-light)', borderColor: 'rgba(122,171,138,0.4)' }}
            role="listitem"
            onClick={e => { e.preventDefault(); navigate('/dashboard'); }}
            aria-current={currentPage === 'dashboard' ? 'page' : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </a>
          <a
            href="#/create"
            className="btn btn-accent btn-sm"
            role="listitem"
            onClick={e => { e.preventDefault(); navigate('/create'); }}
            aria-current={currentPage === 'create' ? 'page' : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Event
          </a>
        </div>
      </div>
    </nav>
  );
}
