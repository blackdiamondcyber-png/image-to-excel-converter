# Image to Excel Converter

The oldest project on this account and the only repo here with a full commit history (February to March 2026). Photograph a document, up to 40 pages, and get a clean Excel file back on your phone.

Claude Vision does the extraction, which makes this one of the two places in anything I have built where a model actually runs. Everything I run in production for field teams is deterministic.

## What it does

- Mobile-first PWA that installs from the browser
- Capture, process, review, export: one step at a time
- Each page is compressed client-side, sent through a server route to Claude Vision, and comes back as JSON tables. The prompt enforces exact transcription, no duplicate rows, and row lengths that match the header count
- Review and edit the tables in place before export
- Excel is generated client-side with SheetJS; export by direct download, File System Access API, Web Share on mobile, or cloud save
- Scan history lives in localStorage on the device; nothing is stored server-side
- Firebase auth with server-side token verification, plus per-user and global daily rate limits to cap API spend

## Stack

Next.js (App Router), React, Tailwind CSS, Firebase Auth, Anthropic SDK, SheetJS.

## Run it

```bash
npm install
cp .env.example .env.local   # CLAUDE_API_KEY plus Firebase config
npm run dev
```

`CLAUDE_API_KEY` and the Firebase Admin credentials are server-only and are used only inside `src/app/api/`.

## Status

Beta. Built for field reps who get handed paper price lists and order forms and need them in a spreadsheet before they leave the parking lot.
