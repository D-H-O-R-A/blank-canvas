/**
 * =========================================================================
 * webhook.js — Cloud Function dedicada para webhooks do Mercado Pago
 * =========================================================================
 */

const express = require("express");
const cors = require("cors");
const { admin, db, mercadoPagoToken, PLAN_CONFIG } = require("./config");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

async function logError(error, context = {}) {
  try {
    await db.collection("logs").add({
      type: "error",
      endpoint: "/webhook",
      method: "POST",
      uid: context.uid || null,
      timestamp: new Date().toISOString(),
      error: error?.message || String(error),
      stack: error?.stack || null,
      body: JSON.stringify(context).slice(0, 500),
      ip: "mercadopago-webhook",
    });
  } catch (e) {
    console.error("webhook logError failed:", e.message);
  }
}

async function findProfessionalByEmail(email) {
  const snap = await db.collection("professionals").where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { uid: doc.id, data: doc.data() };
}

function calcPaidUntil(frequencyMonths) {
  const now = new Date();
  now.setMonth(now.getMonth() + frequencyMonths);
  return now.toISOString();
}

async function logEvent(event, details) {
  try {
    await db.collection("logs").add({
      type: "action",
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

async function fetchPreapproval(id) {
  const res = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${mercadoPagoToken.value()}` },
  });
  if (!res.ok) throw new Error(`MP preapproval ${id} returned ${res.status}`);
  return res.json();
}

async function fetchPayment(id) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${mercadoPagoToken.value()}` },
  });
  if (!res.ok) throw new Error(`MP payment ${id} returned ${res.status}`);
  return res.json();
}

async function handleRecruiterCommission(recruiterUid, clientUid, amount) {
  try {
    const recruiterDoc = await db.collection("recruiters").doc(recruiterUid).get();
    if (!recruiterDoc.exists) return;

    const recruiterData = recruiterDoc.data();
    const commissionPercent = recruiterData.commissionPercent || 25;
    const commissionAmount = (amount * commissionPercent) / 100;

    // Update recruiter client record
    const clientRef = db.collection("recruiters").doc(recruiterUid).collection("clients").doc(clientUid);
    const clientDoc = await clientRef.get();
    if (clientDoc.exists) {
      await clientRef.update({
        paymentStatus: "paid",
        commissionAmount,
        paidAt: new Date().toISOString(),
      });
    }

    // Update recruiter totals
    await db.collection("recruiters").doc(recruiterUid).update({
      totalCommission: admin.firestore.FieldValue.increment(commissionAmount),
      availableBalance: admin.firestore.FieldValue.increment(commissionAmount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logEvent("recruiter_commission", { recruiterUid, clientUid, commissionAmount, commissionPercent });
  } catch (e) {
    console.error("handleRecruiterCommission error:", e.message);
  }
}
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${mercadoPagoToken.value()}` },
  });
  if (!res.ok) throw new Error(`MP payment ${id} returned ${res.status}`);
  return res.json();
}

async function handlePreapproval(dataId) {
  const preapproval = await fetchPreapproval(dataId);
  const email = preapproval.payer_email;

  if (!email) {
    await logEvent("preapproval_no_email", { dataId });
    return;
  }

  const pro = await findProfessionalByEmail(email);
  if (!pro) {
    await logEvent("preapproval_user_not_found", { dataId, email });
    return;
  }

  const status = preapproval.status;
  let subscriptionStatus = "pending";
  let paidUntil = pro.data.paidUntil || null;

  if (status === "authorized") {
    subscriptionStatus = "active";
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

  await db.collection("professionals").doc(pro.uid).collection("payments").add({
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

  await logEvent("preapproval_processed", { dataId, email, uid: pro.uid, status, subscriptionStatus, paidUntil });
}

async function handlePayment(dataId) {
  const payment = await fetchPayment(dataId);
  const email = payment.payer?.email || null;

  if (!email) {
    await logEvent("payment_no_email", { dataId });
    return;
  }

  const pro = await findProfessionalByEmail(email);
  if (!pro) {
    await logEvent("payment_user_not_found", { dataId, email });
    return;
  }

  const status = payment.status;

  if (status === "approved") {
    const planConfig = PLAN_CONFIG[pro.data.plan] || { frequency: 1 };
    const paidUntil = calcPaidUntil(planConfig.frequency);

    await db.collection("professionals").doc(pro.uid).update({
      subscriptionStatus: "active",
      paidUntil,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("professionals").doc(pro.uid).collection("payments").add({
      type: "payment", paymentId: dataId, status, email,
      amount: payment.transaction_amount || null, currency: payment.currency_id || "BRL",
      paidAt: new Date().toISOString(), paidUntil, rawStatus: status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Handle recruiter commission
    if (pro.data.recruitedBy) {
      await handleRecruiterCommission(pro.data.recruitedBy, pro.uid, payment.transaction_amount || 0);
    }

    await logEvent("payment_approved", { dataId, email, uid: pro.uid, amount: payment.transaction_amount, paidUntil });
  } else {
    await db.collection("professionals").doc(pro.uid).collection("payments").add({
      type: "payment", paymentId: dataId, status, email,
      amount: payment.transaction_amount || null, currency: payment.currency_id || "BRL",
      paidAt: new Date().toISOString(), paidUntil: null, rawStatus: status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logEvent("payment_not_approved", { dataId, email, uid: pro.uid, status });
  }
}

app.post("/", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data?.id) {
      return res.status(200).json({ ok: true, message: "ignored" });
    }

    if (type === "subscription_preapproval") {
      await handlePreapproval(data.id);
    } else if (type === "payment") {
      await handlePayment(data.id);
    } else {
      await logEvent("webhook_ignored", { type, dataId: data.id });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    await logError(error, { type: req.body?.type, dataId: req.body?.data?.id });
    return res.status(200).json({ ok: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "webhook online" });
});

module.exports = app;
