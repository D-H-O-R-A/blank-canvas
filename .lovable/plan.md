

# Plano: Countdown fixo 1/Jun, Formulario de Contato, Painel Admin, Refatoracao Backend

## 1. Countdown fixo para 1 de Junho de 2026

**Arquivo:** `src/pages/ComingSoon.tsx`
- Substituir `getTargetDate()` por `new Date("2026-06-01T00:00:00")` fixo

---

## 2. Formulario de Contato (`/contato`)

**Criar:** `src/pages/Contact.tsx`
- Pagina com formulario profissional: nome, email, telefone, assunto (select), mensagem (textarea)
- Validacao frontend (campos obrigatorios, email valido)
- Envia POST para `/api/contact`
- Feedback de sucesso/erro com toast

**Editar:** `src/App.tsx` - adicionar rota `/contato`
**Editar:** `src/components/Header.tsx` - "Contato" navega para `/contato` em vez de scroll
**Editar:** `src/components/Footer.tsx` - link "Contato" aponta para `/contato`

---

## 3. Painel Admin (`/admin/*`)

**Criar:** `src/pages/admin/AdminLayout.tsx` - Layout com sidebar (Dashboard, Usuarios, Pagamentos, Logs, Contatos)
**Criar:** `src/pages/admin/AdminDashboard.tsx` - Cards de resumo (total contas, pagamentos sucesso/falha/pendente, contatos)
**Criar:** `src/pages/admin/AdminUsers.tsx` - Lista de profissionais, criar novo, editar dados (nome, whatsapp, profissao, about, imagens, paidUntil, status, plano)
**Criar:** `src/pages/admin/AdminPayments.tsx` - Lista de pagamentos com status (sucesso, falha, pendente)
**Criar:** `src/pages/admin/AdminLogs.tsx` - Lista de logs internos (endpoint, method, uid, timestamp, body resumido)
**Criar:** `src/pages/admin/AdminContacts.tsx` - Lista de formularios de contato recebidos

**Seguranca:** Middleware `requireAdmin` no backend verifica custom claim `admin: true` no JWT. No frontend, rota `/admin/*` protegida com verificacao de claim.

**Criar:** `src/components/AdminProtectedRoute.tsx` - Verifica `user.getIdTokenResult()` para claim `admin`

**Editar:** `src/App.tsx` - Adicionar rotas `/admin`, `/admin/users`, `/admin/payments`, `/admin/logs`, `/admin/contacts`

---

## 4. Backend Refatorado (`functions/index.js`)

Reorganizar o arquivo unico com secoes bem documentadas e adicionar:

### Novos endpoints:
| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| POST | `/contact` | Publico | Salva formulario de contato no Firestore (`contacts` collection) |
| GET | `/admin/stats` | Admin | Retorna contadores (profissionais, pagamentos por status, contatos) |
| GET | `/admin/users` | Admin | Lista todos os profissionais |
| POST | `/admin/users` | Admin | Cria novo usuario (admin cria) |
| PUT | `/admin/users/:uid` | Admin | Edita dados de qualquer usuario |
| GET | `/admin/payments` | Admin | Lista todos os pagamentos |
| GET | `/admin/logs` | Admin | Lista logs internos |
| GET | `/admin/contacts` | Admin | Lista formularios recebidos |
| PUT | `/admin/contacts/:id` | Admin | Marca contato como lido |

### Sistema de logs:
- Middleware `logAction` que intercepta POST/PUT e salva em collection `logs` (endpoint, method, uid, timestamp, body resumido, ip)

### Middleware `requireAdmin`:
- Verifica custom claim `admin: true` via `admin.auth().verifyIdToken(token)` → `decoded.admin === true`

### Firestore collections novas:
```text
contacts/{id}        → name, email, phone, subject, message, createdAt, read
logs/{id}            → endpoint, method, uid, timestamp, summary, ip
```

### Documentacao:
- Cada endpoint com JSDoc completo
- Header do arquivo com indice de secoes
- Atualizar `FIREBASE_FUNCTIONS_SETUP.md` com todos os novos endpoints e como definir um admin (`firebase auth:claims --set admin=true --uid=XXX`)

---

## Resumo de arquivos

| Acao | Arquivo |
|------|---------|
| Editar | `src/pages/ComingSoon.tsx` (linha 102-107) |
| Criar | `src/pages/Contact.tsx` |
| Criar | `src/pages/admin/AdminLayout.tsx` |
| Criar | `src/pages/admin/AdminDashboard.tsx` |
| Criar | `src/pages/admin/AdminUsers.tsx` |
| Criar | `src/pages/admin/AdminPayments.tsx` |
| Criar | `src/pages/admin/AdminLogs.tsx` |
| Criar | `src/pages/admin/AdminContacts.tsx` |
| Criar | `src/components/AdminProtectedRoute.tsx` |
| Editar | `src/App.tsx` |
| Editar | `src/components/Header.tsx` |
| Editar | `src/components/Footer.tsx` |
| Reescrever | `functions/index.js` |
| Editar | `FIREBASE_FUNCTIONS_SETUP.md` |

