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

## 4. URLs das funções (após deploy)

Após o deploy, as URLs serão:

- `https://us-central1-click-servico.cloudfunctions.net/createSubscription`
- `https://us-central1-click-servico.cloudfunctions.net/mercadoPagoWebhook`
- `https://us-central1-click-servico.cloudfunctions.net/getProfile`
- `https://us-central1-click-servico.cloudfunctions.net/updateProfile`

## 5. Configurar o Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Na seção **Webhooks**, configure:
   - **URL**: `https://us-central1-click-servico.cloudfunctions.net/mercadoPagoWebhook`
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

## 7. Modelo de cobrança

- **Recorrência**: Cartão de crédito mensal via Mercado Pago Preapproval
- **Cancelamento**: Manual (cliente deve entrar em contato)
- **Monitoramento**: Verificar o campo `paidUntil` no Firestore para acompanhar vencimentos

## 8. Testar localmente

```bash
cd functions
npm run serve
```

Isso inicia o emulador do Firebase Functions localmente.
