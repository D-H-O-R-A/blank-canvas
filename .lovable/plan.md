

## Plan

### 1. Enhanced Error Logging in Backend

Update `functions/middleware/logger.js` to also log errors (not just POST/PUT). Add a shared `logError` helper function that writes detailed error info (stack trace, endpoint, body, uid, IP) to the `logs` collection. Use this in all catch blocks across `admin.js`, `public.js`, `profile.js`, and `webhook.js`.

**Files modified:** `functions/middleware/logger.js` (add `logError` export), `functions/routes/admin.js`, `functions/routes/public.js`, `functions/routes/profile.js`, `functions/webhook.js` (use `logError` in catch blocks)

### 2. Login Button in Registration Popup

The registration popup in `ProfessionalSection.tsx` already has a "Já tem uma conta? Faça login" link at the bottom (line 361-364). Will make it more prominent by adding a visible "Fazer Login" button alongside the "Finalizar Cadastro" button.

**File modified:** `src/components/ProfessionalSection.tsx`

### 3. Admin User Management — Full CRUD + New Fields

Expand `AdminUsers.tsx` and the backend `admin.js` to support:

**New Firestore fields on `professionals/{uid}`:**
- `paymentMethod`: "dinheiro" | "cartao" | "pix" | "mercado_pago"
- `totalPayments`: number (count of paid months)
- `nextBillingMonths`: number (how many months until next payment)
- `blocked`: boolean

**New backend endpoints:**
- `DELETE /admin/users/:uid` — deletes Firebase Auth user + Firestore doc + logs action
- `POST /admin/users/:uid/renew` — renews subscription (sets paidUntil from now + months, increments totalPayments, logs)
- `PUT /admin/users/:uid/block` — toggles blocked status + logs

**Updated PUT /admin/users/:uid** — add `paymentMethod`, `totalPayments`, `nextBillingMonths`, `blocked` to allowed fields

**Frontend `AdminUsers.tsx` changes:**
- Create dialog: add payment method select, subscription duration field
- Edit dialog: add payment method, total payments count, next billing months, blocked toggle
- Table: show payment method, vencimento date, payments count
- Action buttons per user row: Edit, Renew, Block/Unblock, Delete (with confirmation)
- All actions show toast feedback

**Files modified:** `functions/routes/admin.js`, `src/pages/admin/AdminUsers.tsx`

### Technical Details

```text
Firestore: professionals/{uid}
├── name, email, whatsapp, profession, about
├── plan, subscriptionStatus, paidUntil
├── paymentMethod       ← NEW (dinheiro|cartao|pix|mercado_pago)
├── totalPayments       ← NEW (integer counter)
├── nextBillingMonths   ← NEW (1 or 6)
├── blocked             ← NEW (boolean)
└── socialLinks {}

logs collection entry for errors:
├── type: "error"
├── endpoint, method, uid, ip
├── error: message
├── stack: full stack trace
└── timestamp
```

