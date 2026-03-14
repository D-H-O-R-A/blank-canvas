

## Plan

This is a large request with 4 major areas. Here's the breakdown:

### 1. Responsive Layout Fixes

**Home (Index page):** Already mostly responsive. Minor tweaks needed:
- Header mobile menu is fine (lg breakpoint)
- HeroSection, Footer, etc. already use responsive classes

**Admin Layout:** The sidebar already uses the collapsible Sidebar component. The main issue is `AdminUsers.tsx` — the table is not mobile-friendly. Will convert the users table to card-based layout on mobile using responsive classes. Same pattern for other admin pages if needed.

**Dashboard:** Already uses `sm:grid-cols-2` patterns — mostly fine. Minor padding adjustments.

**Files modified:** `src/pages/admin/AdminUsers.tsx`, `src/pages/admin/AdminLayout.tsx`, `src/pages/Dashboard.tsx`

### 2. Date Picker for Subscription Duration (Admin)

Replace the "months" number input in Create User and Renew dialogs with a proper date picker (using Shadcn Calendar/Popover) that lets admin set the exact `paidUntil` date.

- **Create User dialog:** Add a date picker for "Pago até" instead of just "months"
- **Renew dialog:** Add a date picker for the new expiration date instead of just "months"
- **Backend:** Update `POST /admin/users` and `POST /admin/users/:uid/renew` to accept `paidUntil` as an ISO date string directly (instead of computing from months)

**Files modified:** `src/pages/admin/AdminUsers.tsx`, `functions/routes/admin.js`

### 3. Photo Upload + Admin Edit All User Fields

**Backend — new endpoint:** `POST /admin/users/:uid/photo` and `POST /profile/photo`
- Accept base64 image in JSON body (simpler than multipart since no multer installed)
- Upload to Firebase Storage bucket `profile-photos/{uid}.jpg`
- Update `photoURL` in Firebase Auth (`admin.auth().updateUser`)
- Update `photoURL` field in Firestore `professionals/{uid}`

**Admin Edit dialog:** Add fields for social links (instagram, facebook, linkedin, website), about, photo upload button

**Dashboard:** Add photo upload in profile section, show current photo as avatar

**Files modified:** `functions/routes/admin.js`, `functions/routes/profile.js`, `src/pages/admin/AdminUsers.tsx`, `src/pages/Dashboard.tsx`

Need to add `busboy` or handle base64 in JSON body. Will use base64 approach (no extra dependency).

### 4. Dashboard Payment Button → Plan Selection

Replace "Realizar novo pagamento" with a dialog that lets the user:
- See their current plan
- Choose to renew current plan or switch to another plan (1 month ↔ 6 months)
- Submit triggers the existing `create-payment` endpoint with the selected plan

**File modified:** `src/pages/Dashboard.tsx`

### Summary of All File Changes

| File | Change |
|------|--------|
| `src/pages/admin/AdminUsers.tsx` | Responsive cards on mobile, date picker for create/renew, photo upload + social links in edit |
| `src/pages/Dashboard.tsx` | Responsive tweaks, photo upload, plan selection dialog |
| `src/pages/admin/AdminLayout.tsx` | Minor responsive adjustments |
| `functions/routes/admin.js` | Accept `paidUntil` date, photo upload endpoint |
| `functions/routes/profile.js` | Photo upload endpoint |
| `functions/package.json` | No changes needed (base64 approach) |

