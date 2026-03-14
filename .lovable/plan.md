

## Plan: Recruiter Approval Flow + Admin Quick Links

### 1. Admin Layout — Quick Links to Login Pages

**File: `src/pages/admin/AdminLayout.tsx`**

Add two buttons in the header (next to "Sair") linking to `/login` (prestador) and `/recrutador/login` (recrutador). Use `Link` from react-router-dom with icons.

### 2. Recruiter Approval System

#### Backend Changes

**File: `functions/routes/recruiter.js`**
- In `POST /recruiter/register`: add `approved: false` to the Firestore doc on creation.
- In `GET /recruiter/profile`: return `approved` field so the frontend knows the status.
- In recruiter middleware (`functions/middleware/recruiter.js`): check `approved === true` in addition to `!blocked` for all protected recruiter endpoints (clients, withdrawals, etc.). The profile endpoint should still be accessible to show "pending" status.

**File: `functions/routes/admin.js`**
- Add `PUT /admin/recruiters/:uid/approve` endpoint that sets `approved: true` on the recruiter doc.
- Update `GET /admin/recruiters` to return the `approved` field.

#### Frontend Changes

**File: `src/pages/RecruiterRegister.tsx`**
- After successful registration, show a "Aguardando aprovação" message instead of redirecting to login. Or redirect to login with a toast saying approval is pending.

**File: `src/components/RecruiterProtectedRoute.tsx`**
- After fetching `/recruiter/profile`, check if `approved === true`. If not approved, show a "Aguardando aprovação do administrador" screen instead of redirecting to login.

**File: `src/pages/admin/AdminRecruiters.tsx`**
- Split the recruiter list into two sections: "Aguardando Aprovação" and "Aprovados".
- Add an "Aprovar" button for pending recruiters.
- Keep all existing edit/block/delete/clients functionality for both sections.
- Admin can edit all recruiter fields (name, whatsapp, profession, commission%, address, pixKey, balance, totalCommission, photo) for both pending and approved recruiters.

### Summary of File Changes

| File | Change |
|------|--------|
| `src/pages/admin/AdminLayout.tsx` | Add login links in header |
| `functions/routes/recruiter.js` | Add `approved: false` on register |
| `functions/middleware/recruiter.js` | Check `approved` for protected endpoints |
| `functions/routes/admin.js` | Add approve endpoint |
| `src/pages/RecruiterRegister.tsx` | Show "aguardando aprovação" after register |
| `src/components/RecruiterProtectedRoute.tsx` | Show pending screen if not approved |
| `src/pages/admin/AdminRecruiters.tsx` | Split into pending/approved sections, add approve button |

