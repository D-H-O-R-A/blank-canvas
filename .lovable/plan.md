

# Plano: Login Admin dedicado + Gerenciamento de Admins

## O que será feito

1. **Tela de login dedicada para admin** (`/admin/login`) — visual próprio com título "Painel Administrativo", separada do login de profissionais.

2. **Atualizar `AdminProtectedRoute`** — se não logado, redirecionar para `/admin/login` (não `/login`). Se logado mas não admin, mostrar "Acesso negado".

3. **Nova página de gerenciamento de admins** (`/admin/admins`) — lista admins existentes, permite adicionar novos (por e-mail/UID) e remover. Somente admins acessam.

4. **Novo endpoint backend** — `GET /admin/admins` (listar), `POST /admin/admins` (adicionar), `DELETE /admin/admins/:uid` (remover). Todos protegidos por `requireAuth + requireAdmin`.

5. **Adicionar item "Administradores" na sidebar do AdminLayout** com ícone Shield.

## Arquivos

| Ação | Arquivo |
|------|---------|
| Criar | `src/pages/admin/AdminLogin.tsx` |
| Criar | `src/pages/admin/AdminAdmins.tsx` |
| Editar | `src/components/AdminProtectedRoute.tsx` (redirect → `/admin/login`) |
| Editar | `src/App.tsx` (adicionar rotas `/admin/login` e `/admin/admins`) |
| Editar | `src/pages/admin/AdminLayout.tsx` (nav item "Administradores") |
| Editar | `functions/routes/admin.js` (endpoints de gestão de admins) |

## Detalhes técnicos

- **AdminLogin.tsx**: Formulário email+senha, `signInWithEmailAndPassword`, após login verifica `/admin/check` — se admin, redireciona `/admin`; senão, mostra erro e faz logout.
- **AdminAdmins.tsx**: Busca `GET /admin/admins`, tabela com UID/email, dialog para adicionar (campo e-mail, backend busca UID via Auth e cria doc `admin/{uid}`), botão remover com confirmação.
- **Backend**: `GET /admin/admins` lista docs da collection `admin` com `isAdmin: true`. `POST /admin/admins` recebe `{ email }`, busca user por email via `admin.auth().getUserByEmail()`, cria doc. `DELETE /admin/admins/:uid` deleta doc (com proteção para não se auto-remover).

