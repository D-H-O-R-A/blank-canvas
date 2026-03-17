/**
 * =========================================================================
 * routes/public.js — Endpoints públicos (sem autenticação)
 * =========================================================================
 */

const express = require("express");
const router = express.Router();
const { admin, db, mercadoPagoToken, APP_BASE_URL, PLAN_CONFIG } = require("../config");
const { requireAuth } = require("../middleware/auth");
const { logError } = require("../middleware/logger");

// ===================== VALIDATION HELPERS =====================

function validateEmail(email) {
  if (!email || email.length > 255) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

function validateName(name) {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
}

function validatePassword(password) {
  return password && password.length >= 6 && password.length <= 128;
}

// ----- POST /register -----
router.post("/register", async (req, res) => {
  try {
    const { name, email, whatsapp, profession, password, plan, birthDate } = req.body;

    if (!validateName(name)) return res.status(400).json({ error: "Nome deve ter entre 2 e 100 caracteres" });
    if (!validateEmail(email)) return res.status(400).json({ error: "E-mail inválido (máx. 255 caracteres)" });
    if (!validatePassword(password)) return res.status(400).json({ error: "Senha deve ter entre 6 e 128 caracteres" });
    if (!plan) return res.status(400).json({ error: "Plano é obrigatório" });
    if (!whatsapp || !validatePhone(whatsapp)) return res.status(400).json({ error: "WhatsApp inválido (10-11 dígitos)" });
    if (profession && profession.length > 100) return res.status(400).json({ error: "Profissão muito longa (máx. 100 caracteres)" });

    let userRecord;
    try {
      userRecord = await admin.auth().createUser({ email: email.trim(), password, displayName: name.trim() });
    } catch (authError) {
      if (authError.code === "auth/email-already-exists") {
        return res.status(409).json({ error: "E-mail já cadastrado. Faça login.", code: "EMAIL_EXISTS" });
      }
      throw authError;
    }

    const uid = userRecord.uid;
    const selectedPlan = PLAN_CONFIG[plan] || PLAN_CONFIG["1 mês"];

    await db.collection("professionals").doc(uid).set({
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      profession: (profession || "").trim().slice(0, 100),
      plan,
      birthDate: birthDate || null,
      subscriptionStatus: "pending",
      about: "",
      socialLinks: { instagram: "", facebook: "", linkedin: "", website: "" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const mpToken = mercadoPagoToken.value();
    if (!mpToken) {
      return res.status(500).json({ error: "Mercado Pago não configurado." });
    }

    const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${mpToken}` },
      body: JSON.stringify({
        reason: `Click Serviços - Plano ${plan}`,
        auto_recurring: {
          frequency: selectedPlan.frequency,
          frequency_type: "months",
          transaction_amount: selectedPlan.amount,
          currency_id: "BRL",
        },
        payer_email: email.trim(),
        back_url: `${APP_BASE_URL}/pagamento-sucesso`,
        external_reference: uid,
      }),
    });

    const mpData = await mpResponse.json();
    if (!mpResponse.ok) {
      console.error("Mercado Pago error:", mpData);
      return res.status(500).json({ error: "Erro ao criar assinatura no Mercado Pago" });
    }

    await db.collection("professionals").doc(uid).update({ mercadoPagoPreapprovalId: mpData.id });

    return res.status(200).json({ paymentUrl: mpData.init_point });
  } catch (error) {
    console.error("register error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message || "Erro interno" });
  }
});

// ----- POST /contact -----
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!validateName(name)) return res.status(400).json({ error: "Nome deve ter entre 2 e 100 caracteres" });
    if (!validateEmail(email)) return res.status(400).json({ error: "E-mail inválido" });
    if (!subject || subject.length > 100) return res.status(400).json({ error: "Assunto inválido" });
    if (!message || message.trim().length < 5 || message.length > 1000) return res.status(400).json({ error: "Mensagem deve ter entre 5 e 1000 caracteres" });
    if (phone && phone.length > 20) return res.status(400).json({ error: "Telefone inválido" });

    const docRef = await db.collection("contacts").add({
      name: name.trim(),
      email: email.trim(),
      phone: (phone || "").trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: "pending",
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true, id: docRef.id });
  } catch (error) {
    console.error("contact error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message || "Erro interno" });
  }
});

// ----- POST /webhook/mercadopago -----
router.post("/webhook/mercadopago", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "subscription_preapproval" && data?.id) {
      const mpToken = mercadoPagoToken.value();
      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
        headers: { Authorization: `Bearer ${mpToken}` },
      });
      const preapproval = await mpRes.json();

      const uid = preapproval.external_reference;
      if (uid) {
        if (preapproval.status === "authorized") {
          const now = new Date();
          const paidUntil = new Date(now);
          paidUntil.setMonth(paidUntil.getMonth() + (preapproval.auto_recurring?.frequency || 1));

          await db.collection("professionals").doc(uid).update({
            subscriptionStatus: "active",
            paidUntil: paidUntil.toISOString(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          await db.collection("professionals").doc(uid).collection("payments").add({
            preapprovalId: data.id,
            status: "authorized",
            amount: preapproval.auto_recurring?.transaction_amount,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            paidUntil: paidUntil.toISOString(),
          });
        } else if (preapproval.status === "cancelled") {
          await db.collection("professionals").doc(uid).update({
            subscriptionStatus: "cancelled",
            cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          await db.collection("logs").add({
            type: "subscription_cancelled_webhook",
            uid,
            preapprovalId: data.id,
            timestamp: new Date().toISOString(),
          });
        } else if (preapproval.status === "paused") {
          await db.collection("professionals").doc(uid).update({
            subscriptionStatus: "paused",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    await logError(req, error);
    return res.status(200).json({ ok: true });
  }
});

// ----- GET /check-role -----
router.get("/check-role", requireAuth, async (req, res) => {
  try {
    const [adminDoc, recruiterDoc, professionalDoc] = await Promise.all([
      db.collection("admin").doc(req.uid).get(),
      db.collection("recruiters").doc(req.uid).get(),
      db.collection("professionals").doc(req.uid).get(),
    ]);
    return res.status(200).json({
      isAdmin: adminDoc.exists && adminDoc.data().isadmin === true,
      isRecruiter: recruiterDoc.exists,
      isProfessional: professionalDoc.exists,
    });
  } catch (error) {
    console.error("check-role error:", error);
    await logError(req, error);
    return res.status(500).json({ error: "Erro ao verificar papel" });
  }
});

module.exports = router;
