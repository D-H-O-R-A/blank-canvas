/**
 * =========================================================================
 * routes/public.js — Endpoints públicos (sem autenticação)
 * =========================================================================
 *
 * Rotas que não exigem JWT:
 *
 * POST /register
 *   Cria usuário no Firebase Auth, perfil no Firestore e assinatura no MP.
 *   Body: { name, email, password, whatsapp, profession?, plan }
 *   Retorna: { paymentUrl: string }
 *
 * POST /contact
 *   Salva formulário de contato no Firestore.
 *   Body: { name, email, phone?, subject, message }
 *   Retorna: { ok: true, id: string }
 *
 * POST /webhook/mercadopago
 *   Recebe notificações do Mercado Pago sobre assinaturas.
 *   Body: { type, data: { id } }
 *   Retorna: { ok: true }
 * =========================================================================
 */

const express = require("express");
const router = express.Router();
const { admin, db, mercadoPagoToken, APP_BASE_URL, PLAN_CONFIG } = require("../config");

// ----- POST /register -----
router.post("/register", async (req, res) => {
  try {
    const { name, email, whatsapp, profession, password, plan } = req.body;

    if (!name || !email || !password || !plan || !whatsapp) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    let userRecord;
    try {
      userRecord = await admin.auth().createUser({ email, password, displayName: name });
    } catch (authError) {
      if (authError.code === "auth/email-already-exists") {
        return res.status(409).json({ error: "E-mail já cadastrado. Faça login.", code: "EMAIL_EXISTS" });
      }
      throw authError;
    }

    const uid = userRecord.uid;
    const selectedPlan = PLAN_CONFIG[plan] || PLAN_CONFIG["1 mês"];

    await db.collection("professionals").doc(uid).set({
      name,
      email,
      whatsapp,
      profession: profession || "",
      plan,
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
        payer_email: email,
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
    return res.status(500).json({ error: error.message || "Erro interno" });
  }
});

// ----- POST /contact -----
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Preencha nome, e-mail, assunto e mensagem" });
    }
    if (name.length > 100 || email.length > 255 || message.length > 1000) {
      return res.status(400).json({ error: "Dados excedem o tamanho máximo permitido" });
    }

    const docRef = await db.collection("contacts").add({
      name: name.trim(),
      email: email.trim(),
      phone: (phone || "").trim(),
      subject: subject.trim(),
      message: message.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true, id: docRef.id });
  } catch (error) {
    console.error("contact error:", error);
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

      if (preapproval.status === "authorized") {
        const uid = preapproval.external_reference;
        if (uid) {
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
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json({ ok: true });
  }
});

module.exports = router;
