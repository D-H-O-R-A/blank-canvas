

## Plan: Pagination + Firestore Indexes, Rules & Storage Rules

### 1. Backend Pagination (cursor-based)

Add `?page=1&limit=20` query params to these admin endpoints in `functions/routes/admin.js`:

- `GET /admin/users` — paginate professionals by `createdAt desc`
- `GET /admin/logs` — paginate logs by `timestamp desc`
- `GET /admin/payments` — paginate flattened payments by `paidAt desc`
- `GET /admin/contacts` — paginate contacts by `createdAt desc`
- `GET /admin/recruiters` — paginate recruiters by `createdAt desc`
- `GET /admin/withdrawals` — paginate withdrawals by `requestedAt desc`

Each returns `{ data: [...], total, page, limit, totalPages }`.

For Firestore offset-based pagination: use `.offset((page-1)*limit).limit(limit)` with a separate `.get()` for count. Payments are cross-collection so we paginate in-memory (already collected).

### 2. Frontend Pagination Component

Add pagination controls to all admin list pages using the existing `src/components/ui/pagination.tsx` component:

**Files modified:**
- `src/pages/admin/AdminUsers.tsx` — add page state, pass `?page=&limit=` to API, render pagination
- `src/pages/admin/AdminLogs.tsx` — same pattern
- `src/pages/admin/AdminPayments.tsx` — same pattern
- `src/pages/admin/AdminContacts.tsx` — same pattern
- `src/pages/admin/AdminRecruiters.tsx` — same pattern
- `src/pages/admin/AdminWithdrawals.tsx` — same pattern

Each page: state for `page`, `totalPages`. Fetch with query params. Show `Pagination` component at bottom.

### 3. Firestore Indexes (`firestore.indexes.json`)

Create `firestore.indexes.json` with composite indexes needed for pagination queries:

```json
{
  "indexes": [
    { "collectionGroup": "professionals", "fields": [{"fieldPath": "createdAt", "order": "DESCENDING"}] },
    { "collectionGroup": "logs", "fields": [{"fieldPath": "timestamp", "order": "DESCENDING"}] },
    { "collectionGroup": "contacts", "fields": [{"fieldPath": "createdAt", "order": "DESCENDING"}] },
    { "collectionGroup": "recruiters", "fields": [{"fieldPath": "createdAt", "order": "DESCENDING"}] },
    { "collectionGroup": "payments", "fields": [{"fieldPath": "paidAt", "order": "DESCENDING"}] },
    { "collectionGroup": "withdrawals", "fields": [{"fieldPath": "requestedAt", "order": "DESCENDING"}] },
    { "collectionGroup": "withdrawals", "fields": [{"fieldPath": "status", "order": "ASCENDING"}, {"fieldPath": "requestedAt", "order": "DESCENDING"}] }
  ],
  "fieldOverrides": []
}
```

### 4. Firestore Rules (`firestore.rules`)

Since all access is via backend (admin SDK bypasses rules), lock everything down:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Storage Rules (`storage.rules`)

Same principle — all uploads go through backend admin SDK:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

Read is public (photos/receipts need to be viewable via URL), write is blocked (only admin SDK writes).

### 6. Firebase config update (`firebase.json`)

Add firestore and storage config references:

```json
"firestore": {
  "rules": "firestore.rules",
  "indexes": "firestore.indexes.json"
},
"storage": {
  "rules": "storage.rules"
}
```

### Files Summary

| File | Action |
|------|--------|
| `functions/routes/admin.js` | Add pagination to 6 GET endpoints |
| `src/pages/admin/AdminUsers.tsx` | Add pagination UI |
| `src/pages/admin/AdminLogs.tsx` | Add pagination UI |
| `src/pages/admin/AdminPayments.tsx` | Add pagination UI |
| `src/pages/admin/AdminContacts.tsx` | Add pagination UI |
| `src/pages/admin/AdminRecruiters.tsx` | Add pagination UI |
| `src/pages/admin/AdminWithdrawals.tsx` | Add pagination UI |
| `firestore.indexes.json` | Create - indexes for ordered queries |
| `firestore.rules` | Create - deny all (backend only) |
| `storage.rules` | Create - read public, write denied |
| `firebase.json` | Add firestore/storage config |

