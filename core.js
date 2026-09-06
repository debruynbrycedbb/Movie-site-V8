/* ============================================================
   CORE - storage, ratings, poster lookup, shared helpers
   Used by both the library page and the Top 25 page.
   ============================================================ */

const Store = (() => {
  const K_RATINGS   = 'cinevault.ratings.v1';
  const K_POSTERS   = 'cinevault.posters.v1';
  const K_OVERRIDES = 'cinevault.posterOverrides.v1';
  const K_LOCAL     = 'cinevault.localPosters.v1';
  const K_TMDB      = 'cinevault.tmdbKey';
  const K_WATCHES   = 'cinevault.watches.v1';

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('[cinevault] could not read', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[cinevault] could not write', key, e);
      return false;
    }
  }

  /* "There is no image file for this film" is remembered per browsing
     session, not permanently. That stops us re-checking the same missing
     files on every click, while still noticing images you add later -
     a fresh visit looks again. */
  const K_MISS = 'cinevault.noLocalPoster';
  let misses = (() => {
    try { return JSON.parse(sessionStorage.getItem(K_MISS) || '{}'); }
    catch (e) { return {}; }
  })();

  function rememberMiss(id) {
    misses[id] = 1;
    try { sessionStorage.setItem(K_MISS, JSON.stringify(misses)); } catch (e) { /* noop */ }
  }

  // ratings: { [id]: { r: 8.5, t: 1725500000000 } }
  let ratings   = read(K_RATINGS, {});
  let posters   = read(K_POSTERS, {});
  let overrides = read(K_OVERRIDES, {});
  let local     = read(K_LOCAL, {});
  // watches: { [id]: ['2026-09-05', '2024-01-12', ...] } newest first
  let watches   = read(K_WATCHES, {});

  return {
    /* ---- ratings ---- */
    getRating(id) {
      const e = ratings[id];
      return e && typeof e.r === 'number' ? e.r : null;
    },
    getRatedAt(id) {
      const e = ratings[id];
      return e && e.t ? e.t : 0;
    },
    setRating(id, value) {
      const v = Math.max(0, Math.min(10, Math.round(value * 10) / 10));
      ratings[id] = { r: v, t: Date.now() };
      write(K_RATINGS, ratings);
      return v;
    },
    clearRating(id) {
      delete ratings[id];
      write(K_RATINGS, ratings);
    },
    allRatings() { return ratings; },
    ratedCount() { return Object.keys(ratings).length; },
    averageRating() {
      const vals = Object.values(ratings).map(e => e.r).filter(n => typeof n === 'number');
      if (!vals.length) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    },

    /* ---- watch history ---- */
    getWatches(id) { return (watches[id] || []).slice(); },
    watchCount(id) { return (watches[id] || []).length; },
    lastWatch(id) {
      const list = watches[id];
      return list && list.length ? list[0] : null;
    },
    addWatch(id, date) {
      const list = watches[id] ? watches[id].slice() : [];
      if (list.indexOf(date) !== -1) return false;      // already logged that day
      list.push(date);
      list.sort().reverse();                            // ISO dates sort as strings
      watches[id] = list;
      write(K_WATCHES, watches);
      return true;
    },
    removeWatch(id, date) {
      const list = watches[id];
      if (!list) return;
      const i = list.indexOf(date);
      if (i === -1) return;
      list.splice(i, 1);
      if (list.length) watches[id] = list; else delete watches[id];
      write(K_WATCHES, watches);
    },
    clearWatches(id) {
      delete watches[id];
      write(K_WATCHES, watches);
    },
    totalWatches() {
      return Object.values(watches).reduce((n, l) => n + l.length, 0);
    },
    filmsWatchedMoreThanOnce() {
      return Object.values(watches).filter(l => l.length > 1).length;
    },

    /* ---- posters ---- */
    // the image Wikipedia found for this film
    getWikiPoster(id) { return posters[id] || null; },
    hasPosterResult(id) { return posters[id] !== undefined; },
    setPosterBatch(map) { Object.assign(posters, map); write(K_POSTERS, posters); },

    // your own file in the images/ folder, once we've confirmed it exists
    getLocalPoster(id) { return local[id] || null; },
    setLocalPoster(id, path) {
      if (local[id] === path) return;
      local[id] = path;
      write(K_LOCAL, local);
    },
    noLocalPoster(id) { return misses[id] === 1; },
    markNoLocalPoster: rememberMiss,

    /* Your TMDB key, if you'd rather keep it out of the repo.
       Lives in this browser only, like your ratings. */
    getTmdbKey() {
      try { return localStorage.getItem(K_TMDB) || ''; } catch (e) { return ''; }
    },
    setTmdbKey(key) {
      try {
        if (key) localStorage.setItem(K_TMDB, key);
        else localStorage.removeItem(K_TMDB);
      } catch (e) { /* noop */ }
    },

    // a URL you typed in by hand - beats everything else
    getOverride(id) { return overrides[id] || ''; },
    setOverride(id, url) {
      if (url) overrides[id] = url; else delete overrides[id];
      write(K_OVERRIDES, overrides);
    },

    /** Whatever we'd show right now, without probing. */
    getPoster(id) { return overrides[id] || local[id] || posters[id] || null; },

    clearPosterCache() {
      posters = {};
      local = {};
      misses = {};
      write(K_POSTERS, posters);
      write(K_LOCAL, local);
      try { sessionStorage.removeItem(K_MISS); } catch (e) { /* noop */ }
    },

    /* ---- backup ---- */
    exportData() {
      return {
        app: 'cinevault',
        version: 2,
        exportedAt: new Date().toISOString(),
        ratings,
        watches,
        posterOverrides: overrides
      };
    },
    importData(obj, mode) {
      if (!obj || typeof obj !== 'object' || (!obj.ratings && !obj.watches)) {
        throw new Error('That file does not look like a CineVault backup.');
      }
      obj.ratings = obj.ratings || {};
      const incoming = obj.ratings;
      let added = 0;
      if (mode === 'replace') {
        ratings = {};
      }
      for (const [id, entry] of Object.entries(incoming)) {
        const r = typeof entry === 'number' ? entry : (entry && entry.r);
        if (typeof r !== 'number' || isNaN(r)) continue;
        const t = (entry && entry.t) || Date.now();
        // on merge, the newer rating wins
        if (mode === 'merge' && ratings[id] && ratings[id].t > t) continue;
        ratings[id] = { r: Math.max(0, Math.min(10, r)), t };
        added++;
      }
      write(K_RATINGS, ratings);

      // Watch dates merge as a union - a date logged on either device is kept.
      let dates = 0;
      if (obj.watches && typeof obj.watches === 'object') {
        if (mode === 'replace') watches = {};
        for (const [id, list] of Object.entries(obj.watches)) {
          if (!Array.isArray(list)) continue;
          const merged = new Set(watches[id] || []);
          list.forEach(d => {
            if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
              if (!merged.has(d)) dates++;
              merged.add(d);
            }
          });
          if (merged.size) watches[id] = [...merged].sort().reverse();
        }
        write(K_WATCHES, watches);
      }

      if (obj.posterOverrides && typeof obj.posterOverrides === 'object') {
        Object.assign(overrides, obj.posterOverrides);
        write(K_OVERRIDES, overrides);
      }
      return { ratings: added, dates };
    }
  };
})();


