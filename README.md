# QuizForge

QuizForge is a deploy-ready multi-page quiz website built with plain HTML, CSS, and JavaScript.

## Features

- Separate pages for discover, login, register, dashboard, quiz creation, attempting quizzes, my quizzes, and leaderboards
- Frontend authentication using `localStorage`
- Users can create and publish quizzes
- Public quizzes appear on the discover page
- Private quizzes use room numbers
- MCQ, true/false, and fill-in-the-blank question formats
- Timer per question
- Tags, tag filters, and search
- Per-quiz leaderboards
- Responsive layout for mobile and desktop
- SEO metadata, web manifest, robots file, and static deployment config

## Important note

This is a static frontend prototype. Authentication, private rooms, and quiz data are stored in the visitor's browser with `localStorage`. That is useful for developing and deploying the website UI, but it is not secure real authentication. For production multi-user data across devices, connect these pages to a backend such as Express/MongoDB, Firebase, or Supabase.

## Run locally

Run a local server so page-to-page navigation behaves like a deployed website:

```bash
npm start
```

Then visit:

```text
http://localhost:4173
```

## Check JavaScript

```bash
npm run check
```

## Deploy

This is a static website. Deploy the project root to any static host.

### Netlify

- Build command: leave empty or use `npm run build`
- Publish directory: `.`

### Vercel

- Framework preset: Other
- Build command: leave empty or use `npm run build`
- Output directory: `.`

### GitHub Pages

- Go to repository Settings -> Pages.
- Under Source, choose GitHub Actions.
- Re-run the failed workflow from the Actions tab, or push a new commit.
- The included workflow at `.github/workflows/pages.yml` will publish the site automatically.

If you prefer the simpler branch deploy method, choose "Deploy from a branch" in Settings -> Pages, then select the root folder of `main` or `master`.

After deployment, update the social preview URL metadata if you add custom Open Graph images or a sitemap for your final domain.

## Add questions

Use the Create page in the website, or edit the seed quiz data in `script.js`.
