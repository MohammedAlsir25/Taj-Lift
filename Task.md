# Taj Lift — Production Readiness Task List

Goal: remove all mock/demo data and fake auth so the app runs on real Firestore data and the team can use it for live operations.
Priority: P0 = blocker before real use · P1 = required for deploy · P2 = hardening.

## P0 — Auth: replace fake auth with Firebase Authentication
- [ ] `src/lib/firebase.ts` already exports `auth` (getAuth) but it's unused. Wire signIn to `signInWithEmailAndPassword`, signUp to `createUserWithEmailAndPassword`, then create the Firestore profile doc keyed by the Auth `uid`.
- [ ] `src/components/ProfileContext.tsx`: remove the local `login()` that compares against a plaintext `users` array; drive `currentUser` from Firebase Auth + the Firestore profile.
- [ ] Stop storing plaintext passwords. `users` docs are written with a `password` field via `setDoc` — remove the field; never persist it.
- [ ] Remove `DEFAULT_USERS` auto-seeding of Firestore and the `taj_users_db` localStorage fallback used for auth. (Optional: one-time first-admin seed behind an explicit flag.)
- [ ] Add `onAuthStateChanged` to restore the session on reload; route-guard on real auth state.
- [ ] `src/components/BiometricGate.tsx`: cosmetic only (auto-passes, any 4-digit PIN). Remove it or document as UX-only — not a security control.

## P0 — Firestore security rules (currently `allow read, write: if true;`)
- [ ] `firestore.rules`: require `request.auth != null`; per-collection rules:
  - `users/{uid}`: write own doc; admins manage all
  - `projects`, `leads`, `breakdowns`, `inspections`, `pm_slots`, `payments`, `proposals`: restrict by role/team
- [ ] Deploy (`firebase deploy --only firestore:rules`) and verify in the Firebase console.

## P0 — Remove mock data; wire real Firestore collections
Use the `projects` pattern in `ProjectContext.tsx` (onSnapshot + addDoc/setDoc/deleteDoc) as the template for each row.

| Page / source | Mock to remove | Real collection(s) | Notes |
|---|---|---|---|
| `Dashboard.tsx` | `enquiriesStats/jobsStats/pmStats/breakdownsStats` hardcoded "PDF Page 11" numbers | computed counts | aggregate from leads/jobs/pm_slots/breakdowns |
| `LeadProfile.tsx` | `mockLeads` array | `leads` | onSnapshot load; add/update/delete; drop local array |
| `ProjectContext.tsx` | `INITIAL_PROJECTS` seed | `projects` | keep collection; remove/gate the seed for prod |
| `InspectionForm.tsx` | `pmSlots` (Wakad Site…), `photos` defaults | `pm_slots`, `inspections` | persist matrix + photos; `componentsList` is static reference data (keep) |
| `TechnicianMap.tsx` | `technicians` mock; breakdown form local-only | `users`(role=tech) + `breakdowns` | real presence/status; create/dispatch/resolve breakdowns |
| `ProjectTracker.tsx` | `paymentHistory`, `paymentPhotos` AED milestones | `payments` | persist milestones/receipts; estimation math can stay (deterministic) |
| `ClientProposalDeck.tsx` | default `Emaar`/`AED 2,450,000` | `proposals` | placeholders; persist generated proposals |

- [ ] For each row: create the collection, switch the component to live Firestore CRUD, and delete the local mock array.
- [ ] Remove the `taj_*` localStorage fallbacks used to store entity data (keep only UX prefs like `taj_theme`).

## P1 — AI advisor & server
- [ ] `server.ts` `/api/ai/analyze` is live once `GEMINI_API_KEY` is set (now in `.env`). For production, set the key in the deploy env/secret (Cloud Run / AI Studio), not committed; fail startup cleanly if missing.
- [ ] Add auth to the AI route + basic rate limiting / input size caps.
- [ ] Surface real AI errors to the user (keep a tasteful offline fallback).

## P1 — Demo helpers to remove
- [ ] Delete `public/seed.html` (auto-login helper, added for screenshots only).
- [ ] `src/pages/SignIn.tsx`: remove the "Testing Credentials / Click to fill default lead" banner and `handleFillDemo`.
- [ ] Remove demo strings/comments referencing original "PDF Page X" mock sources.

## P1 — Config & deploy
- [ ] `firebase.ts`: keep the public web `apiKey` but lock authorized domains in the Firebase console; load config from env for multi-env.
- [ ] Build/serve: `npm run build` → `dist/`; run `node dist/server.cjs` with `NODE_ENV=production`, correct `PORT`/`APP_URL`.
- [ ] Confirm `.env` stays git-ignored (`.gitignore` covers `.env*`); rotate the Gemini key if it was ever committed.

## P2 — Hardening
- [ ] Validate/sanitize all form inputs; tighten number parsing in Dashboard/ProjectFinance/ProjectTracker.
- [ ] Add loading + empty states per collection (no mock fallback).
- [ ] Error boundaries around Firestore listeners.
- [ ] Optional off-by-default seed scripts for first-run sample data.

## Done when
- [ ] A new user can sign up/in via Firebase Auth and sessions persist across reloads.
- [ ] No component contains a `mock*` / `INITIAL_*` / `DEFAULT_*` array; all reads come from Firestore collections.
- [ ] Firestore rules reject unauthenticated reads/writes; no plaintext passwords stored.
- [ ] Dashboard stats are computed from real documents.
- [ ] The app works with zero seed/mock data (starts empty, accepts real entries).
- [ ] `public/seed.html` and demo credential helpers are removed.
