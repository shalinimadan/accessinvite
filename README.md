# AccessInvite — An Accessible RSVP Platform for Inclusive Events

AccessInvite is a web-based RSVP platform that puts accessibility at the centre of event planning. Hosts can create events, collect detailed accessibility needs from guests, and manage responses through an aggregated dashboard.

**Tagline:** Inclusive events, from the first click.

---

## Two ways to run this

### Option 1 — Open the standalone app immediately (no install)

Download **`AccessInvite.html`** and double-click it. The entire app (pages, routing, storage, styling) runs in a single file with no build step, no server, and no dependencies beyond a modern browser.

- All data persists in `localStorage` across reloads
- No account or API key required
- Works offline after first load (fonts cached)

### Option 2 — Run the React source (for development / modification)

Download **`accessinvite-source.zip`** and extract it. Then:

```bash
cd accessinvite
npm install --legacy-peer-deps
npm start
```

The dev server opens at `http://localhost:3000` with hot reload.

To produce your own standalone build:

```bash
npm run build
# Outputs to ./build/ — deploy to Netlify, Vercel, GitHub Pages, etc.
```

---

## Requirements

| Requirement | For standalone HTML | For source code |
|---|---|---|
| Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) | ✅ | ✅ |
| Node.js 16+ & npm | ❌ | ✅ |
| Internet (first load) | Fonts only | Fonts + npm |
| API keys | ❌ | ❌ |
| Backend server | ❌ | ❌ |

---

## Feature coverage

### MVP (all shipped ✅)

- **Create & customise event pages** at `#/create`
  - Name, date, start/end time, capacity, venue type, location, description
  - 14 pre-defined accessibility features (wheelchair, step-free, BSL/ASL, captions, etc.)
  - Free-text accessibility notes
  - Host contact (name + email)
  - RSVP settings (ask for accessibility needs, public guest list)

- **Accessible RSVP form** at `#/event/:id/rsvp`
  - Two-step form with clear progress indicator
  - Collects mobility, sensory, communication, and dietary needs
  - Pronouns field
  - Communication preference (email / phone / text / any)
  - Additional notes textarea
  - All fields keyboard-navigable; errors announced to screen readers

- **Host dashboard** at `#/dashboard`
  - Event sidebar with live RSVP counts
  - Six stat cards: total, going, maybe, declined, need types, notes
  - **Guest list tab** — filterable table with contact info, needs tags, dietary, notes
  - **Accessibility needs tab** — horizontal bar chart with counts + progress bars
  - **Summary report tab** — checklist of arrangements to prepare + **gap analysis** (flags guest needs your venue features don't cover)

- **Persistent data storage** — `localStorage`-backed via `src/storage.js`

- **Responsive & accessible UX** — WCAG 2.1 AA compliant

### Stretch goals included

- ✅ Real-time-ish RSVP updates (dashboard recomputes on every route change)
- ✅ Share-link generation with copy-to-clipboard
- ✅ Gap analysis (flags when guests need things your venue hasn't listed)

### Stretch goals not included

- ❌ Authentication (kept stateless — anyone with the link can manage their local events)
- ❌ External Maps API (venue details entered manually)
- ❌ Cross-device sync (would need a backend — `storage.js` is abstracted, so swapping to a fetch-based implementation is a small change)

---

## Accessibility implementation (WCAG 2.1 Level AA)

### Perceivable
- 4.5:1 contrast ratio on all body text; 3:1 on large text
- Semantic HTML throughout — `<main>`, `<nav>`, `<section>`, `<aside>`, `<article>`
- Decorative icons marked `aria-hidden="true"`; text alternatives nearby
- Live regions for dynamic content (`aria-live="polite"` on toasts, `assertive` on errors)

### Operable
- Skip-to-main-content link on every page
- Full keyboard navigation — no mouse required
- Visible 3px focus rings on every interactive element
- No keyboard traps
- `Tab` order matches visual order throughout

### Understandable
- Form labels paired with inputs via `htmlFor` / `id`
- `aria-invalid` + `aria-describedby` linking errors to fields
- Required fields marked with both `aria-required` and a visible asterisk
- Error summary at the top of invalid forms with anchor links to each offending field
- Plain-language error messages ("Your name is required", not "Field required")

### Robust
- `role` attributes where native semantics aren't enough (`role="switch"`, `role="tab"`, `role="progressbar"`)
- `aria-current` on active nav items and current step indicators
- `role="radiogroup"` with `aria-labelledby` on status selectors
- Breadcrumbs with `aria-label="Breadcrumb"` and `aria-current="page"`

---

## Project structure

```
accessinvite/
├── public/
│   └── index.html          # HTML shell with fonts
├── src/
│   ├── index.js            # React entry
│   ├── index.css           # Design tokens + global styles
│   ├── App.js              # Hash router, toast system
│   ├── storage.js          # localStorage abstraction
│   ├── components/
│   │   ├── Nav.js
│   │   └── ToastContainer.js
│   └── pages/
│       ├── HomePage.js
│       ├── CreateEventPage.js
│       ├── EventPage.js
│       ├── RSVPPage.js
│       ├── RSVPSuccessPage.js
│       └── DashboardPage.js
└── package.json
```

### Data model

```js
// Event
{
  id, name, date, time, endTime, location, venueType,
  description, maxGuests,
  accessibilityFeatures: ['wheelchair', 'stepfree', 'bsl', ...],
  accessibilityNotes, contactName, contactEmail,
  askGuestNeeds, showGuestList,
  createdAt, updatedAt, status
}

// RSVP
{
  id, eventId, name, email, phone, pronouns,
  status: 'going' | 'maybe' | 'declined',
  guestCount,
  mobilityNeeds, sensoryNeeds, communicationNeeds, dietaryNeeds,
  accessibilityNeeds,       // flattened union of the above
  communicationPref,
  additionalNotes,
  createdAt
}
```

---

## Testing the end-to-end flow

1. Open the app → click **Create Event**
2. Fill in "Community Summer Gathering", set a date, tick several accessibility features, add host contact, click **Create event**
3. You land on the event page — click **Copy link** to grab the RSVP URL
4. Open that URL in a new tab → fill out the RSVP as a guest, select several accessibility needs, submit
5. Repeat step 4 a few more times with different names and needs
6. Navigate to **Dashboard** → see stats update, switch tabs to view needs breakdown and summary report
7. If guest needs exceed what your venue offers, the Summary tab flags the gap

---

## Running accessibility audits

```bash
# Install axe-core CLI
npm install -g @axe-core/cli

# Start the app in one terminal
npm start

# Audit in another
axe http://localhost:3000
axe "http://localhost:3000/#/create"
axe "http://localhost:3000/#/dashboard"
```

Or drop `AccessInvite.html` into [wave.webaim.org](https://wave.webaim.org) for a visual report.

---

## Known limitations

- **Single-device data** — RSVPs live in `localStorage`, so a guest RSVPing on their phone doesn't show on the host's laptop unless they use the same browser. For multi-user sync, swap `storage.js` for a fetch-based implementation against Firebase, Supabase, or a custom API.
- **No email notifications** — the host's contact email is displayed but no automated emails are sent.
- **No authentication** — anyone with a link can view or edit. Roles are a planned stretch goal.

---

## License

MIT. Use it, fork it, ship it.
