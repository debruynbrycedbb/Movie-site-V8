/* ============================================================
   TOP BY GENRE
   For each genre, the highest rated film you've given a score to,
   plus the next two behind it. Ties break towards the film you
   rated first - you committed to that one earlier.
   ============================================================ */

const $$ = sel => document.querySelector(sel);
const content = $$('#content');

/** Every genre that appears anywhere in the library, alphabetically. */
function allGenres() {
  const set = new Set();
  MOVIES.forEach(m => m.genres.forEach(g => set.add(g)));
  return [...set].sort();
}

/** Rated films in a genre, best first. */
function rankedIn(genre) {
  return MOVIES
    .filter(m => m.genres.includes(genre) && Store.getRating(m.id) !== null)
    .sort((a, b) => {
      const d = Store.getRating(b.id) - Store.getRating(a.id);
      if (d !== 0) return d;
      const t = Store.getRatedAt(a.id) - Store.getRatedAt(b.id);
      if (t !== 0) return t;
      return a.title.localeCompare(b.title);
    });
}

function metaLine(m) {
  const bits = [];
  if (m.year) bits.push(String(m.year));
  if (m.director) bits.push(m.director);
  const rt = fmtRuntime(m.runtime);
  if (rt) bits.push(rt);
  return bits.join(' · ');
}

function cardHtml(genre, ranked, totalInGenre) {
  const win = ranked[0];
  const r = Store.getRating(win.id);
  const runners = ranked.slice(1, 4);

  return `
    <div class="gcard">
      <div class="gcard-head">
        <h2>${escapeHtml(genre)}</h2>
        <span class="gcard-count">${ranked.length} of ${totalInGenre} rated</span>
      </div>

      <div class="gwin">
        <div class="gwin-poster">${posterInner(win)}</div>
        <div class="gwin-body">
          <span class="gwin-crown">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 7l4.5 3L12 4l4.5 6L21 7l-1.6 11H4.6z"/></svg>
            Best ${escapeHtml(genre)}
          </span>
          <h3>${escapeHtml(win.title)}</h3>
          <div class="gwin-meta">${escapeHtml(metaLine(win))}</div>
          <div class="gwin-score" style="color:${ratingColor(r)}">${fmtRating(r)}<small>/10</small></div>
        </div>
      </div>

      ${runners.length ? `
        <div class="grunners">
          ${runners.map((m, i) => `
            <div class="grun">
              <span class="r">${i + 2}</span>
              <span class="t">${escapeHtml(m.title)}</span>
              <span class="s" style="color:${ratingColor(Store.getRating(m.id))}">${fmtRating(Store.getRating(m.id))}</span>
            </div>`).join('')}
        </div>` : ''}
    </div>`;
}

function render() {
  renderHeaderStats();

  const genres = allGenres();
  const counts = {};
  genres.forEach(g => { counts[g] = MOVIES.filter(m => m.genres.includes(g)).length; });

  const withWinner = [];
  const withoutWinner = [];

  genres.forEach(g => {
    const ranked = rankedIn(g);
    if (ranked.length) withWinner.push({ g, ranked });
    else withoutWinner.push(g);
  });

  // best genres first, so the strongest picks lead the page
  withWinner.sort((a, b) =>
    Store.getRating(b.ranked[0].id) - Store.getRating(a.ranked[0].id) || a.g.localeCompare(b.g));

  if (!withWinner.length) {
    $$('#gsub').textContent = 'My highest rated film in every genre.';
    content.innerHTML = `
      <div class="needs-ratings">
        <h3>Nothing rated yet</h3>
        <p>This page picks the best film in each of the ${genres.length} genres in your
           library. Rate a few films and it fills itself in.</p>
        <a class="btn btn-primary" href="index.html">Go to the library</a>
      </div>`;
    return;
  }

  $$('#gsub').textContent =
    `My highest rated film in each of ${withWinner.length} genres` +
    (withoutWinner.length ? ` — ${withoutWinner.length} still unrated.` : '.');

  let html = `<div class="genre-grid">
    ${withWinner.map(x => cardHtml(x.g, x.ranked, counts[x.g])).join('')}
  </div>`;

  if (withoutWinner.length) {
    html += `
      <div class="genre-unrated">
        <h3>No ratings yet in these genres</h3>
        <div class="tags">
          ${withoutWinner.map(g =>
            `<span class="tag">${escapeHtml(g)} <span style="opacity:.6">${counts[g]}</span></span>`).join('')}
        </div>
      </div>`;
  }

  content.innerHTML = html;
}

render();

// Posters arrive in the background on a first visit; repaint when they land.
let repaint;
Posters.onResolved(() => {
  clearTimeout(repaint);
  repaint = setTimeout(render, 220);
});
Posters.warm(MOVIES.filter(m => Store.getRating(m.id) !== null));

// Keep in step if ratings change in another tab.
window.addEventListener('storage', e => {
  if (e.key && e.key.startsWith('cinevault.')) location.reload();
});
