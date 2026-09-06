# Bryce's CineVault

A personal film library — 457 films, rated out of 10, sorted however you like, with an
auto-ranked Top 25.

Pure static HTML/CSS/JS. No build step, no server, no API keys. Every file sits in one
flat folder, so you can upload them all at once to GitHub.

---

## Put it online (GitHub Pages, free)

1. Create a new repository on GitHub. Public is required for free Pages.
2. On the repo page click **Add file → Upload files**.
3. Select the 12 site files (everything ending in .html, .css or .js) and drop them in.
   They all sit at the top level, so nothing can end up in the wrong place.
   The `images/` folder is optional — see **Posters** below.
4. Click **Commit changes**.
5. Go to **Settings → Pages**.
6. Under **Build and deployment → Source** pick **Deploy from a branch**.
7. Set the branch to `main` and the folder to `/ (root)`, then **Save**.
8. Wait about a minute. Your site is live at
   `https://<your-username>.github.io/<repo-name>/`

The files that must be uploaded:

```
index.html            library page (must be there — it's the homepage)
top25.html            Top 25 page
genres.html           best film per genre
stats.html            statistics
styles.css            shared dark theme
top25.css             Top 25 styling
movies.js             your film list + settings
cast.js               lead actors, used by the Stats page only
core.js               storage, ratings, poster lookup
library.js            library page behaviour
top25.js              Top 25 ranking
genres.js             genres page
stats.js              statistics page
POSTER-FILENAMES.txt  what to name your poster images (reference only)
images/               your own poster images go here (optional)
```

---

## How it works

### Rating
Click any poster. A panel opens with a slider and a number box — anything from
**0.0 to 10.0 in 0.1 steps**. Drag the slider, type an exact number, or hit one of the
quick buttons. Ratings save instantly and colour-code themselves (gold ≥ 9, cyan ≥ 8,
green ≥ 7, and down from there).

Use **← / →** or the Previous/Next buttons to move through films without closing the panel.

### Watch history
Every film has a watch log. Open it and use **Watched today**, or pick any past
date and hit **Add** — one entry per viewing, so a film you've seen four times
has four dates. The list shows each date with how long ago it was, newest at the
top, numbered from your first viewing upwards. Click the × on any entry to remove
it. Films you've seen more than once get a small ⟳ count on their card in the grid.

