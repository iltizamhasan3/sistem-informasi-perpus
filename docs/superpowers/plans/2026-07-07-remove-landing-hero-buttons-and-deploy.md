# Remove Landing Hero Buttons and Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove landing page hero buttons and deploy the application to Vercel.

**Architecture:** Modify `src/app/page.tsx` to remove "Mulai Eksplorasi" and "Pelajari Fitur" buttons. Deploy the system to Vercel manually using Vercel CLI.

**Tech Stack:** Next.js, React, Tailwind CSS, Vercel CLI.

## Global Constraints

- Preserve code styling, layout, structure, and naming conventions of the current landing page.
- Do not add any new packages.

---

### Task 1: Modify Landing Page Hero Section

**Files:**
- Modify: `src/app/page.tsx:56-64`

**Interfaces:**
- Consumes: None
- Produces: Modified homepage without the two hero buttons.

- [ ] **Step 1: Locate the code to modify**
  Open `src/app/page.tsx` and identify the following block:
  ```tsx
  <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
    <Link href="/register" className="mc-btn-primary px-10 py-4 text-[16px] shadow-md hover:-translate-y-1 transition-transform w-full sm:w-auto">
      Mulai Eksplorasi
    </Link>
    <Link href="/login" className="mc-btn-secondary px-10 py-4 text-[16px] w-full sm:w-auto">
      Pelajari Fitur
    </Link>
  </div>
  ```

- [ ] **Step 2: Remove the button block**
  Delete lines 56 to 64. Adjust spacing if needed.

- [ ] **Step 3: Run the local dev server to verify**
  Run: `npm run dev`
  Expected: Dev server starts. Open browser/curl to landing page and verify the buttons are gone and navbar is visible.

- [ ] **Step 4: Commit changes**
  Run:
  ```bash
  git add src/app/page.tsx
  git commit -m "feat: remove hero buttons from landing page"
  ```

---

### Task 2: Setup Vercel CLI & Perform Local Build Verification

**Files:**
- Modify: None
- Test: Local production build check

**Interfaces:**
- Consumes: Modified landing page from Task 1.
- Produces: Verified build and configured/linked Vercel CLI.

- [ ] **Step 1: Verify production build locally**
  Before deploying, run the Next.js production build command to check for any TS/compilation issues.
  Run: `npm run build`
  Expected: Command finishes successfully, compiling pages and routes, generating `.next` folder without errors.

- [ ] **Step 2: Link project to Vercel**
  Run: `npx vercel link`
  Wait for prompts. Follow instructions to log in (if needed) and link to a new or existing Vercel project.
  Expected: Successful link creation with a `.vercel` configuration directory.

- [ ] **Step 3: Pull Vercel environment/settings**
  Run: `npx vercel pull`
  Expected: Successful download of environment variables/settings to `.vercel/.env.local`.

- [ ] **Step 4: Commit linking metadata if applicable**
  Only Vercel non-sensitive JSON configs (if any) are modified. Ensure `.vercel` folder is added to `.gitignore` or not committed if it contains credentials. Check `git status`.

---

### Task 3: Deploy to Vercel Manually

**Files:**
- Modify: None
- Test: Live Vercel deployment URL

**Interfaces:**
- Consumes: Vercel link configuration.
- Produces: Deployments to Vercel staging/production.

- [ ] **Step 1: Deploy a preview draft**
  Run: `npx vercel`
  Expected: Initiates build on Vercel, outputs a preview/deployment URL.

- [ ] **Step 2: Deploy to production**
  Run: `npx vercel --prod`
  Expected: Production deployment succeeds. The output contains the live production URL.

- [ ] **Step 3: Verify live deployment**
  Access the live URL. Verify that:
  1. No hero buttons are displayed.
  2. The navbar buttons "Masuk" and "Daftar Sekarang" work.
