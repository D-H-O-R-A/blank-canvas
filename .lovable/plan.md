

## Plan

### Problem
Unknown sub-routes under `/admin/*` (like `/admin/protected`, `/admin/anything`) fall through to the global `*` catch-all and show 404, instead of redirecting to the admin dashboard.

### Fix
Add a catch-all `*` child route inside the `/admin` layout route in `src/App.tsx` that redirects unknown admin sub-paths to `/admin`.

**File modified:** `src/App.tsx`

```
<Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<AdminUsers />} />
  <Route path="payments" element={<AdminPayments />} />
  <Route path="logs" element={<AdminLogs />} />
  <Route path="contacts" element={<AdminContacts />} />
  <Route path="admins" element={<AdminAdmins />} />
  <Route path="*" element={<Navigate to="/admin" replace />} />  ← NEW
</Route>
```

This ensures any undefined `/admin/*` path redirects to the admin dashboard instead of showing 404. All other undefined routes still show the 404 page normally.

