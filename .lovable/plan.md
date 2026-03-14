

## Plan

### Problem Analysis

The admin login fails because the backend checks `doc.data().isAdmin === true` (camelCase) but your Firestore document uses `isadmin` (lowercase). This is a case-sensitivity mismatch — JavaScript object keys are case-sensitive.

### Changes

#### 1. Create `firebase.json` (root)
Create with the exact content you provided (functions source, hosting config with SPA rewrites).

#### 2. Fix admin field name — `isadmin` (lowercase)
Update **3 files** in `functions/` to check `isadmin` instead of `isAdmin`:

- **`functions/routes/admin.js`**: Change all references from `isAdmin` to `isadmin` in:
  - `GET /admin/check` — `doc.data().isadmin === true`
  - `GET /admin/admins` — `.where("isadmin", "==", true)`
  - `POST /admin/admins` — `.set({ isadmin: true })`

- **`functions/middleware/admin.js`**: Change `doc.data().isAdmin !== true` to `doc.data().isadmin !== true`

#### 3. Create dedicated webhook Cloud Function
Create **`functions/webhook.js`** as a separate Firebase Function (not inside the existing Express `api`):

- Separate Express app exported as `webhook` function
- Route: `POST /` (URL will be `https://us-central1-click-servico.cloudfunctions.net/webhook`)
- CORS enabled for all origins (webhooks come from Mercado Pago servers)
- Handles Mercado Pago notification types:
  - `subscription_preapproval` — subscription status changes
  - `payment` — individual payment events
- Flow:
  1. Receive notification with `type` and `data.id`
  2. Fetch full details from Mercado Pago API using `data.id`
  3. Extract `payer_email` from the preapproval/payment response
  4. Query Firestore `professionals` collection by email to find the UID
  5. Update `subscriptionStatus`, `paidUntil` (sum from current date)
  6. Save payment record in `professionals/{uid}/payments` subcollection with full details (amount, status, preapprovalId, email, paidAt, paidUntil)
  7. Log the event in the `logs` collection for audit trail
- Handle statuses: `authorized` → active, `paused`/`cancelled` → update accordingly
- Always return 200 to Mercado Pago (even on errors)

Update **`functions/index.js`** to export `webhook` alongside `api`.

#### 4. Update `functions/index.js` exports
```text
exports.api = onRequest({ secrets: [mercadoPagoToken] }, app);
exports.webhook = onRequest({ secrets: [mercadoPagoToken] }, webhookApp);
```

#### Files created/modified:
- **Create**: `firebase.json`
- **Create**: `functions/webhook.js`
- **Modify**: `functions/index.js` (add webhook export)
- **Modify**: `functions/routes/admin.js` (isAdmin → isadmin)
- **Modify**: `functions/middleware/admin.js` (isAdmin → isadmin)