/* ============================================================
   POSTERS

   Tries each source named in CONFIG.posterSources, in order, and
   keeps the first image it gets back:

     'tmdb'       The Movie Database. Best coverage and the
                  sharpest artwork, but needs a free API key.
                  Put it in CONFIG.tmdbApiKey or paste it into
                  Settings on the site.
     'wikipedia'  Wikipedia's REST summary endpoint. No key, no
                  sign-up, but a lower hit rate and softer images.

   A film with no image anywhere is remembered as "none found" so
   we don't ask again. A request that FAILED (offline, blocked,
   rate limited) is not remembered, so it retries next visit.

   Settings -> Test poster sources runs one lookup against each
   source and reports exactly what came back.
   ============================================================ */

const Posters = (() => {
  const listeners = new Set();
  const errors = [];               // recent failures, for diagnostics
  let progress = { done: 0, total: 0, found: 0, running: false };

  function notify(id, url) {
    listeners.forEach(fn => { try { fn(id, url); } catch (e) { /* noop */ } });
  }

  function logError(source, msg) {
    errors.push({ source, msg, at: Date.now() });
    if (errors.length > 40) errors.shift();
  }

  /** fetch with a timeout, so one dead request can't stall the queue. */
  async function get(url, ms) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), ms || 12000) : null;
    try {
      const res = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  function tmdbKey() {
    return (Store.getTmdbKey() || CONFIG.tmdbApiKey || '').trim();
  }

  /* ---------- source: TMDB ---------- */

  async function fromTmdb(movie) {
    const key = tmdbKey();
    if (!key) return { url: '', skipped: 'no API key set' };

    const params = new URLSearchParams({
      api_key: key,
      query: movie.title,
      include_adult: 'false'
    });
    if (movie.year) params.set('year', String(movie.year));

    let data = await get('https://api.themoviedb.org/3/search/movie?' + params);

    // Nothing for that exact year? Try again without the year filter -
    // release years differ by country and our list may be a year off.
    if ((!data.results || !data.results.length) && movie.year) {
      params.delete('year');
      data = await get('https://api.themoviedb.org/3/search/movie?' + params);
    }

    const results = (data.results || []).filter(r => r.poster_path);
    if (!results.length) return { url: '' };

    // Prefer a result whose release year is within a year of ours,
    // otherwise take TMDB's own top match.
    let best = results[0];
    if (movie.year) {
      const close = results.find(r => {
        const y = parseInt((r.release_date || '').slice(0, 4), 10);
        return y && Math.abs(y - movie.year) <= 1;
      });
      if (close) best = close;
    }
    return { url: 'https://image.tmdb.org/t/p/w500' + best.poster_path };
  }

  /* ---------- source: Wikipedia ---------- */

  async function fromWikipedia(movie) {
    const title = encodeURIComponent((movie.wiki || movie.title).replace(/ /g, '_'));
    const data = await get(
      'https://en.wikipedia.org/api/rest_v1/page/summary/' + title +
      '?redirect=true'
    );

    // Disambiguation pages have no useful image.
    if (data.type && data.type.indexOf('disambiguation') !== -1) return { url: '' };

    let url = '';
    if (data.originalimage && data.originalimage.source) {
      url = data.originalimage.source;
    } else if (data.thumbnail && data.thumbnail.source) {
      url = data.thumbnail.source;
    }
    if (!url) return { url: '' };

    // Ask for a wider rendering of the same file where we can.
    url = url.replace(/\/(\d+)px-/, (match, w) => (+w < 400 ? '/400px-' : match));

    // Skip obvious non-posters (logos, icons, maps).
    if (/\.svg$/i.test(url)) return { url: '' };

    return { url };
  }

  const SOURCES = { tmdb: fromTmdb, wikipedia: fromWikipedia };

  /** Try every configured source for one film. */
  async function resolveOne(movie) {
    let failed = false;

    for (const name of CONFIG.posterSources) {
      const fn = SOURCES[name];
      if (!fn) continue;
      try {
        const out = await fn(movie);
        if (out.url) return { url: out.url, source: name };
        // a clean "nothing found" - move on to the next source
      } catch (e) {
        failed = true;
        logError(name, movie.title + ': ' + (e.message || e));
      }
    }
    // failed === true means we never got a clean answer, so don't
    // cache this as "no poster exists" - let it try again later.
    return { url: '', failed };
  }

  /* ---------- the queue ---------- */

  async function runQueue(todo, concurrency) {
    let next = 0;
    let buffer = {};                 // batch the writes to localStorage
    progress = { done: 0, total: todo.length, found: 0, running: true };

    function flush() {
      if (Object.keys(buffer).length) {
        Store.setPosterBatch(buffer);
        buffer = {};
      }
    }

    async function worker() {
      while (next < todo.length) {
        const movie = todo[next++];
        const out = await resolveOne(movie);

        // Only record a result we actually trust. A request that failed
        // outright is left uncached so it gets another go next visit.
        if (out.url || !out.failed) buffer[movie.id] = out.url;

        if (out.url) progress.found++;
        progress.done++;
        notify(movie.id, out.url);

        if (progress.done % 8 === 0 || progress.done === todo.length) {
          flush();
          document.dispatchEvent(new CustomEvent('posterprogress', { detail: { ...progress } }));
        }
      }
    }

    const workers = [];
    for (let i = 0; i < Math.min(concurrency, todo.length); i++) workers.push(worker());
    await Promise.all(workers);
    flush();

    progress.running = false;
    document.dispatchEvent(new CustomEvent('posterprogress', { detail: { ...progress } }));
    return { fetched: todo.length, found: progress.found };
  }

  return {
    onResolved(fn) { listeners.add(fn); },
    getProgress() { return { ...progress }; },
    getErrors() { return errors.slice(); },
    activeSources() {
      return CONFIG.posterSources.filter(n => n !== 'tmdb' || tmdbKey());
    },
    hasTmdbKey() { return !!tmdbKey(); },

    /** Look up every film we don't have a cached answer for. */
    async warm(movies) {
      if (!CONFIG.posterSources || !CONFIG.posterSources.length) {
        return { fetched: 0, found: 0 };
      }
      const todo = movies.filter(m => !Store.hasPosterResult(m.id));
      if (!todo.length) return { fetched: 0, found: 0 };
      return runQueue(todo, CONFIG.lookupConcurrency || 4);
    },

    /** One lookup per source, reporting exactly what happened. */
    async test(movie) {
      const subject = movie || MOVIES.find(m => m.title === 'Inception') || MOVIES[0];
      const out = [];

      for (const name of CONFIG.posterSources) {
        const fn = SOURCES[name];
        if (!fn) { out.push({ source: name, state: 'unknown', detail: 'no such source' }); continue; }

        const started = Date.now();
        try {
          const r = await fn(subject);
          const ms = Date.now() - started;
          if (r.skipped)      out.push({ source: name, state: 'skipped', detail: r.skipped });
          else if (r.url)     out.push({ source: name, state: 'ok', detail: r.url, ms });
          else                out.push({ source: name, state: 'empty', detail: 'reached, but no image for this film', ms });
        } catch (e) {
          const msg = String(e.message || e);
          out.push({
            source: name,
            state: 'error',
            detail: /Failed to fetch|NetworkError|load failed/i.test(msg)
              ? 'blocked or unreachable (CORS, offline, or an extension is blocking it)'
              : msg
          });
        }
      }
      return { movie: subject, results: out };
    }
  };
})();


