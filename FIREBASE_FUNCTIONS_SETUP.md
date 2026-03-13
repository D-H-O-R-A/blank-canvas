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
firebase functions:config:set mercadopago.access_token="APP_USR-xxxx-xxxx"
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

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/register` | Público | Cria usuário + assinatura MP |
| POST | `/webhook/mercadopago` | Público | Webhook do Mercado Pago |
| GET | `/profile` | Bearer JWT | Retorna perfil do profissional |
| PUT | `/profile` | Bearer JWT | Atualiza perfil |
| POST | `/create-payment` | Bearer JWT | Gera novo link de pagamento |

## 5. Configurar o Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Na seção **Webhooks**, configure:
   - **URL**: `https://us-central1-click-servico.cloudfunctions.net/api/webhook/mercadopago`
   - **Eventos**: `subscription_preapproval`

## 6. Firestore - Estrutura dos dados

```
professionals/{uid}
├── name: string
├── email: string
├── whatsapp: string
├── profession: string
├── plan: "1 mês" | "6 meses"
├── subscriptionStatus: "pending" | "active"
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
```

## 7. Fluxo de cadastro

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

## 8. Testar localmente

```bash
cd functions
npm run serve
```