Two sorts come with it: **Last watched** (what you've seen most recently) and
**Times watched** (your most-rewatched films). Anything with no logged date sinks
to the bottom of both.

Dates are stored as plain calendar dates, so "the 5th" stays the 5th regardless of
timezone, and they ride along in your backup file.

### Sorting and filtering
Sort by your rating, title, release year, runtime, most recently rated, or your original
list order, last watched, or times watched — ascending or descending. Filter by genre, by
decade, or by whether you've rated it yet. Search matches titles, directors and genres. Press **/** to jump to the
search box.

### On a phone
The grid drops to three posters per row so you can scan a lot of films at once,
the filter controls collapse into a single horizontally scrolling strip, and the
film panel goes full-screen. Nothing is hidden — genres move to the film's panel
rather than sitting under each poster, since there's no room for them at that width.

### Top 25
Builds itself from your ratings — no manual list to maintain. Top 3 get the podium, ranks
4–25 fill the list below. The **Scope** dropdown re-ranks within a single genre, so you can
pull up your top sci-fi or your top animation.

### Genres
Your highest rated film in each genre, with the next three behind it. Genres you haven't
rated anything in yet are listed at the bottom so you can see what's untouched.

### Statistics
Four things, all worked out live from your ratings:

- **Total time spent watching** — every film in the library counted once, plus one extra
  viewing for each watch date you've logged beyond the first. So it starts from "I've seen
  all of these once" and grows as you log rewatches. Films with no runtime yet sit it out.
- **Best decade** and **best genre** — the average of your ratings within each group.
- **Top actors** — the average of your ratings across an actor's films, from `cast.js`.

Averages over one or two films are noise, so a decade, genre or actor needs at least
**3 rated films** to be ranked. Groups below that show faded and can't take the top spot.
Change the thresholds at the top of `stats.js`.

Bars run from 0 to 10 rather than zooming in on the range in use — that keeps the
differences honestly sized, even though it makes them look small.

---

## ⚠️ Where your ratings live

Ratings are stored in your browser's `localStorage`. That means:

- ✅ They survive closing the tab, restarting the browser, and rebooting.
- ❌ They **do not** sync to your phone or another computer.
- ❌ They **are** lost if you clear your browser's site data.

This is the trade-off for a site with no server and no running costs. To protect them, open
the **⬇ button** in the header and hit **Export** — you get a small `.json` file with every
rating and watch date. **Import** it on another device (or after clearing data) to restore;
ratings take the newer version and watch dates merge together. Worth doing once you've rated
a decent batch.

---

## Posters — using your own images

The site looks for a poster in this order, and stops at the first one it finds:

1. A URL you typed into a film's **"point at an image on the web"** box
2. **Your own file in the `images/` folder** ← the reliable option
3. Whatever Wikipedia's public API turns up automatically
4. A plain gradient tile with the title on it

So anything you put in `images/` wins. Films you skip fall back to the automatic
lookup, which means you can add your own a handful at a time without anything breaking.

### Adding your own images

Name each file after the film's **id**. `POSTER-FILENAMES.txt` lists all 457 of them:

```
images/inception.jpg
images/the-dark-knight.jpg
images/spider-man-2.jpg
```

`.jpg`, `.jpeg`, `.png` and `.webp` all work. Portrait images are best — the slots are
2:3, so roughly 400×600. Keep them under about 200 KB each so the page stays quick.

Don't want to look up the id? Open the film on the site, expand **"Poster wrong or
missing? Fix it"**, and it shows you the exact filename with a Copy button.

### Creating the images folder on GitHub

GitHub's uploader won't let you make a folder directly, but typing a `/` in a filename
does it for you:

1. **Add file → Create new file**
2. Type `images/README.md` in the name box — the moment you type the slash, GitHub
   creates the `images` folder
3. Put anything in the file body, then **Commit changes**
4. Now click into the `images` folder and use **Add file → Upload files**. Everything you
   drop there lands in the right place.

(The zip already contains `images/README.md`, so if you upload by dragging the folder
you can skip this.)

### Where the automatic posters come from

For films you haven't supplied an image for, the site tries each source in
`CONFIG.posterSources` (top of `movies.js`) in order:

| Source | Key needed | Coverage | Quality |
|---|---|---|---|
| `tmdb` | Yes, free | Nearly every film | Sharp, 500px wide |
| `wikipedia` | No | Patchy | Softer, ~300px |

**Getting a TMDB key takes about two minutes and is the single biggest
improvement you can make to how this site looks.** Make an account at
themoviedb.org, go to **Settings → API**, request a key (pick "Developer",
any personal-use description is fine), and copy the **API Key (v3 auth)**
value.

Then either paste it into **Settings → TMDB API key** on the site (stays in
your browser, never committed to the repo), or put it in `movies.js`:

```js
tmdbApiKey: 'your-key-here',
```

Saving the key on the site immediately re-checks every film.

To switch automatic lookup off entirely, once your own images cover
everything:

```js
posterSources: [],
```

The site then never touches the network.

### When posters don't appear

Open **Settings → Test poster sources**. It runs one lookup against each
source and tells you exactly what happened:

- **OK** — the source works. Sparse posters just mean it has no image for
  those particular films; add your own or set a TMDB key.
- **SKIPPED** — no TMDB key set.
- **EMPTY** — the source answered but has nothing for that film.
- **ERROR** — something blocked the request. Usually an ad blocker or
  privacy extension, a network that filters those domains, or opening the
  page as a local file instead of over https. Try the live site in a private
  window with extensions disabled.

While a lookup is running, a progress line under the page title shows how
far it has got.

### If a new image doesn't show up

Hard-refresh with **Ctrl+Shift+R** (**Cmd+Shift+R** on Mac), or use
**Settings → Refresh posters**. The site remembers which files exist so it isn't
checking for missing ones constantly, and that memory clears on a refresh.

---

## Editing the cast list

`cast.js` holds the lead actors for each film and is read by the Statistics page only.
Format matches `movies.js`:

```
Title|Actor, Actor, Actor
```

The title must match `movies.js` exactly. A film missing from `cast.js` still works
everywhere else — it just doesn't feed the actor rankings. Three or four billed leads per
film is right; adding whole casts would bury the rankings in one-scene parts.

---

## Editing your film list

Your whole list lives in `movies.js`, one film per line, fields separated by `|`:

```
Title|Year|Runtime|Genre,Genre|Director|WikipediaTitle
```

**Only the title is required.** You can stop at any point and leave the rest off:

```
Sicario|2015|121|Thriller,Crime|Denis Villeneuve|
Sicario|2015|121|Thriller,Crime|      <- no director
Sicario|2015                          <- just a year
Sicario                               <- bare minimum
```

A film with no year still works — it just won't appear under a decade filter. No genres means
it won't appear under a genre filter. Everything else behaves normally, and you can fill the
details in later.

| Field | What it does |
|---|---|
| Title | Required. Also decides the poster filename and the rating key. |
| Year | Sorting and the decade filter. |
| Runtime | Minutes. Blank or `0` shows as unknown. |
| Genres | Comma separated. Feeds the genre filter and the Top 25 scope dropdown. |
| Director | Shown on the film's panel, and searchable. |
| Wikipedia | Only when the article name differs, e.g. `Gladiator (2000 film)`. |

Blank lines are ignored, and a line starting with `#` is treated as a comment — handy for
grouping (`# Watched in 2026`).

If a line is malformed the site skips it and explains why in the browser console (F12) rather
than breaking. Duplicate titles get flagged there too, since two films with the same title
would otherwise share one rating.

**Careful:** a film's rating and its poster filename are both keyed to its title. Renaming a
title orphans both.

### Editing it on GitHub

1. Open `movies.js` in your repo
2. Click the pencil icon (top right of the file)
3. Add or remove lines
4. **Commit changes** at the bottom

The live site updates in about a minute. Your ratings are untouched — they live in your
browser, not in this file.

---

To run it locally, just open `index.html` in your browser. No server needed.