/* ============================================================
   SHARED HELPERS
   ============================================================ */

const MOVIE_BY_ID = Object.fromEntries((window.MOVIES || []).map(m => [m.id, m]));

/** Colour for a score, so a 9.4 reads differently from a 4.1 at a glance. */
function ratingColor(r) {
  if (r === null || r === undefined) return 'var(--dim)';
  if (r >= 9)   return '#ffd76e';
  if (r >= 8)   return '#5ee0ff';
  if (r >= 7)   return '#63e6a4';
  if (r >= 5.5) return '#c9d158';
  if (r >= 4)   return '#f0a959';
  return '#f06d6d';
}

/** 8 -> "8.0", 8.53 -> "8.5" */
function fmtRating(r) {
  return (Math.round(r * 10) / 10).toFixed(1);
}

/** Year 0 means the line didn't give one. */
function fmtYear(y) { return y ? String(y) : '—'; }

function fmtRuntime(min) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function decadeOf(year) { return Math.floor(year / 10) * 10; }

/* ---------- dates ----------
   Watch dates are plain 'YYYY-MM-DD' strings in your local calendar.
   They're deliberately not timestamps: "I watched it on the 5th" shouldn't
   drift to the 4th because of a timezone. */

function todayISO() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

/** Parse as a LOCAL date - new Date('2026-09-05') would be UTC midnight. */
function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtDate(iso) {
  try {
    return parseISO(iso).toLocaleDateString(undefined,
      { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return iso; }
}

/** "Today", "Yesterday", "3 weeks ago", "2 years ago" */
function relDate(iso) {
  const days = Math.round((parseISO(todayISO()) - parseISO(iso)) / 86400000);
  if (days < 0)  return 'in the future';
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7)   return days + ' days ago';
  if (days < 31)  { const w = Math.round(days / 7);   return w + (w === 1 ? ' week ago'  : ' weeks ago'); }
  if (days < 365) { const m = Math.round(days / 30.4); return m + (m === 1 ? ' month ago' : ' months ago'); }
  const y = Math.floor(days / 365.25);
  const rem = days - y * 365.25;
  if (y === 1 && rem < 60) return 'a year ago';
  return y + (y === 1 ? ' year ago' : ' years ago');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ------------------------------------------------------------
   Where a poster comes from, in order of preference:

     1. a URL you typed into the film's "set it manually" box
     2. your own image file in the images/ folder of the repo
     3. the poster Wikipedia found automatically
     4. a plain gradient tile with the title on it

   Your own files always win, so you can override any film just
   by dropping images/<filename>.jpg into the repo.
   ------------------------------------------------------------ */

function posterCandidates(movie) {
  const list = [];

  const override = Store.getOverride(movie.id);
  if (override) list.push(override);

  if (CONFIG.useLocalImages) {
    // A file that worked before is remembered, so we stop probing for it.
    const known = Store.getLocalPoster(movie.id);
    if (known) {
      list.push(known);
    } else if (!Store.noLocalPoster(movie.id)) {
      CONFIG.imageExtensions.forEach(ext => {
        list.push(`${CONFIG.imageFolder}/${movie.id}.${ext}`);
      });
    }
  }

  const wiki = Store.getWikiPoster(movie.id);
  if (wiki) list.push(wiki);

  return list;
}

function fallbackTile(movie) {
  return `<div class="poster-fallback">
            <div class="pf-title">${escapeHtml(movie.title)}</div>
            <div class="pf-year">${fmtYear(movie.year)}</div>
          </div>`;
}

/** Build the poster element for a movie (image, or a styled fallback). */
function posterInner(movie) {
  const list = posterCandidates(movie);
  if (!list.length) return fallbackTile(movie);
  return `<img src="${escapeHtml(list[0])}" data-pid="${movie.id}" data-pi="0"
               alt="" loading="lazy"
               onload="posterLoaded(this)" onerror="posterFailed(this)">`;
}

/** An image loaded - remember it if it was one of your own files. */
function posterLoaded(img) {
  img.classList.add('loaded');
  const src = img.getAttribute('src');
  if (CONFIG.useLocalImages && src.startsWith(CONFIG.imageFolder + '/')) {
    Store.setLocalPoster(img.dataset.pid, src);
  }
}

/** That source 404'd - try the next one, or give up and show the tile. */
function posterFailed(img) {
  const movie = MOVIE_BY_ID[img.dataset.pid];
  if (!movie) return;

  const list = posterCandidates(movie);
  const next = +img.dataset.pi + 1;
  const isLocal = s => s && s.indexOf(CONFIG.imageFolder + '/') === 0;

  // If that was the last images/ candidate, note that this film has no file
  // of yours so we stop checking for the rest of the session.
  if (isLocal(list[+img.dataset.pi]) && !isLocal(list[next])) {
    Store.markNoLocalPoster(movie.id);
  }

  if (next < list.length) {
    img.dataset.pi = next;
    img.src = list[next];
    return;
  }
  img.insertAdjacentHTML('afterend', fallbackTile(movie));
  img.remove();
}

/** Small transient message at the bottom of the screen. */
let toastTimer;
function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/** Fill in the counters that sit in the site header. */
function renderHeaderStats() {
  const total = window.MOVIES.length;
  const rated = Store.ratedCount();
  const avg = Store.averageRating();

  const set = (sel, val) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = val;
  };
  set('[data-stat=total]', total);
  set('[data-stat=rated]', rated);
  set('[data-stat=avg]', avg === null ? '--' : fmtRating(avg));
}
