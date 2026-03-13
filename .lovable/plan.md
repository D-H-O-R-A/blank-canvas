

# Plano: Refatorar Backend Functions em Módulos

## Estrutura proposta

```text
functions/
├── index.js              ← Entry point: inicializa app, importa rotas, exporta
├── package.json
├── config.js             ← Constantes (APP_BASE_URL, PLAN_CONFIG, secret)
├── middleware/
│   ├── auth.js           ← requireAuth
│   ├── admin.js          ← requireAdmin
│   └── logger.js         ← logAction
├── routes/
│   ├── public.js         ← POST /register, /contact, /webhook/mercadopago
│   ├── profile.js        ← GET/PUT /profile, POST /create-payment
│   └── admin.js          ← Todos os /admin/* endpoints
└── README.md             ← Documentação completa de cada módulo
```

## Arquivos e responsabilidades

### `config.js`
Exporta `db`, `admin`, `mercadoPagoToken`, `APP_BASE_URL`, `PLAN_CONFIG`. Cada arquivo importa daqui em vez de redefinir.

### `middleware/auth.js`
Exporta `requireAuth` — valida Bearer JWT, injeta `req.uid`.

### `middleware/admin.js`
Exporta `requireAdmin` — verifica `admin/{uid}.isAdmin` no Firestore.

### `middleware/logger.js`
Exporta `logAction` — registra POST/PUT em collection `logs`.

### `routes/public.js`
Express Router com:
- `POST /register` — cadastro + Mercado Pago
- `POST /contact` — formulário de contato
- `POST /webhook/mercadopago` — webhook MP

### `routes/profile.js`
Express Router com:
- `GET /profile` — perfil do profissional
- `PUT /profile` — atualizar perfil
- `POST /create-payment` — gerar link de pagamento

### `routes/admin.js`
Express Router com todos os endpoints `/admin/*` (check, stats, users CRUD, payments, logs, contacts).

### `index.js` (simplificado)
Apenas inicializa Express, aplica CORS + JSON + logAction, monta os 3 routers, e exporta `onRequest`.

### `README.md`
Documentação de cada módulo: o que faz, como usar, parâmetros, exemplos.

## Resumo de arquivos

| Ação | Arquivo |
|------|---------|
| Reescrever | `functions/index.js` (simplificar para entry point) |
| Criar | `functions/config.js` |
| Criar | `functions/middleware/auth.js` |
| Criar | `functions/middleware/admin.js` |
| Criar | `functions/middleware/logger.js` |
| Criar | `functions/routes/public.js` |
| Criar | `functions/routes/profile.js` |
| Criar | `functions/routes/admin.js` |
| Criar | `functions/README.md` |

Nenhuma alteração no frontend — apenas reorganização do backend mantendo a mesma API.

