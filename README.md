# CREO Prompt Library

A library for managing, tagging and previewing AI prompts (image/video)
with visual examples, built with React, Vite, Tailwind CSS and Firebase.

## Features

- Google sign-in (Firebase Auth), public read-only access for everyone else
- Categories, tags, search, favorites, grid/list view
- Sort by newest/oldest/alphabetical/most copied
- Link related prompts together, duplicate a prompt, bulk category change / delete
- Export the whole library to JSON and re-import it
- `[Placeholder]` tokens in prompt text are highlighted and fillable before copying
- Markdown formatting in prompt content
- English/Russian UI

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`. It connects to the Firebase project
configured in `firebase-config.json` (already checked in — same backend used
in production), so sign-in and data are live from the moment you start it.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Firebase (Auth/Firestore/Storage) · Express (serves the built app in production)
