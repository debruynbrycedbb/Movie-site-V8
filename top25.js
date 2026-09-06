/* ============================================================
   TOP 25 PAGE
   Ranks whatever you have rated, highest first. Ties are broken
   by the older rating first (you committed to it earlier).
   ============================================================ */

const $$ = sel => document.querySelector(sel);
const content = $$('#content');
let scope = '';

function ranked() {
  return MOVIES
    .filter(m => Store.getRating(m.id) !== null)
    .filter(m => !scope || m.genres.includes(scope))
    .sort((a, b) => {
      const d = Store.getRating(b.id) - Store.getRating(a.id);
      if (d !== 0) return d;
      const t = Store.getRatedAt(a.id) - Store.getRatedAt(b.id);
      if (t !== 0) return t;
      return a.title.localeCompare(b.title);
    });
}

function buildScope() {
  const counts = {};
  MOVIES.forEach(m => {
    if (Store.getRating(m.id) === null) return;
    m.genres.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
  });
  const sel = $$('#scopeSel');
  const current = sel.value;
  sel.innerHTML = '<option value="">All genres</option>';
  Object.keys(counts).sort().forEach(g => {
    const o = document.createElement('option');
    o.value = g;
    o.textContent = `${g} (${counts[g]})`;
    sel.appendChild(o);
  });
  sel.value = current;
}

const posterHtml = posterInner;

function metaLine(m) {
  const bits = [];
  if (m.year) bits.push(String(m.year));
  if (m.genres[0]) bits.push(m.genres[0]);
  const rt = fmtRuntime(m.runtime);
  if (rt) bits.push(rt);
  return bits.join(' · ');
}

function render() {
  const list = ranked();
  const top = list.slice(0, 25);

  /* ---- readout ---- */
  const avg = list.length
    ? list.reduce((a, m) => a + Store.getRating(m.id), 0) / list.length
    : null;
  $$('#roRated').textContent = list.length;
  $$('#roAvg').textContent   = avg === null ? '--' : fmtRating(avg);
  $$('#roTop').textContent   = top.length ? fmtRating(Store.getRating(top[0].id)) : '--';
  $$('#roCut').textContent   = top.length === 25 ? fmtRating(Store.getRating(top[24].id)) : '--';

  $$('#heroSub').textContent = scope
    ? `The highest rated ${scope.toLowerCase()} films in the vault`
    : 'The highest rated films in the vault';

  /* ---- empty ---- */
  if (!list.length) {
    content.innerHTML = `
      <div class="t25-empty">
        <div class="glyph">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l2.9 6.3 6.6.8-4.9 4.6 1.3 6.8L12 17.3 6.1 20.5l1.3-6.8L2.5 9.1l6.6-.8z"/>
          </svg>
        </div>
        <h3>${scope ? 'Nothing rated in this genre yet' : 'No ratings yet'}</h3>
        <p>${scope
            ? 'Rate a few ' + escapeHtml(scope.toLowerCase()) + ' films and they will show up here.'
            : 'Your top 25 builds itself from the scores you give. Head to the library, click a poster, and start rating.'}</p>
        <a class="btn btn-primary" href="index.html">Go to the library</a>
      </div>`;
    return;
  }

  /* ---- podium + rows ---- */
  const podium = top.slice(0, 3);
  const rest = top.slice(3);

  let html = `<div class="podium">${podium.map(podHtml).join('')}</div>`;

  if (rest.length) {
    html += `<div class="list-head"><span>Ranks 04 — ${String(top.length).padStart(2, '0')}</span></div>
             <div class="rows">${rest.map((m, i) => rowHtml(m, i + 4)).join('')}</div>`;
  }

  if (list.length < 25) {
    const need = 25 - list.length;
    html += `<p class="partial-note">
               ${list.length} of 25 slots filled — rate ${need} more film${need === 1 ? '' : 's'}
               in the <a href="index.html">library</a> to complete the list
             </p>`;
  }

  content.innerHTML = html;
}

function podHtml(m, i) {
  const rank = i + 1;
  const r = Store.getRating(m.id);
  return `
    <div class="pod" data-rank="${rank}">
      <span class="bracket tl"></span>
      <span class="bracket br"></span>
      <span class="pod-rank">${rank}</span>
      <div class="pod-poster">
        <span class="pod-badge">RANK ${String(rank).padStart(2, '0')}</span>
        ${posterHtml(m)}
      </div>
      <div class="pod-info">
        <h3>${escapeHtml(m.title)}</h3>
        <div class="pod-meta">${escapeHtml(metaLine(m))}</div>
        <div class="pod-score" style="color:${ratingColor(r)}">${fmtRating(r)}<small>/10</small></div>
      </div>
    </div>`;
}

function rowHtml(m, rank) {
  const r = Store.getRating(m.id);
  const c = ratingColor(r);
  return `
    <div class="row" style="--row-color:${c}">
      <div class="row-rank">${String(rank).padStart(2, '0')}</div>
      <div class="row-poster">${posterHtml(m)}</div>
      <div>
        <div class="row-title">${escapeHtml(m.title)}</div>
        <div class="row-meta">${escapeHtml(metaLine(m))}</div>
      </div>
      <div class="row-score">
        <div class="row-bar"><i style="width:${r * 10}%;animation-delay:${(rank - 4) * 24}ms"></i></div>
        <div class="row-num" style="color:${c}">${fmtRating(r)}</div>
      </div>
    </div>`;
}

/* ============================================================
   INIT
   ============================================================ */

renderHeaderStats();
buildScope();
render();

$$('#scopeSel').addEventListener('change', e => {
  scope = e.target.value;
  render();
});

// Posters resolve in the background on a first visit; repaint when they land.
let repaint;
Posters.onResolved(() => {
  clearTimeout(repaint);
  repaint = setTimeout(render, 220);
});
Posters.warm(MOVIES.filter(m => Store.getRating(m.id) !== null));

// If ratings were changed in another tab, keep this page honest.
window.addEventListener('storage', e => {
  if (e.key && e.key.startsWith('cinevault.')) location.reload();
});
