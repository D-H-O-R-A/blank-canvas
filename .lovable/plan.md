

# Plano: Admin via Firestore doc + Firestore rules deny-all

## Mudança de conceito

Atualmente o admin é verificado via custom claims do Firebase Auth (`admin: true` no JWT). O novo modelo:

- **Admin é definido por documento Firestore**: `admin/{uid}` com campo `isAdmin: true`
- **Firestore Security Rules**: tudo `false` (leitura e escrita bloqueadas no client)
- **Toda operação** passa pela API Functions (que usa `firebase-admin`, bypass das rules)

## Alterações

### 1. Backend (`functions/index.js`)

**Middleware `requireAdmin`** (linhas 95-100): substituir verificação de `req.decodedToken.admin` por leitura do Firestore:

```js
async function requireAdmin(req, res, next) {
  try {
    const doc = await db.collection("admin").doc(req.uid).get();
    if (!doc.exists || doc.data().isAdmin !== true) {
      return res.status(403).json({ error: "Acesso restrito a administradores" });
    }
    next();
  } catch {
    return res.status(403).json({ error: "Erro ao verificar permissões" });
  }
}
```

### 2. Frontend (`src/components/AdminProtectedRoute.tsx`)

Substituir verificação de custom claims por chamada à API backend (novo endpoint `GET /admin/check`):

- Chama `GET /admin/check` com Bearer token
- Backend verifica doc `admin/{uid}` e retorna `{ isAdmin: true/false }`
- Se `true` → renderiza children; se `false` → redirect `/login`

### 3. Backend — novo endpoint

Adicionar `GET /admin/check` (requer auth, sem requireAdmin):

```js
app.get("/admin/check", requireAuth, async (req, res) => {
  const doc = await db.collection("admin").doc(req.uid).get();
  return res.json({ isAdmin: doc.exists && doc.data().isAdmin === true });
});
```

### 4. Firestore Security Rules

Criar/documentar regras (deploy manual pelo Firebase Console ou CLI):

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

### 5. Documentação (`FIREBASE_FUNCTIONS_SETUP.md`)

Atualizar seção de como definir admin — agora é criando documento no Firestore via console ou script:

```js
// No Firebase Console → Firestore → collection "admin" → add document
// Document ID = UID do usuário
// Campo: isAdmin = true
```

## Resumo de arquivos

| Ação | Arquivo |
|------|---------|
| Editar | `functions/index.js` (middleware requireAdmin + novo endpoint /admin/check) |
| Editar | `src/components/AdminProtectedRoute.tsx` (usar API em vez de claims) |
| Editar | `FIREBASE_FUNCTIONS_SETUP.md` (nova forma de definir admin + Firestore rules) |

