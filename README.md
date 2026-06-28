# jakubpawlina.com

Personal website and portfolio — *Solving Problems, Building Ideas — Where Tech Meets Vision.*

A dependency-free static site: plain HTML, CSS and vanilla JavaScript. No build
step, no framework, no package install.

## Run locally

The site works by opening `index.html` directly in a browser, but a local
server is recommended so the embedded CV PDF and relative paths behave exactly
like in production:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

Any static server works equally well (`npx serve`, `php -S localhost:8000`, …).

## Structure

```
index.html        Semantic page markup and section scaffolding
css/styles.css     Design system and all styling
js/data.js         Content: profile, stats, skills, experience, projects, posts
js/app.js          Rendering, filtering, modals and the background animation
img/               Project thumbnails and profile picture
assets/            CV PDF
```

Previous versions of the site are preserved as git history and the
`v1.0.0`–`v3.0.0` release tags.

## Editing content

All copy lives in `js/data.js` — update the `PROJECTS`, `EXPERIENCE`, `POSTS`
and `PROFILE` data there; the markup and layout stay untouched.

A project with an empty `links` array renders an honest "no public link" label
instead of a dead button. Set `featured: true` to surface it under the
*featured* filter, and `image` to show a thumbnail in its detail modal.
