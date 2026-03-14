# Taskboard

A Trello-inspired project management board built as a portfolio project. Manage boards, lists, and cards with a clean, dark UI — all data is stored and synced via Google Sheets.

**[→ Live Demo](https://goldenspade.github.io/trello_clone/)**

---

## Screenshots

![Boards overview](https://goldenspade.github.io/trello_clone/screenshots/Screenshot_1.jpg)

![Board view](https://goldenspade.github.io/trello_clone/screenshots/Screenshot_2.jpg)

![Card detail](https://goldenspade.github.io/trello_clone/screenshots/Screenshot_3.jpg)

![Card priorities and colors](https://goldenspade.github.io/trello_clone/screenshots/Screenshot_4.jpg)

![List color customization](https://goldenspade.github.io/trello_clone/screenshots/Screenshot_5.jpg)

![Board color picker](https://goldenspade.github.io/trello_clone/screenshots/Screenshot_6.jpg)

![Mobile view](https://goldenspade.github.io/trello_clone/screenshots/Screenshot_7.jpg)

---

## Features

- **Boards** — create, rename, delete, and colorize boards
- **Lists** — add, reorder, and set custom background colors per list
- **Cards** — full card detail modal with description editing, priority badges, color labels, and creation date
- **Drag & Drop** — reorder cards within and across lists
- **Priority system** — None / Low / Medium / High / Urgent with color-coded badges
- **Color customization** — 24 colors (pastel, vivid, and grayscale) for boards, lists, and cards
- **Persistent storage** — all data lives in Google Sheets, synced via Google Apps Script REST API

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) + Vue 3 |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Language | TypeScript |
| Backend | Google Apps Script |
| Database | Google Sheets |
| Hosting | GitHub Pages |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Sheet with three sheets: **Boards**, **Lists**, **Cards**
- A deployed Google Apps Script web app (see `app-script.js`)

### Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your Apps Script URL
cp .env.example .env

# Start dev server
npm run dev
```

### Environment Variables

```env
NUXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Google Sheets Structure

**Boards:** `id | title | color | createdAt`

**Lists:** `id | boardId | title | position | createdAt | color`

**Cards:** `id | listId | title | description | position | createdAt | priority | color`

### Deploy to GitHub Pages

```bash
npx nuxt generate
git add -f .output/public
git commit -m "Deploy"
git subtree push --prefix .output/public origin gh-pages
```

---

## License

MIT
