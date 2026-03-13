# Firebase Cloud Functions - Setup & Deploy

## Pré-requisitos

1. **Firebase CLI** instalado: `npm install -g firebase-tools`
2. **Plano Blaze** no Firebase (necessário para Cloud Functions)
3. **Conta Mercado Pago** de desenvolvedor

---

## 1. Configurar o Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Crie uma aplicação ou use a existente
3. Vá em **Credenciais de Produção**
4. Copie o **Access Token**

## 2. Configurar as credenciais no Firebase

```bash
firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
```

## 3. Fazer deploy das funções

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

## 4. URL da API (após deploy)

Após o deploy, a URL será:

- `https://us-central1-click-servico.cloudfunctions.net/api`

### Endpoints disponíveis:

#### Públicos (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/register` | Cria usuário + assinatura MP |
| POST | `/contact` | Salva formulário de contato |
| POST | `/webhook/mercadopago` | Webhook do Mercado Pago |

#### Protegidos (Bearer JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/profile` | Retorna perfil do profissional |
| PUT | `/profile` | Atualiza perfil |
| POST | `/create-payment` | Gera novo link de pagamento |

#### Admin (Bearer JWT + claim `admin: true`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/stats` | Contadores gerais (usuários, pagamentos, contatos, logs) |
| GET | `/admin/users` | Lista todos os profissionais |
| POST | `/admin/users` | Cria novo profissional (admin) |
| PUT | `/admin/users/:uid` | Edita dados de qualquer profissional |
| GET | `/admin/payments` | Lista todos os pagamentos |
| GET | `/admin/logs` | Lista logs internos (últimos 500) |
| GET | `/admin/contacts` | Lista formulários de contato |
| PUT | `/admin/contacts/:id` | Marca contato como lido |

## 5. Definir um usuário como Admin

Use o Firebase CLI para definir custom claims:

```bash
# Primeiro, encontre o UID do usuário no Firebase Console → Authentication
# Depois, execute no terminal:
node -e "
const admin = require('firebase-admin');
admin.initializeApp();
admin.auth().setCustomUserClaims('UID_DO_USUARIO', { admin: true })
  .then(() => console.log('Admin claim definido!'))
  .catch(console.error);
"
```

Ou via Firebase Admin SDK em qualquer ambiente:
```javascript
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

> **Importante:** O usuário precisa fazer logout e login novamente para que o novo claim seja aplicado.

## 6. Configurar o Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Na seção **Webhooks**, configure:
   - **URL**: `https://us-central1-click-servico.cloudfunctions.net/api/webhook/mercadopago`
   - **Eventos**: `subscription_preapproval`

## 7. Firestore - Estrutura dos dados

```
professionals/{uid}
├── name: string
├── email: string
├── whatsapp: string
├── profession: string
├── plan: "1 mês" | "6 meses"
├── subscriptionStatus: "pending" | "active" | "cancelled"
├── paidUntil: string (ISO date)
├── about: string
├── socialLinks: { instagram, facebook, linkedin, website }
├── mercadoPagoPreapprovalId: string
├── createdAt: timestamp
├── updatedAt: timestamp
└── payments/ (subcollection)
    └── {paymentId}
        ├── preapprovalId: string
        ├── status: string
        ├── amount: number
        ├── paidAt: timestamp
        └── paidUntil: string

contacts/{id}
├── name: string
├── email: string
├── phone: string
├── subject: string
├── message: string
├── createdAt: string (ISO date)
└── read: boolean

logs/{id}
├── endpoint: string
├── method: string ("POST" | "PUT")
├── uid: string | null
├── timestamp: string (ISO date)
├── summary: string (body JSON truncado em 500 chars)
└── ip: string
```

## 8. Sistema de Logs

Toda interação POST/PUT é automaticamente registrada na collection `logs` com:
- Endpoint chamado
- Método HTTP
- UID do usuário (se autenticado)
- Timestamp
- Resumo do body (primeiros 500 chars)
- IP de origem

## 9. Fluxo de cadastro

1. Profissional preenche formulário no site
2. Frontend valida os dados
3. Envia POST para `/api/register`
4. Backend cria usuário no Firebase Auth
5. Backend salva perfil no Firestore
6. Backend cria assinatura no Mercado Pago
7. Retorna `paymentUrl` para o frontend
8. Frontend redireciona para o Mercado Pago
9. Após pagamento, MP redireciona para `/pagamento-sucesso` ou `/pagamento-erro`
10. Webhook do MP atualiza status no Firestore

## 10. Testar localmente

```bash
cd functions
npm run serve
```

## 11. Painel Admin

Acesse `/admin` no app (requer login com conta que tenha claim `admin: true`).

Funcionalidades:
- **Dashboard**: Visão geral com contadores
- **Usuários**: Criar, listar e editar profissionais
- **Pagamentos**: Visualizar histórico de pagamentos
- **Logs**: Acompanhar todas as interações POST/PUT
- **Contatos**: Gerenciar formulários de contato recebidos
