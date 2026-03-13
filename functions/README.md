# Functions — Documentação dos Módulos

Backend modular do Click Serviços usando Firebase Cloud Functions (2nd gen) + Express.

## Estrutura

```
functions/
├── index.js              ← Entry point: monta Express, importa routers, exporta
├── config.js             ← Configuração central (db, admin, secrets, constantes)
├── package.json
├── middleware/
│   ├── auth.js           ← Middleware: valida JWT do Firebase Auth
│   ├── admin.js          ← Middleware: verifica admin via Firestore
│   └── logger.js         ← Middleware: registra POST/PUT em collection logs
└── routes/
    ├── public.js         ← Rotas públicas (register, contact, webhook)
    ├── profile.js        ← Rotas do profissional autenticado
    └── admin.js          ← Rotas administrativas
```

## Módulos

### `config.js`
Configuração central. Exporta:
- `admin` — instância firebase-admin (já inicializada)
- `db` — referência ao Firestore
- `mercadoPagoToken` — secret do Mercado Pago
- `APP_BASE_URL` — URL do app para redirecionamentos
- `PLAN_CONFIG` — planos disponíveis (`{ amount, frequency }`)

### `middleware/auth.js`
**`requireAuth(req, res, next)`** — Valida Bearer JWT. Injeta `req.uid` e `req.decodedToken`.

### `middleware/admin.js`
**`requireAdmin(req, res, next)`** — Verifica doc `admin/{uid}.isAdmin === true` no Firestore. Usar APÓS `requireAuth`.

### `middleware/logger.js`
**`logAction(req, res, next)`** — Registra POST/PUT automaticamente na collection `logs`.

### `routes/public.js`
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/register` | Cadastro + assinatura Mercado Pago |
| POST | `/contact` | Formulário de contato |
| POST | `/webhook/mercadopago` | Webhook do Mercado Pago |

### `routes/profile.js`
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/profile` | JWT | Retorna perfil |
| PUT | `/profile` | JWT | Atualiza perfil |
| POST | `/create-payment` | JWT | Gera link de pagamento |

### `routes/admin.js`
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/admin/check` | JWT | Verifica se é admin |
| GET | `/admin/stats` | JWT+Admin | Contadores gerais |
| GET | `/admin/users` | JWT+Admin | Lista profissionais |
| POST | `/admin/users` | JWT+Admin | Cria profissional |
| PUT | `/admin/users/:uid` | JWT+Admin | Edita profissional |
| GET | `/admin/payments` | JWT+Admin | Lista pagamentos |
| GET | `/admin/logs` | JWT+Admin | Lista logs |
| GET | `/admin/contacts` | JWT+Admin | Lista contatos |
| PUT | `/admin/contacts/:id` | JWT+Admin | Marca contato lido |

## Deploy

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Adicionar novo endpoint

1. Escolha o router adequado (`public.js`, `profile.js` ou `admin.js`)
2. Adicione a rota com os middlewares necessários
3. Documente no cabeçalho JSDoc do arquivo
4. Atualize esta tabela
