

## Plan: Recruiter System + Birth Date Field

This is a large feature with multiple interconnected parts. Here's the full breakdown:

### 1. Firestore Collections

```text
recruiters/{uid}
├── name, email, whatsapp, profession, photoURL
├── birthDate, cpf, address, pixKey
├── commissionPercent (default 25)
├── totalCommission (accumulated R$)
├── availableBalance (R$ available for withdrawal)
├── blocked, createdAt, updatedAt

recruiters/{uid}/clients/{clientUid}
├── name, email, whatsapp, profession, plan
├── paymentStatus: "pending" | "paid" | "expired" | "cancelled"
├── paymentUrl, paymentId, mercadoPagoId
├── commissionAmount, commissionPercent
├── createdAt, paidAt

recruiters/{uid}/withdrawals/{id}
├── amount, status: "pending" | "approved" | "rejected"
├── pixKey, receiptURL (admin uploads proof)
├── requestedAt, processedAt, processedBy

professionals/{uid}
├── birthDate  ← NEW field
├── recruitedBy: recruiterUid | null  ← NEW field
```

### 2. Backend — New File: `functions/routes/recruiter.js`

New endpoints (all require auth + recruiter role check):

- `POST /recruiter/register` — public, creates recruiter account (email, password, name, whatsapp, profession, birthDate, cpf, address, pixKey, photo as base64)
- `GET /recruiter/profile` — get recruiter profile
- `PUT /recruiter/profile` — update profile fields
- `POST /recruiter/photo` — upload photo (same pattern as profile/photo)
- `POST /recruiter/clients` — register a new client (creates Firebase Auth user + professionals doc + generates MP payment link, stores in recruiter's clients subcollection)
- `GET /recruiter/clients` — list recruiter's clients with payment status
- `DELETE /recruiter/clients/:uid` — delete client (only if unpaid)
- `POST /recruiter/withdrawals` — request withdrawal
- `GET /recruiter/withdrawals` — list recruiter's withdrawals

Middleware: `functions/middleware/recruiter.js` — checks if uid exists in `recruiters` collection

### 3. Backend — Admin Recruiter Endpoints (in `functions/routes/admin.js`)

- `GET /admin/recruiters` — list all recruiters
- `PUT /admin/recruiters/:uid` — edit recruiter (including commissionPercent)
- `DELETE /admin/recruiters/:uid` — delete recruiter
- `PUT /admin/recruiters/:uid/block` — toggle block
- `GET /admin/recruiters/:uid/clients` — list recruiter's clients
- `GET /admin/withdrawals` — list all withdrawal requests
- `PUT /admin/withdrawals/:id` — approve/reject withdrawal (attach receipt as base64 → Storage)
- Stats endpoint updated to include recruiter counts

### 4. Webhook Update (`functions/webhook.js`)

When a payment is confirmed for a user with `recruitedBy`, update the recruiter's client record to `paid`, calculate commission, and add to recruiter's `totalCommission` and `availableBalance`.

When payment expires/cancels: mark client as expired/cancelled, delete the professionals doc and Firebase Auth user.

### 5. Frontend — New Pages

**`src/pages/RecruiterRegister.tsx`** — Registration form with: name, email, password, whatsapp, profession, birthDate, cpf, address, pixKey, photo upload. Not linked from home page.

**`src/pages/RecruiterLogin.tsx`** — Login page for recruiters (similar to Login.tsx but redirects to /recruiter/dashboard)

**`src/pages/recruiter/RecruiterLayout.tsx`** — Sidebar layout (Dashboard, Clients, Withdrawals, Profile)

**`src/pages/recruiter/RecruiterDashboard.tsx`** — Shows total clients, paid clients, total commission, available balance

**`src/pages/recruiter/RecruiterClients.tsx`** — Register new client form (name, email, whatsapp, profession, plan, birthDate), list clients with payment status, generate/resend payment link, delete unpaid

**`src/pages/recruiter/RecruiterWithdrawals.tsx`** — Request withdrawal, list past withdrawals with status and receipt download

**`src/pages/recruiter/RecruiterProfile.tsx`** — Edit profile, photo, address, pixKey

**`src/components/RecruiterProtectedRoute.tsx`** — Check if user is a recruiter

### 6. Frontend — Admin Panel Updates

**`src/pages/admin/AdminRecruiters.tsx`** — CRUD for recruiters, set commission %, block/unblock, view clients

**`src/pages/admin/AdminWithdrawals.tsx`** — List all withdrawal requests, approve with receipt upload, reject

**`AdminLayout.tsx`** — Add "Recrutadores" and "Saques" nav items

**`AdminDashboard.tsx`** — Add recruiter stats cards

### 7. Frontend — Birth Date in Professional Registration

**`src/components/ProfessionalSection.tsx`** — Add birthDate field to registration form (date input)

**`src/pages/admin/AdminUsers.tsx`** — Add birthDate to create dialog, show in edit (read-only)

**`src/pages/Dashboard.tsx`** — Show birthDate as read-only

**Backend:** `POST /register` and `POST /admin/users` accept `birthDate`, `PUT /profile` does NOT allow changing it

### 8. Routes (`src/App.tsx`)

```text
/recrutador/cadastro    → RecruiterRegister
/recrutador/login       → RecruiterLogin
/recrutador             → RecruiterLayout (protected)
  /recrutador/           → RecruiterDashboard
  /recrutador/clientes   → RecruiterClients
  /recrutador/saques     → RecruiterWithdrawals
  /recrutador/perfil     → RecruiterProfile
/admin/recruiters       → AdminRecruiters
/admin/withdrawals      → AdminWithdrawals
```

### Files Created
- `functions/middleware/recruiter.js`
- `functions/routes/recruiter.js`
- `src/pages/RecruiterRegister.tsx`
- `src/pages/RecruiterLogin.tsx`
- `src/pages/recruiter/RecruiterLayout.tsx`
- `src/pages/recruiter/RecruiterDashboard.tsx`
- `src/pages/recruiter/RecruiterClients.tsx`
- `src/pages/recruiter/RecruiterWithdrawals.tsx`
- `src/pages/recruiter/RecruiterProfile.tsx`
- `src/components/RecruiterProtectedRoute.tsx`
- `src/pages/admin/AdminRecruiters.tsx`
- `src/pages/admin/AdminWithdrawals.tsx`

### Files Modified
- `functions/index.js` — mount recruiter routes
- `functions/routes/admin.js` — add recruiter + withdrawal admin endpoints
- `functions/routes/public.js` — accept birthDate in /register
- `functions/webhook.js` — handle recruiter commission on payment
- `src/App.tsx` — add all new routes
- `src/pages/admin/AdminLayout.tsx` — add nav items
- `src/pages/admin/AdminDashboard.tsx` — add recruiter stats
- `src/pages/admin/AdminUsers.tsx` — add birthDate field
- `src/pages/Dashboard.tsx` — show birthDate read-only
- `src/components/ProfessionalSection.tsx` — add birthDate to form

