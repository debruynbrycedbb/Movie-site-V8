/* ============================================================
   STATISTICS

   Two kinds of number live on this page:

   - Time watched counts EVERY film in the library once, whether
     or not you've rated it, plus one extra viewing for each date
     in a film's watch history beyond the first. So the number
     starts at "I've seen all of these once" and grows as you log
     rewatches.

   - Everything else is rating-based and only counts films you
     have actually scored.

   Averages over a group of one or two films are noise, so genres
   and actors need a minimum number of rated films to be ranked.
   The thresholds are right here:
   ============================================================ */

const MIN_DECADE_FILMS = 3;
const MIN_GENRE_FILMS  = 3;
const MIN_ACTOR_FILMS  = 3;

const $$ = sel => document.querySelector(sel);
const content = $$('#content');

/* ---------- helpers ---------- */

const rated = () => MOVIES.filter(m => Store.getRating(m.id) !== null);

function mean(nums) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/** Times you've seen a film: at least once, plus any extra logged dates. */
function viewings(id) {
  return Math.max(1, Store.watchCount(id));
}

/** "1d 4h 30m" - the unit that makes the number legible. */
function fmtDuration(min) {
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = Math.round(min % 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

/** A group of films reduced to {avg, n, films}. */
function group(films) {
  const scores = films.map(m => Store.getRating(m.id));
  return { avg: mean(scores), n: films.length, films };
}

/* ---------- the four questions ---------- */

function byDecade() {
  const buckets = {};
  rated().forEach(m => {
    if (!m.year) return;
    const d = decadeOf(m.year);
    (buckets[d] = buckets[d] || []).push(m);
  });
  return Object.entries(buckets)
    .map(([d, films]) => ({ key: d + 's', sortKey: +d, ...group(films) }))
    .sort((a, b) => b.avg - a.avg || a.sortKey - b.sortKey);
}

function byGenre() {
  const buckets = {};
  rated().forEach(m => m.genres.forEach(g => (buckets[g] = buckets[g] || []).push(m)));
  return Object.entries(buckets)
    .map(([g, films]) => ({ key: g, ...group(films) }))
    .sort((a, b) => b.avg - a.avg || a.key.localeCompare(b.key));
}

function byActor() {
  const buckets = {};
  rated().forEach(m => {
    (window.CAST[m.id] || []).forEach(name => {
      (buckets[name] = buckets[name] || []).push(m);
    });
  });
  return Object.entries(buckets)
    .map(([name, films]) => ({ key: name, ...group(films) }))
    .sort((a, b) => b.avg - a.avg || b.n - a.n || a.key.localeCompare(b.key));
}

function watchTime() {
  let base = 0, extra = 0, unknown = 0;
  MOVIES.forEach(m => {
    if (!m.runtime) { unknown++; return; }
    base += m.runtime;
    extra += m.runtime * (viewings(m.id) - 1);
  });
  return { base, extra, total: base + extra, unknown };
}

/* ---------- rendering ---------- */

/** One horizontal bar. Bars start at zero - a truncated axis would
    exaggerate small differences between averages. */
function barRow(row, isTop, min) {
  const thin = min && row.n < min;
  return `
    <div class="bar-row ${isTop ? 'top' : ''} ${thin ? 'thin' : ''}"
         title="${escapeHtml(row.key)}: ${fmtRating(row.avg)} from ${row.n} rated film${row.n === 1 ? '' : 's'}">
      <div class="bar-name">${escapeHtml(row.key)}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(row.avg / 10 * 100).toFixed(1)}%"></div>
      </div>
      <div class="bar-val">${fmtRating(row.avg)}</div>
      <div class="bar-sub">${row.n} film${row.n === 1 ? '' : 's'}</div>
    </div>`;
}

/** rows must already be sorted; `min` greys out rows too thin to rank. */
function barChart(rows, min) {
  if (!rows.length) return '';
  const topIndex = rows.findIndex(r => !min || r.n >= min);
  return `<div class="bars">${rows.map((r, i) => barRow(r, i === topIndex, min)).join('')}</div>
          <div class="chart-foot">
            <span class="swatch-gold"></span> highest average · bars run from 0 to 10
            ${min ? `· faded rows have fewer than ${min} rated films and aren't ranked` : ''}
          </div>`;
}

function render() {
  renderHeaderStats();

  const R = rated();
  const time = watchTime();
  const rewatches = MOVIES.reduce((n, m) => n + Math.max(0, Store.watchCount(m.id) - 1), 0);
  const overallAvg = mean(R.map(m => Store.getRating(m.id)));

  /* ---- headline tiles ---- */
  let html = `
    <div class="stat-row">
      <div class="tile hero">
        <span class="lbl">Total time spent watching</span>
        <div class="val">${fmtDuration(time.total)}</div>
        <div class="sub">
          ${Math.round(time.total / 60).toLocaleString()} hours across ${MOVIES.length} films,
          counting every film once${time.extra ? ` plus ${rewatches} logged rewatch${rewatches === 1 ? '' : 'es'} (${fmtDuration(time.extra)})` : ''}.
          ${time.unknown ? `${time.unknown} film${time.unknown === 1 ? " has no runtime yet and isn't" : "s have no runtime yet and aren't"} counted.` : ''}
        </div>
      </div>

      <div class="tile">
        <span class="lbl">Films rated</span>
        <div class="val">${R.length}<small>/ ${MOVIES.length}</small></div>
        <div class="sub">${MOVIES.length - R.length} still to score</div>
      </div>

      <div class="tile">
        <span class="lbl">Average rating</span>
        <div class="val" style="color:${R.length ? ratingColor(Math.round(overallAvg * 10) / 10) : 'var(--dim)'}">
          ${R.length ? fmtRating(overallAvg) : '--'}
        </div>
        <div class="sub">across everything you've scored</div>
      </div>

      <div class="tile">
        <span class="lbl">Rewatches logged</span>
        <div class="val">${rewatches}</div>
        <div class="sub">${rewatches ? 'extra viewings on top of the first' : 'log dates on a film to track these'}</div>
      </div>
    </div>`;

  /* ---- nothing rated yet ---- */
  if (!R.length) {
    html += `
      <div class="needs-ratings">
        <h3>Rate some films to unlock the rest</h3>
        <p>Your best decade, genre and actors are all worked out from the scores you
           give. The time above already counts your whole library, so that part
           works from day one.</p>
        <a class="btn btn-primary" href="index.html">Go to the library</a>
      </div>`;
    content.innerHTML = html;
    return;
  }

  /* ---- decade ---- */
  const decades = byDecade();
  const thinDecades = decades.filter(d => d.n < MIN_DECADE_FILMS);
  html += `
    <div class="section">
      <div class="section-head"><h2>Best decade</h2></div>
      <p class="note">
        Average of your ratings for the films you've scored from each decade. A decade needs at
        least ${MIN_DECADE_FILMS} rated films to take the top spot${thinDecades.length
          ? `, which rules out ${thinDecades.map(d => escapeHtml(d.key)).join(', ')} for now` : ''}.
      </p>
      ${barChart(decades, MIN_DECADE_FILMS)}
    </div>`;

  /* ---- genre ---- */
  const genresAll = byGenre();
  const genres = genresAll.filter(g => g.n >= MIN_GENRE_FILMS);
  const thinGenres = genresAll.filter(g => g.n < MIN_GENRE_FILMS);
  html += `
    <div class="section">
      <div class="section-head"><h2>Best genre</h2></div>
      <p class="note">
        Genres need at least ${MIN_GENRE_FILMS} rated films to be ranked — one 10/10 shouldn't
        crown a genre. Films count towards every genre they carry.
        ${thinGenres.length ? `${thinGenres.length} genre${thinGenres.length === 1 ? '' : 's'} below the threshold: ` +
          thinGenres.map(g => escapeHtml(g.key)).join(', ') + '.' : ''}
      </p>
      ${genres.length
        ? barChart(genres, 0)
        : `<p class="note">No genre has ${MIN_GENRE_FILMS} rated films yet.</p>`}
    </div>`;

  /* ---- actors ---- */
  const actorsAll = byActor();
  const actors = actorsAll.filter(a => a.n >= MIN_ACTOR_FILMS).slice(0, 15);
  html += `
    <div class="section">
      <div class="section-head"><h2>Top actors</h2></div>
      <p class="note">
        Ranked by the average of your ratings for their films, counting only actors with at
        least ${MIN_ACTOR_FILMS} rated films. Based on the billed leads of each film, not the full cast.
      </p>
      ${actors.length ? `
        <div class="actor-list">
          ${actors.map((a, i) => `
            <div class="actor ${i === 0 ? 'top' : ''}">
              <div class="rk">${String(i + 1).padStart(2, '0')}</div>
              <div>
                <div class="nm">${escapeHtml(a.key)}</div>
                <div class="films">${a.n} films · ${escapeHtml(
                  a.films.slice()
                    .sort((x, y) => Store.getRating(y.id) - Store.getRating(x.id))
                    .slice(0, 3).map(m => m.title).join(', ')
                )}${a.n > 3 ? ' …' : ''}</div>
              </div>
              <div class="track"><i style="width:${(a.avg / 10 * 100).toFixed(1)}%"></i></div>
              <div class="sc" style="color:${ratingColor(a.avg)}">${fmtRating(a.avg)}</div>
            </div>`).join('')}
        </div>
        <div class="chart-foot"><span class="swatch-gold"></span> highest average · bars run from 0 to 10</div>`
        : `<p class="note">No actor has ${MIN_ACTOR_FILMS} rated films yet. Keep rating and they'll appear.</p>`}
    </div>`;

  content.innerHTML = html;
}

render();

window.addEventListener('storage', e => {
  if (e.key && e.key.startsWith('cinevault.')) location.reload();
});
