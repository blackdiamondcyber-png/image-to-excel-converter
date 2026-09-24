# Image to Excel Converter

The oldest project on this account and the only repo here with its full commit history, built in February and March 2026. Photograph a document, up to 40 pages, and get a clean Excel file back on your phone. I built it with Claude Code, so 16 of the 43 commits that built it carry Claude as the author, and 2 come from Midas, my own agent system.

Claude Vision does the extraction. This is one of three capture tools where a model actually runs, alongside a product barcode scanner and a parts catalog lookup. Everything else I run in production for field teams is deterministic, including the three territory apps.

Inside the app it is branded Rohan, and the npm package is named `snapsheet`; the repo name says what it does.

## What it does

- Mobile-first PWA that installs from the browser
- Capture, process, review, export: one step at a time
- Each page is compressed client-side, sent through a server route to Claude Vision, and comes back as JSON tables. The prompt enforces exact transcription, no duplicate rows, and row lengths that match the header count
- Review and edit the tables in place before export
- Excel is generated client-side with SheetJS; export by direct download, File System Access API where supported, Web Share on mobile, or hand off to Google Drive, OneDrive or Dropbox through the phone's share sheet (desktop downloads the file, then opens the drive's website to finish the upload)
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

More of my work: [erik-pearson-portfolio.vercel.app](https://erik-pearson-portfolio.vercel.app). Contact: [LinkedIn](https://www.linkedin.com/in/erikpearson2).
