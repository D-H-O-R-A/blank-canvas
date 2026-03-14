/**
 * =========================================================================
 * webhook.js — Cloud Function dedicada para webhooks do Mercado Pago
 * =========================================================================
 *
 * Recebe notificações do Mercado Pago (subscription_preapproval e payment),
 * identifica o profissional pelo e-mail do pagador, atualiza status de
 * assinatura e registra histórico de pagamentos.
 *
 * URL: https://us-central1-click-servico.cloudfunctions.net/webhook
 *
 * CONFIGURAÇÃO NO MERCADO PAGO:
 *   Webhook URL → https://us-central1-click-servico.cloudfunctions.net/webhook
 *   Eventos: payment, subscription_preapproval
 * =========================================================================
 */

const express = require("express");
const cors = require("cors");
const { admin, db, mercadoPagoToken, PLAN_CONFIG } = require("./config");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * Busca profissional pelo e-mail no Firestore.
 * Retorna { uid, data } ou null se não encontrado.
 */
async function findProfessionalByEmail(email) {
  const snap = await db
    .collection("professionals")
    .where("email", "==", email)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { uid: doc.id, data: doc.data() };
}

/**
 * Calcula nova data paidUntil somando meses a partir de AGORA.
 */
function calcPaidUntil(frequencyMonths) {
  const now = new Date();
  now.setMonth(now.getMonth() + frequencyMonths);
  return now.toISOString();
}

/**
 * Registra log no Firestore.
 */
async function logEvent(event, details) {
  try {
    await db.collection("logs").add({
      endpoint: "/webhook",
      method: "POST",
      uid: details.uid || null,
      timestamp: new Date().toISOString(),
      summary: JSON.stringify({ event, ...details }).slice(0, 500),
      ip: "mercadopago-webhook",
    });
  } catch (e) {
    console.error("webhook logEvent error:", e.message);
  }
}

/**
 * Busca detalhes de um preapproval (assinatura) na API do Mercado Pago.
 */
async function fetchPreapproval(id) {
  const res = await fetch(
    `https://api.mercadopago.com/preapproval/${id}`,
    {
      headers: { Authorization: `Bearer ${mercadoPagoToken.value()}` },
    }
  );
  if (!res.ok) throw new Error(`MP preapproval ${id} returned ${res.status}`);
  return res.json();
}

/**
 * Busca detalhes de um pagamento na API do Mercado Pago.
 */
async function fetchPayment(id) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${id}`,
    {
      headers: { Authorization: `Bearer ${mercadoPagoToken.value()}` },
    }
  );
  if (!res.ok) throw new Error(`MP payment ${id} returned ${res.status}`);
  return res.json();
}

/**
 * Processa notificação de subscription_preapproval.
 */
async function handlePreapproval(dataId) {
  const preapproval = await fetchPreapproval(dataId);
  const email = preapproval.payer_email;

  if (!email) {
    console.warn("Preapproval sem payer_email:", dataId);
    await logEvent("preapproval_no_email", { dataId });
    return;
  }

  const pro = await findProfessionalByEmail(email);
  if (!pro) {
    console.warn("Profissional não encontrado para e-mail:", email);
    await logEvent("preapproval_user_not_found", { dataId, email });
    return;
  }

  const status = preapproval.status; // authorized, paused, cancelled, pending
  let subscriptionStatus = "pending";
  let paidUntil = pro.data.paidUntil || null;

  if (status === "authorized") {
    subscriptionStatus = "active";
    // Determinar frequência pelo plano do profissional
    const planConfig = PLAN_CONFIG[pro.data.plan] || { frequency: 1 };
    paidUntil = calcPaidUntil(planConfig.frequency);
  } else if (status === "paused") {
    subscriptionStatus = "paused";
  } else if (status === "cancelled") {
    subscriptionStatus = "cancelled";
  }

  await db.collection("professionals").doc(pro.uid).update({
    subscriptionStatus,
    paidUntil,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Registrar pagamento na subcollection
  await db
    .collection("professionals")
    .doc(pro.uid)
    .collection("payments")
    .add({
      type: "subscription_preapproval",
      preapprovalId: dataId,
      status,
      email,
      amount: preapproval.auto_recurring?.transaction_amount || null,
      currency: preapproval.auto_recurring?.currency_id || "BRL",
      paidAt: new Date().toISOString(),
      paidUntil,
      rawStatus: status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  await logEvent("preapproval_processed", {
    dataId,
    email,
    uid: pro.uid,
    status,
    subscriptionStatus,
    paidUntil,
  });

  console.log(`Preapproval ${dataId} processado: ${email} → ${subscriptionStatus}`);
}

/**
 * Processa notificação de payment.
 */
async function handlePayment(dataId) {
  const payment = await fetchPayment(dataId);
  const email =
    payment.payer?.email ||
    payment.additional_info?.payer?.first_name ||
    null;

  if (!email) {
    console.warn("Payment sem payer email:", dataId);
    await logEvent("payment_no_email", { dataId });
    return;
  }

  const pro = await findProfessionalByEmail(email);
  if (!pro) {
    console.warn("Profissional não encontrado para e-mail:", email);
    await logEvent("payment_user_not_found", { dataId, email });
    return;
  }

  const status = payment.status; // approved, pending, rejected, cancelled, etc.

  if (status === "approved") {
    const planConfig = PLAN_CONFIG[pro.data.plan] || { frequency: 1 };
    const paidUntil = calcPaidUntil(planConfig.frequency);

    await db.collection("professionals").doc(pro.uid).update({
      subscriptionStatus: "active",
      paidUntil,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Registrar pagamento
    await db
      .collection("professionals")
      .doc(pro.uid)
      .collection("payments")
      .add({
        type: "payment",
        paymentId: dataId,
        status,
        email,
        amount: payment.transaction_amount || null,
        currency: payment.currency_id || "BRL",
        paidAt: new Date().toISOString(),
        paidUntil,
        rawStatus: status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    await logEvent("payment_approved", {
      dataId,
      email,
      uid: pro.uid,
      amount: payment.transaction_amount,
      paidUntil,
    });

    console.log(`Payment ${dataId} aprovado: ${email} → active`);
  } else {
    // Registrar pagamento com status não-aprovado
    await db
      .collection("professionals")
      .doc(pro.uid)
      .collection("payments")
      .add({
        type: "payment",
        paymentId: dataId,
        status,
        email,
        amount: payment.transaction_amount || null,
        currency: payment.currency_id || "BRL",
        paidAt: new Date().toISOString(),
        paidUntil: null,
        rawStatus: status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    await logEvent("payment_not_approved", {
      dataId,
      email,
      uid: pro.uid,
      status,
    });

    console.log(`Payment ${dataId} não aprovado (${status}): ${email}`);
  }
}

// ----- POST / (webhook receiver) -----
app.post("/", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data?.id) {
      console.warn("Webhook recebido sem type ou data.id:", req.body);
      return res.status(200).json({ ok: true, message: "ignored" });
    }

    console.log(`Webhook recebido: type=${type}, id=${data.id}`);

    if (type === "subscription_preapproval") {
      await handlePreapproval(data.id);
    } else if (type === "payment") {
      await handlePayment(data.id);
    } else {
      console.log(`Tipo de webhook ignorado: ${type}`);
      await logEvent("webhook_ignored", { type, dataId: data.id });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Sempre retornar 200 para o Mercado Pago não reenviar
    return res.status(200).json({ ok: false, error: error.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ status: "webhook online" });
});

module.exports = app;
