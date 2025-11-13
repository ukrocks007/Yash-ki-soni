# Editing Guide (Modular Setup)

We've split the long `index.html` into smaller, easy-to-edit parts.

## New Structure

- `index.html` – Loads CSS/JS and includes partials dynamically
- `assets/css/styles.css` – All styles
- `assets/js/main.js` – All JavaScript (GSAP animations + partial loader)
- `partials/`
  - `nav.html` – Top navigation
  - `hero.html` – Hero section
  - `timeline.html` – Wedding timeline
  - `menu.html` – Culinary journey
  - `rooms.html` – Room allocation
  - `footer.html` – Footer/contact

## How to edit

- Change text or layout for a section by editing its file in `partials/`.
- Update styles in `assets/css/styles.css`.
- Update behavior/animations in `assets/js/main.js`.

## Local preview

Because partials are fetched via `fetch()`, open the site via a local server (not the `file://` scheme).

If you have Node.js:

- Dev server: `npm run dev`
- Open: http://localhost:3000 (or the port shown)

Alternatively, in VS Code, use the Live Server extension.

## Notes

- After editing partials, reload the browser to see changes.
- All GSAP animations and interactive behavior automatically initialize after partials load.
- Mobile menu: on small screens, tap the hamburger to toggle nav links.
