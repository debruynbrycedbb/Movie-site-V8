/* ============================================================
   LIBRARY PAGE
   ============================================================ */

const state = {
  q: '',
  genre: '',
  decade: '',
  status: 'all',
  sort: 'rating',
  dir: 'desc'
};

let visible = [];      // the currently displayed (filtered + sorted) list
let openIndex = -1;    // which film the modal is showing

const $ = sel => document.querySelector(sel);
const grid = $('#grid');

/* ---------- populate the filter dropdowns ---------- */

function buildFilters() {
  const genres = new Set();
  const decades = new Set();
  MOVIES.forEach(m => {
    m.genres.forEach(g => genres.add(g));
    if (m.year) decades.add(decadeOf(m.year));
  });

  const gSel = $('#genre');
  [...genres].sort().forEach(g => {
    const o = document.createElement('option');
    o.value = g; o.textContent = g;
    gSel.appendChild(o);
  });

  const dSel = $('#decade');
  [...decades].sort((a, b) => b - a).forEach(d => {
    const o = document.createElement('option');
    o.value = d; o.textContent = d + 's';
    dSel.appendChild(o);
  });
}

/* ---------- filter + sort ---------- */

function compute() {
  const q = state.q.trim().toLowerCase();

  let list = MOVIES.filter(m => {
    if (state.genre && !m.genres.includes(state.genre)) return false;
    if (state.decade && decadeOf(m.year) !== +state.decade) return false;

    const rating = Store.getRating(m.id);
    if (state.status === 'rated' && rating === null) return false;
    if (state.status === 'unrated' && rating !== null) return false;

    if (q) {
      const hay = (m.title + ' ' + m.director + ' ' + m.genres.join(' ') + ' ' + m.year).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sign = state.dir === 'asc' ? 1 : -1;

  list.sort((a, b) => {
    let d = 0;
    switch (state.sort) {
      case 'title':
        // ignore a leading article so "The Matrix" files under M
        d = stripArticle(a.title).localeCompare(stripArticle(b.title));
        return d * sign;
      case 'year':
        d = a.year - b.year; break;
      case 'runtime':
        d = a.runtime - b.runtime; break;
      case 'added':
        d = a.order - b.order; break;
      case 'recent':
        d = Store.getRatedAt(a.id) - Store.getRatedAt(b.id); break;
      case 'lastwatch': {
        // films with no logged date sink to the bottom either way
        const la = Store.lastWatch(a.id);
        const lb = Store.lastWatch(b.id);
        if (!la && !lb) return a.order - b.order;
        if (!la) return 1;
        if (!lb) return -1;
        d = la < lb ? -1 : (la > lb ? 1 : 0);
        break;
      }
      case 'watchcount': {
        const ca = Store.watchCount(a.id);
        const cb = Store.watchCount(b.id);
        if (!ca && !cb) return a.order - b.order;
        if (!ca) return 1;
        if (!cb) return -1;
        d = ca - cb;
        break;
      }
      case 'rating':
      default: {
        const ra = Store.getRating(a.id);
        const rb = Store.getRating(b.id);
        // unrated films always sink to the bottom, whichever direction
        if (ra === null && rb === null) return a.order - b.order;
        if (ra === null) return 1;
        if (rb === null) return -1;
        d = ra - rb;
        break;
      }
    }
    if (d === 0) return stripArticle(a.title).localeCompare(stripArticle(b.title));
    return d * sign;
  });

  return list;
}

function stripArticle(t) {
  return t.replace(/^(the|a|an)\s+/i, '').toLowerCase();
}

/* ---------- render ---------- */

function render() {
  visible = compute();

  $('#count').textContent = visible.length === MOVIES.length
    ? `${MOVIES.length} films`
    : `${visible.length} of ${MOVIES.length} films`;

  const dirty = state.q || state.genre || state.decade || state.status !== 'all';
  $('#resetBtn').hidden = !dirty;

  if (!visible.length) {
    grid.innerHTML = `
      <div class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
        </svg>
        <h3>No films match</h3>
        <p>Try a different search or clear the filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = visible.map(cardHtml).join('');
}

function cardHtml(m, i) {
  const r = Store.getRating(m.id);
  const chip = r === null
    ? `<span class="chip unrated">Rate</span>`
    : `<span class="chip" style="color:${ratingColor(r)}">${fmtRating(r)}</span>`;

  const rt = fmtRuntime(m.runtime);
  const bits = [];
  if (m.year) bits.push(String(m.year));
  if (rt) bits.push(rt);

  // a small ×N marker for anything watched more than once
  const wc = Store.watchCount(m.id);
  if (wc > 1) {
    bits.push(`<span class="rewatch" title="Watched ${wc} times">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>
      ${wc}</span>`);
  }

  return `
    <button class="card" data-id="${m.id}" data-i="${i}">
      <div class="poster">
        ${posterInner(m)}
        <div class="poster-shade"></div>
        <div class="poster-cta">${r === null ? 'Rate it' : 'Edit rating'}</div>
        ${chip}
      </div>
      <div class="meta">
        <h3>${escapeHtml(m.title)}</h3>
        <div class="meta-line">${bits.join(' <span class="dot">·</span> ')}</div>
        <div class="meta-genre">${escapeHtml(m.genres.slice(0, 2).join(', '))}</div>
      </div>
    </button>`;
}

/* Repaint one card in place - avoids re-rendering the whole grid
   (and losing scroll position) after a single rating change. */
function refreshCard(id) {
  const el = grid.querySelector(`.card[data-id="${id}"]`);
  if (!el) return;
  const i = visible.findIndex(m => m.id === id);
  if (i === -1) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = cardHtml(visible[i], i);
  el.replaceWith(tmp.firstElementChild);
}

/* ---------- modal ---------- */

const overlay = $('#overlay');

function openModal(index) {
  if (index < 0 || index >= visible.length) return;
  openIndex = index;
  const m = visible[index];
  const r = Store.getRating(m.id);

  $('#mTitle').textContent = m.title;

  const parts = [];
  if (m.year) parts.push(String(m.year));
  if (m.director) parts.push(m.director);
  const rt = fmtRuntime(m.runtime);
  if (rt) parts.push(rt);
  $('#mSub').innerHTML = parts.map(escapeHtml).join('<span class="dot">·</span>');

  $('#mTags').innerHTML = m.genres.map(g => `<span class="tag">${escapeHtml(g)}</span>`).join('');
  $('#mPoster').innerHTML = posterInner(m);
  $('#mPosterUrl').value = Store.getOverride(m.id);
  $('#mFilename').textContent = `${CONFIG.imageFolder}/${m.id}.jpg`;

  setValue(r === null ? null : r, false);
  renderWatches(m);

  $('#mPrev').disabled = index === 0;
  $('#mNext').disabled = index === visible.length - 1;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  $('#mSlider').focus();
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  openIndex = -1;
}

/** Update the big number, slider, input and accent colour together. */
function setValue(v, markDirty) {
  const valEl = $('#mValue');
  const slider = $('#mSlider');
  const num = $('#mNum');

  if (v === null) {
    valEl.className = 'rate-value none';
    valEl.innerHTML = '--<small>/10</small>';
    slider.value = 0;
    num.value = '';
    paint(null);
  } else {
    valEl.className = 'rate-value';
    valEl.style.color = ratingColor(v);
    valEl.innerHTML = `${fmtRating(v)}<small>/10</small>`;
    slider.value = v;
    num.value = fmtRating(v);
    paint(v);
  }
  if (markDirty) $('#mSaved').classList.remove('show');
}

/* ---------- watch history ---------- */

function renderWatches(m) {
  const dates = Store.getWatches(m.id);
  const list = $('#mWatchList');
  const summary = $('#mWatchSummary');

  // the date box defaults to today, and can't be set in the future
  const today = todayISO();
  $('#mWatchDate').max = today;
  $('#mWatchDate').value = today;

  if (!dates.length) {
    summary.className = 'watch-summary none';
    summary.textContent = 'Never logged';
    list.innerHTML = `<li class="watch-empty" style="border:0">
        Log the days you've seen this. Add as many as you like — every rewatch
        gets its own entry.
      </li>`;
    return;
  }

  summary.className = 'watch-summary';
  summary.innerHTML = dates.length === 1
    ? `Seen <b>once</b> · ${escapeHtml(relDate(dates[0]))}`
    : `Seen <b>${dates.length}</b> times · last ${escapeHtml(relDate(dates[0]))}`;

  // newest first, numbered from the most recent viewing downwards
  list.innerHTML = dates.map((d, i) => `
    <li class="${i === 0 ? 'latest' : ''}">
      <span class="wn">${dates.length - i}</span>
      <span class="wd">${escapeHtml(fmtDate(d))}</span>
      <span class="wr">${escapeHtml(relDate(d))}</span>
      <button class="wx" data-date="${d}" title="Remove this date" aria-label="Remove ${escapeHtml(fmtDate(d))}">&times;</button>
    </li>`).join('');
}

function addWatch(date) {
  if (openIndex === -1) return;
  const m = visible[openIndex];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast('Pick a date first'); return; }
  if (date > todayISO()) { toast("That date hasn't happened yet"); return; }

  if (!Store.addWatch(m.id, date)) {
    toast('That date is already logged');
    return;
  }
  renderWatches(m);
  refreshCard(m.id);
  toast(`Logged ${fmtDate(date)}`);
}

/** Keep the accent colour and the slider's filled track in step. */
function paint(v) {
  const c = v === null ? 'var(--accent)' : ratingColor(v);
  document.documentElement.style.setProperty('--rate-color', c);
  $('#mSlider').style.setProperty('--fill', (v === null ? 0 : v * 10) + '%');
}

function currentValue() {
  const raw = parseFloat($('#mNum').value);
  if (!isNaN(raw)) return Math.max(0, Math.min(10, raw));
  return parseFloat($('#mSlider').value);
}

function saveRating() {
  if (openIndex === -1) return;
  const m = visible[openIndex];
  const v = Store.setRating(m.id, currentValue());
  setValue(v, false);
  $('#mSaved').classList.add('show');
  refreshCard(m.id);
  renderHeaderStats();
  updateTagline();
}

/* ---------- data panel ---------- */

const dataOverlay = $('#dataOverlay');

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- tagline ---------- */

function updateTagline() {
  const rated = Store.ratedCount();
  const total = MOVIES.length;
  const el = $('#tagline');
  if (!rated) {
    el.textContent = `${total} films watched. Click any poster to rate it out of 10.`;
  } else if (rated < total) {
    el.textContent = `${rated} of ${total} rated — ${total - rated} still to go. Click any poster to rate it.`;
  } else {
    el.textContent = `All ${total} films rated. Nicely done.`;
  }
}

/* ============================================================
   WIRING
   ============================================================ */

function init() {
  buildFilters();
  renderHeaderStats();
  updateTagline();
  render();

  // quick-pick buttons 5 → 10
  $('#mQuick').innerHTML = [5, 6, 7, 7.5, 8, 8.5, 9, 9.5, 10]
    .map(n => `<button data-v="${n}">${n}</button>`).join('');

  /* --- controls --- */
  $('#q').addEventListener('input', e => {
    state.q = e.target.value;
    $('#searchWrap').classList.toggle('has-value', !!state.q);
    render();
  });
  $('#qClear').addEventListener('click', () => {
    state.q = '';
    $('#q').value = '';
    $('#searchWrap').classList.remove('has-value');
    render();
    $('#q').focus();
  });

  $('#genre').addEventListener('change', e => { state.genre = e.target.value; render(); });
  $('#decade').addEventListener('change', e => { state.decade = e.target.value; render(); });
  $('#sort').addEventListener('change', e => {
    state.sort = e.target.value;
    // sensible default direction per sort mode
    state.dir = (state.sort === 'title') ? 'asc' : 'desc';
    syncDirBtn();
    render();
  });

  $('#dirBtn').addEventListener('click', () => {
    state.dir = state.dir === 'asc' ? 'desc' : 'asc';
    syncDirBtn();
    render();
  });

  $('#statusSeg').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    [...e.currentTarget.children].forEach(c => c.classList.remove('on'));
    b.classList.add('on');
    state.status = b.dataset.status;
    render();
  });

  $('#resetBtn').addEventListener('click', () => {
    state.q = ''; state.genre = ''; state.decade = ''; state.status = 'all';
    $('#q').value = '';
    $('#searchWrap').classList.remove('has-value');
    $('#genre').value = ''; $('#decade').value = '';
    [...$('#statusSeg').children].forEach((c, i) => c.classList.toggle('on', i === 0));
    render();
  });

  /* --- grid --- */
  grid.addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (card) openModal(+card.dataset.i);
  });

  /* --- modal --- */
  $('#mClose').addEventListener('click', closeModal);
  overlay.addEventListener('mousedown', e => { if (e.target === overlay) closeModal(); });

  $('#mSlider').addEventListener('input', e => setValue(parseFloat(e.target.value), true));
  $('#mNum').addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 10) {
      $('#mSlider').value = v;
      $('#mValue').className = 'rate-value';
      $('#mValue').style.color = ratingColor(v);
      $('#mValue').innerHTML = `${fmtRating(v)}<small>/10</small>`;
      paint(v);
      $('#mSaved').classList.remove('show');
    }
  });
  $('#mNum').addEventListener('keydown', e => { if (e.key === 'Enter') saveRating(); });

  $('#mQuick').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    setValue(parseFloat(b.dataset.v), true);
    saveRating();
  });

  $('#mSave').addEventListener('click', saveRating);

  $('#mClear').addEventListener('click', () => {
    if (openIndex === -1) return;
    const m = visible[openIndex];
    Store.clearRating(m.id);
    setValue(null, true);
    refreshCard(m.id);
    renderHeaderStats();
    updateTagline();
    toast('Rating cleared');
  });

  /* --- watch history --- */
  $('#mWatchAdd').addEventListener('click', () => addWatch($('#mWatchDate').value));
  $('#mWatchToday').addEventListener('click', () => addWatch(todayISO()));
  $('#mWatchDate').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addWatch($('#mWatchDate').value); }
  });
  $('#mWatchList').addEventListener('click', e => {
    const btn = e.target.closest('.wx');
    if (!btn || openIndex === -1) return;
    const m = visible[openIndex];
    Store.removeWatch(m.id, btn.dataset.date);
    renderWatches(m);
    refreshCard(m.id);
    toast('Date removed');
  });

  $('#mPrev').addEventListener('click', () => openModal(openIndex - 1));
  $('#mNext').addEventListener('click', () => openModal(openIndex + 1));

  $('#mCopyName').addEventListener('click', async () => {
    const name = $('#mFilename').textContent;
    try {
      await navigator.clipboard.writeText(name);
      toast('Copied ' + name);
    } catch (e) {
      // clipboard API needs https or localhost - fall back to selecting it
      const r = document.createRange();
      r.selectNodeContents($('#mFilename'));
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
      toast('Selected — press Ctrl/Cmd+C');
    }
  });

  $('#mPosterSave').addEventListener('click', () => {
    if (openIndex === -1) return;
    const m = visible[openIndex];
    const url = $('#mPosterUrl').value.trim();
    Store.setOverride(m.id, url);
    $('#mPoster').innerHTML = posterInner(m);
    refreshCard(m.id);
    toast(url ? 'Poster updated' : 'Custom poster removed');
  });

  /* --- keyboard --- */
  document.addEventListener('keydown', e => {
    if (dataOverlay.classList.contains('open') && e.key === 'Escape') {
      dataOverlay.classList.remove('open');
      document.body.style.overflow = '';
      return;
    }
    if (!overlay.classList.contains('open')) {
      // "/" focuses search from anywhere
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        $('#q').focus();
      }
      return;
    }
    if (e.key === 'Escape') closeModal();
    // arrows belong to whatever field has focus (slider, number box, date box)
    const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
    if (e.key === 'ArrowRight' && !typing) openModal(openIndex + 1);
    if (e.key === 'ArrowLeft'  && !typing) openModal(openIndex - 1);
  });

  /* --- data panel --- */
  $('#dataBtn').addEventListener('click', () => {
    dataOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
  const closeData = () => {
    dataOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };
  $('#dClose').addEventListener('click', closeData);
  dataOverlay.addEventListener('mousedown', e => { if (e.target === dataOverlay) closeData(); });

  $('#expBtn').addEventListener('click', () => {
    const stamp = new Date().toISOString().slice(0, 10);
    download(`cinevault-ratings-${stamp}.json`, JSON.stringify(Store.exportData(), null, 2));
    toast('Backup downloaded');
  });

  $('#impBtn').addEventListener('click', () => $('#impFile').click());
  $('#impFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const n = Store.importData(JSON.parse(reader.result), 'merge');
        render();
        renderHeaderStats();
        updateTagline();
        const parts = [`${n.ratings} rating${n.ratings === 1 ? '' : 's'}`];
        if (n.dates) parts.push(`${n.dates} watch date${n.dates === 1 ? '' : 's'}`);
        toast('Imported ' + parts.join(' and '));
        closeData();
      } catch (err) {
        toast(err.message || 'Could not read that file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  $('#refBtn').addEventListener('click', async () => {
    Store.clearPosterCache();
    render();
    closeData();
    const { found, fetched } = await Posters.warm(MOVIES);
    render();
    toast(fetched ? `Found ${found} of ${fetched} posters` : 'Automatic lookup is switched off');
  });

  /* --- TMDB key --- */
  $('#tmdbKey').value = Store.getTmdbKey();
  $('#tmdbSave').addEventListener('click', async () => {
    const key = $('#tmdbKey').value.trim();
    Store.setTmdbKey(key);
    if (!key) { toast('API key removed'); return; }
    toast('Key saved — looking up posters…');
    // Retry every film that previously came up empty.
    Store.clearPosterCache();
    render();
    closeData();
    const { found, fetched } = await Posters.warm(MOVIES);
    render();
    toast(`Found ${found} of ${fetched} posters`);
  });

  /* --- source diagnostics --- */
  $('#testBtn').addEventListener('click', async () => {
    const box = $('#testOut');
    box.hidden = false;
    box.innerHTML = 'Testing…';
    $('#testBtn').disabled = true;

    const { movie, results } = await Posters.test();

    const rows = results.map(r =>
      `<div class="tl">
         <span class="tag-state ${r.state}">${r.state.toUpperCase()}</span>
         <span class="det">${escapeHtml(r.source)} — ${escapeHtml(r.detail)}${r.ms ? ' (' + r.ms + 'ms)' : ''}</span>
       </div>`).join('');

    const ok = results.some(r => r.state === 'ok');
    let note;
    if (ok) {
      note = 'Working. If posters still look sparse, that source simply has no image for those films — add your own to the images folder, or set a TMDB key above.';
    } else if (results.every(r => r.state === 'skipped')) {
      note = 'No source is active. Paste a TMDB key above, or check posterSources in movies.js.';
    } else if (results.some(r => r.state === 'error')) {
      note = 'Something is blocking the request. The usual causes: an ad blocker or privacy extension, a network that filters these domains, or opening the page as a local file instead of over https. Try the live site in a private window with extensions off.';
    } else {
      note = 'The sources answered but had no image for this film. Try the test again after picking a more mainstream title.';
    }

    box.innerHTML = `<div style="color:var(--dim);margin-bottom:8px">Test film: ${escapeHtml(movie.title)}</div>`
                  + rows + `<div class="note">${note}</div>`;
    $('#testBtn').disabled = false;
  });

  $('#wipeBtn').addEventListener('click', () => {
    if (!confirm('Erase every rating and watch date in this browser? This cannot be undone.')) return;
    MOVIES.forEach(m => { Store.clearRating(m.id); Store.clearWatches(m.id); });
    render();
    renderHeaderStats();
    updateTagline();
    closeData();
    toast('All ratings and dates erased');
  });

  syncDirBtn();

  /* --- posters --- */
  // Swap each poster in as it resolves, without rebuilding the grid.
  Posters.onResolved((id, url) => {
    if (!url) return;
    const el = grid.querySelector(`.card[data-id="${id}"] .poster`);
    // Only fill in films still showing the gradient tile - never replace
    // one of your own images with Wikipedia's.
    if (el && !el.querySelector('img')) {
      const fb = el.querySelector('.poster-fallback');
      if (fb) fb.remove();
      el.insertAdjacentHTML('afterbegin', posterInner(MOVIE_BY_ID[id]));
    }
  });
  // Show what the lookup is doing rather than leaving it silent.
  document.addEventListener('posterprogress', e => {
    const { done, total, found, running } = e.detail;
    const box = $('#posterStatus');
    const txt = $('#posterStatusText');
    box.hidden = false;

    if (running) {
      box.classList.remove('done');
      txt.textContent = `Finding posters… ${done} of ${total}`;
      return;
    }
    box.classList.add('done');
    if (found === 0 && total > 0) {
      txt.innerHTML = 'No posters could be found. Open the <b>⬇ menu</b> and run '
                    + '<b>Test poster sources</b> to see why.';
    } else if (found < total) {
      txt.textContent = `Found ${found} of ${total} posters. The rest need an image in your images folder.`;
      setTimeout(() => { box.hidden = true; txt.textContent = ''; }, 9000);
    } else {
      box.hidden = true;
      txt.textContent = '';
    }
  });

  Posters.warm(MOVIES);
}

function syncDirBtn() {
  const btn = $('#dirBtn');
  btn.classList.toggle('asc', state.dir === 'asc');
  const labels = {
    rating:  ['Lowest', 'Highest'],
    title:   ['A → Z', 'Z → A'],
    year:    ['Oldest', 'Newest'],
    runtime: ['Shortest', 'Longest'],
    recent:  ['Oldest', 'Latest'],
    lastwatch:  ['Longest ago', 'Most recent'],
    watchcount: ['Fewest', 'Most'],
    added:   ['First', 'Last']
  };
  const pair = labels[state.sort] || ['Asc', 'Desc'];
  $('#dirLabel').textContent = state.dir === 'asc' ? pair[0] : pair[1];
}

init();
