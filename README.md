# Fatwa Archive Hub

Act as a full-stack web developer. Build a modern, clean web application to catalog, organize, and view a collection of 100–300 Instagram fatawa (rulings/lectures).

### Technical Stack & Database

- Database: Use Supabase as the primary backend database.

- Frontend: Next.js (App Router), Tailwind CSS, and Lucide icons.

- Supabase Database Schema:

  - fatawa: id, title, summary_transcript, instagram_url, scholar_id (FK), topic_id (FK), created_at

  - scholars: id, name, slug

  - topics: id, name, slug

### Core Features & UI Requirements

1. Catalog Grid: Display fatwa cards with titles, scholar badges, topic tags, short transcript summaries, and embedded Instagram video/post players.

2. Filtering & Search:

   - Dynamic multi-filter by Scholar and Topic.

   - Real-time search bar querying titles and transcript summaries.

3. Content Entry (Admin UI): A simple protected page or form to insert new Instagram links, select scholars/topics from dropdowns, and save them directly into Supabase without writing manual SQL.

4. UI/UX Design: Minimalist, clean educational aesthetic with light/dark theme support and full mobile responsiveness.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://kalaamalulama.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/37c6639a-75fb-4a2d-a0fa-a78cea447249).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
